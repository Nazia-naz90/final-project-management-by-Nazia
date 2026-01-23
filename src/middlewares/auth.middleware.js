// src\middlewares\auth.middleware.js
import { asyncHandler } from "../utils/async-handler.js";
import {userTable} from "../models/user.models.js" ;
import jwt from "jsonwebtoken";
import { ApiError} from "../utils/api-errors.js";


export const verifyJWT = asyncHandler(async (req,res,next)=>{
    // getting client token from cookies
    const token = req.cookies?.accessToken

    // if token is not present throw error
    if(!token){
        throw new ApiError (401, "Access token is missing, please login to continue");
    }

    try {
        // Token decoded from jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

       // find the user associated with the token
        const user = await userTable.findById(decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry");

        // if user does not exist throw error
        if(!user){
            throw new ApiError (404, "User associated with this token does not exist");
        }

        // attach user to request object
        req.user = user;
        next(); // proceed to next api function

    } catch (error) {
        throw new ApiError (401, "Invalid or expired access token, please login again");
        
    }

})



