import express ,{Request,Response}from "express";
import { updateShoppingList } from "../controllers/shopingListController";
import { userMiddleware } from "../middleware/middleware";

const shoppingListRouter = express.Router()

shoppingListRouter.put("/update",userMiddleware, updateShoppingList)  

export default shoppingListRouter
