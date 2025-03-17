import { User } from "../modals/userSchema"
import { userSchemaValidation } from "./../zod/zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();
import { Request, Response } from "express";
import { Iot } from "../modals/iotSchema";
// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsedData = userSchemaValidation.safeParse(req.body)
    if (parsedData.success) {
      const { username, password } = parsedData.data
      const salt = await bcrypt.genSalt(5);
      const hashedPassword = await bcrypt.hash(password, salt)

      const iot = await Iot.findOne({ uniqeId: req.uniqueIotId })
      if (!iot) {
        res.status(400).json(
          { message: "Iot device not found" }
        )
        return
      }
      const user = await User.create({
        username: username,
        password: hashedPassword,
        iot : [iot]
      })
      await iot.updateOne({
        owner: user._id
      })
      const token = jwt.sign({
        id: user._id
      }, process.env.JWT_Secret as string)
      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
      });


      res.status(201).json({
        message: "User created successfully",
      })
    }
    else {
      res.status(400).json({
        message: "bad request",
        error: parsedData.error
      })
    }
  }
  catch(err:any) {
    res.status(500).json({
      message: err.message
    })
  }

}

// Login user
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({
    username: username
  })

  if (existingUser) {
    const verification = await bcrypt.compare(password, existingUser.password as string)
    if (verification) {
      const token = jwt.sign({
        id: existingUser._id
      }, process.env.JWT_Secret as string)
      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
      });
      res.json(token)
    }
    else {
      res.status(401).json({
        message: "Invalid Password"
      })
    }
  }
  else {
    res.status(403).json({
      message: "Incorrect credentials"
    })
  }
}

//logout user
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", (error as Error).message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get profile
export const getProfile = async (req: Request, res: Response) => {
  //@ts-ignore
  const user = await User.findById(req.userId)
  .populate({
    path: 'items.itemId',
    model: 'Item' // The name of the model for the referenced items
  })
  .exec();
  res.status(200).json(user);
}

//check
export const checkAuth = async(req:Request, res:Response) => {
  try {
      //@ts-ignore
      const user = await User.findById(req.userId)  
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkAuth controller", (error as Error).message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
