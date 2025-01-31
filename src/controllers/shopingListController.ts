import { Request, Response } from "express";
import { User } from "../modals/userSchema";

export const updateShoppingList = async(req:Request,res:Response):Promise<any>=>{
    const {shoppingList} = req.body
    const userid = req.userId;
    const user = await User.findById(userid)
    if(!user) return res.status(404).json({message:"User not found"})
        user.shoppingList = shoppingList
    await user.save()
    res.json({message:"Shopping list updated successfully"})
}