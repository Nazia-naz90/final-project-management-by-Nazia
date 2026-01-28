// src\controllers\auth.controllers.js
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { userTable } from "../models/user.models.js";
import { sendEmail, emailVerificationMailGenContent } from "../utils/mail.js";
import crypto from "crypto";

// --------------- Register User Controller --------------
const registerUser = asyncHandler(async (req, res) => {
  // Getting data from request.body OR Client
  const { username, email, password } = req.body;
  const existingUser = await userTable.findOne({
    // Check if user with given email or username already exists
    $or: [{ email }, { username }],
  });

  // If user exists, throw error
  if (existingUser) {
    throw new ApiError(400, "User with given email username already exists:");
  }

  // Create new user
  const newUser = await userTable.create({
    email,
    username,
    password,
    isEmailVerified: false,
  });

  // Create temporary token for email verification
  const { unHashedToken, hashedToken, tokenExpiry } =
    newUser.generateTemporaryToken();
  newUser.emailVerificationToken = hashedToken;
  newUser.emailVerificationTokenExpiry = tokenExpiry;
  await newUser.save({ validateBeforeSave: false });

  // Sending Email
  await sendEmail({
    email: newUser.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailGenContent(
      newUser.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  // Excluding fields from database
  const createdUser = await userTable
    .findById(newUser._id)
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
    );

  //
  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  } else {
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user: createdUser },
          "User registered successfully",
        ),
      );
  }
});

// --------------- Login User Controller --------------
const login = asyncHandler(async (req, res) => {
  // Getting data from client
  const { email, password } = req.body;
  // Check if email exists
  if (!email) {
    throw new ApiError(400, "Email is required to login");
  }

  // check if user exists in database
  const existingUser = await userTable.findOne({ email });

  // if user does not exist throw error
  if (!existingUser) {
    throw new ApiError(
      404,
      "User with given email does not exist, please register",
    );
  }

  // check if password is correct
  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

  // if password is incorrect throw error
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password, please try again");
  }

  // generate access token
  const accessToken = existingUser.generateAccessToken();
  // generate refresh token
  const refreshToken = existingUser.generateRefreshToken();

  // Setting cookies options
  const options = {
    httpOnly: true,
    secure: true,
  };
  // returning response to client with user details and tokens
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
          },
          accessToken,
          refreshToken,
        },
        "✅ User logged in successfully",
      ),
    );
});

// ---------------- Verify Email Controller ----------------
const verifyEmail = asyncHandler(async (req, res) => {
  // verification token from params/url
  const { verificationToken } = req.params;

  // if token is not present throw error
  if (!verificationToken) {
    throw new ApiError(400, "🚫 Verification token is missing");
  }

  // hashed the received token to compare with database
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // find user with the hashed token and check if token is not expired
  const user = await userTable.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  // if user is not found throw error
  if (!user) {
    throw new ApiError(400, "🚫 Invalid or expired verification token");
  }

  // update user verification status
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;

  // save user
  await user.save({ validateBeforeSave: false });

  // send response to client
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully"));
});

// --------------- Logout User Controller --------------
const logoutUser = asyncHandler(async (req, res) => {
  // Clear refresh token from database
  await userTable.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "" },
    },
    {
      new: true,
    },
  );
  // Options to clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };
  // Sending response to client
  return res
    .status(200)
    .clearCookie("refreshToken" , options)
    .clearCookie("accessToken" , options)
    .json(new ApiResponse(200, null, "✅ User logged out successfully"));
});




// ---------------- Resend Email Verification Controller ----------------
const resendEmailVerification = asyncHandler(async (req, res) => {
    
  // Getting request from req.body
  const { email } = req.body;

  // Find user with given email
  const user = await userTable.findOne({ email });
  

  // If user is not found throw error
  if(!user){
    throw new ApiError(404, "User not found");
  }

  // if user is already verified, throw error
  if(user.isEmailVerified){
    throw new ApiError(400, "Email is already verified");
  }

   // Create temporary token for email verification
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  // Sending Email
  await sendEmail({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailGenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });

  // Sending response to client
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification email resent successfully"));


});

// --------------- Get Current User Controller --------------

const getCurrentUser = asyncHandler(async (req, res) => {
   
  // Sending response to client with current user details from req.user set in verifyJWT middleware
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req.user },
        "✅ Current user fetched successfully",
      ),
    );

});



export { registerUser, login, verifyEmail, resendEmailVerification, logoutUser, getCurrentUser };
