// src\controllers\healthCheck.controllers.js

import {ApiResponse} from "../utils/api-response.js"
import {asyncHandler} from "../utils/async-handler.js"

// ------------------ Health Check Controller ------------------ //

const  healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200,null,"✅ Server is healthy"));
})

export {healthCheck};