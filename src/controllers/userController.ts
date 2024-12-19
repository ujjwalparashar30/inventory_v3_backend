import {User} from "../modals/userSchema"
import {userSchemaValidation} from "./../zod/zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();
import { Request, Response } from "express";
// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {const parsedData = userSchemaValidation.safeParse(req.body)

    if(parsedData.success){
        const {username, password} = parsedData.data
        const salt = await bcrypt.genSalt(5);
        const hashedPassword = await bcrypt.hash(password,salt)

        await User.create({
        username:username,
        password:hashedPassword
    })
    res.status(201).json({
      message: "User created successfully",
    })
    }
    else {
        res.status(400).json({
            message : "bad request",
            error : parsedData.error
        })
    }}
    catch{
        res.status(403).json({
            message : "user already exist"
            })
    }
    
}

// Login user
export const loginUser = async(req:Request, res:Response) => {
  const {username,password} = req.body;
    const existingUser = await User.findOne({
        username:username
    })

    if(existingUser){
        const verification = await bcrypt.compare(password,existingUser.password as string)
        if(verification){
        const token = jwt.sign({
            id : existingUser._id
        },process.env.JWT_Secret as string)
        res.json(token)
    }
    else{
        res.status(401).json({
            message : "Invalid Password"
            })
    }
}
    else{
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
}

// Get profile
export const getProfile = async(req:Request, res:Response) => {
  //@ts-ignore
  const user = await User.findById(req.userId)
  res.status(200).json(user);
}
