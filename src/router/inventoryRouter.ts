import express from "express";
import { addItemToInventory, removeItemFromInventory } from "../controllers/inventoryController";
import { userMiddleware } from "../middleware/middleware";
const inventoryRouter = express.Router();


inventoryRouter.put('/inventory',userMiddleware, addItemToInventory);
inventoryRouter.delete('/inventory',userMiddleware, removeItemFromInventory);


export default inventoryRouter