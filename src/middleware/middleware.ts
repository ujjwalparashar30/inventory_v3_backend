import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import { Iot } from "../modals/iotSchema";

dotenv.config();

export const userMiddleware = (req : Request, res : Response , next : NextFunction)=>{
    try{
        const token: string | undefined = req.cookies.jwt;
        console.log(token)
    if(!token){
         res.status(401).json({message : "Unauthorized" })
    }
    const decoded = jwt.verify(token as string ,process.env.JWT_Secret as string) as {id : string}
    console.log(decoded)
    if (decoded){
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

export const iotMiddleware =async (req:Request , res: Response , next : NextFunction)=>{
    try{
        const {uniqueIotId} = req.body
        const iot = await Iot.findOne({uniqeId : uniqueIotId})
        if(!iot){
            res.status(404).json({message : "Iot not found" })
            }
            req.uniqueIotId = uniqueIotId
            next()
            }
            catch(err){
                res.status(500).json({
                    message : "Internal Server Error"
                })
                }
}

export const isAdmin = (req: Request , res: Response, next: NextFunction)=>{
    try{
        const token: string | undefined = req.cookies.jwt;
        console.log(token)
    if(!token){
         res.status(401).json({message : "Unauthorized" })
    }
    const decoded = jwt.verify(token as string ,process.env.JWT_Secret as string) as {id : string}
    console.log(decoded)
    if (decoded){
        req.adminId = decoded.id
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