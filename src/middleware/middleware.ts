import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

export const userMiddleware = (req : Request, res : Response , next : NextFunction)=>{
    try{
        const token: string | undefined = req.headers["authorization"]?.split(" ")[1]
        console.log(token)
    if(!token){
         res.status(401).json({message : "Unauthorized" })
    }
    const decoded = jwt.verify(token as string ,process.env.JWT_Secret as string)
    console.log(decoded)
    if (decoded){
        //@ts-ignore
        req.userId = decoded.id
        next()
    }
    else {
        res.status(403).json({
            message : "You are not logged in"
        })
    }
    }
    catch(err){
        console.log(err)
        res.status(500).json({message : "Internal Server Error" })
    }
}