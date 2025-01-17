import { Admin } from "../modals/adminSchema"
import { adminSchemaValidation } from "./../zod/zod"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
import { Request, Response } from "express";
import { Iot } from "../modals/iotSchema";

// Register a new admin
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const parsedData = adminSchemaValidation.safeParse(req.body)

    if (parsedData.success) {
      const { username, password, email } = parsedData.data
      const salt = await bcrypt.genSalt(5);
      const hashedPassword = await bcrypt.hash(password, salt)

      const admin = await Admin.create({
        username: username,
        password: hashedPassword,
        email: email
      })

      const token = jwt.sign({
        id: admin._id
      }, process.env.JWT_Secret as string)
      res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
      });


      res.status(201).json({
        message: "Admin created successfully",
      })
    }
    else {
      res.status(400).json({
        message: "bad request",
        error: parsedData.error
      })
    }
  }
  catch {
    res.status(403).json({
      message: "Admin already exist"
    })
  }

}

// Login admin
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const existingUser = await Admin.findOne({
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

//logout admin
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", (error as Error).message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

//update admin
export const updateAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email } = req.body;
  const existingUser = await Admin.findOne({
    _id: id
  })
  if (existingUser) {
    const updatedUser = await Admin.findByIdAndUpdate(id, {
      email: email
    }, {
      new: true
    })
    res.status(200).json(updatedUser)
  }
  else {
    res.status(404).json({ message: "User not found" })
  }
}

//delete admin
export const deleteAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingUser = await Admin.findOne({ _id: id });
  if (existingUser) {
    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
}


// Get admin
export const getAdmin = async (req: Request, res: Response) => {
  const user = await Admin.findById(req.adminId)
  res.status(200).json(user);
}

//generate new iot id
export const generateIotId = async (req: Request, res: Response) => {
  try {
    const uniqeId = uuidv4().replace(/\D/g, '').slice(0, 10);
    const newIot = new Iot({ uniqeId: uniqeId });
    await newIot.save();
    res.status(200).json({ uniqeId: uniqeId });
  }
  catch (error) {
    res.status(500).json({ message: "Error generating IoT ID" });
  }

}