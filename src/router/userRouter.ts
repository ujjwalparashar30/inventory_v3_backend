import express from "express";
import { registerUser, loginUser, getProfile, logoutUser, checkAuth } from "../controllers/userController";
import { iotMiddleware, userMiddleware } from "../middleware/middleware";

const userRouter = express.Router();

// Register route
userRouter.post('/register',iotMiddleware, registerUser);

// Login route
userRouter.post('/login', loginUser);

//logout route
userRouter.post("/logout",logoutUser)

// Profile route
userRouter.get('/profile',userMiddleware, getProfile);

//check
userRouter.get("/check",userMiddleware,checkAuth)

// Export the router
export default userRouter;
