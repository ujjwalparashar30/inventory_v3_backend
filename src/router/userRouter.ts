import express from "express";
import { registerUser, loginUser, getProfile } from "../controllers/userController";
import { userMiddleware } from "../middleware/middleware";

const userRouter = express.Router();

// Register route
userRouter.post('/register', registerUser);

// Login route
userRouter.post('/login', loginUser);

// Profile route
userRouter.get('/profile',userMiddleware, getProfile);

// Export the router
export default userRouter;
