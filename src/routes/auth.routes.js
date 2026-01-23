// src\routes\auth.routes.js
import express from "express";
import {
  registerUser,
  login,
  verifyEmail,
  resendEmailVerification,
  logoutUser,
  getCurrentUser
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ----------- AUTH ROUTES -----------

// --------------- Register route --------------
// localhost:8000/api/v1/auth/register = signup route
router.route("/register").post(registerUser); // user registration route

// ------------------- Verify Email Route -------------------
router.route("/verify-email/:verificationToken").get(verifyEmail);

// ------------------- Resend Email Verification Route -------------------
router.route("/resend-verification-email").get( verifyJWT, resendEmailVerification);

// --------------- Login route --------------
router.route("/login").post(login); // user login route

// -------------- logout route --------------
router.route("/logout").post(verifyJWT, logoutUser); // user logout route

// -------------- Current User route --------------
router.route("/current-user").post(verifyJWT, getCurrentUser); // get current logged in user route

export default router;
