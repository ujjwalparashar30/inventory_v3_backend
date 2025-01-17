import express from "express";
import { addItemToInventory, removeItemFromInventory } from "../controllers/inventoryController";
import { iotMiddleware } from "../middleware/middleware";
const inventoryRouter = express.Router();


inventoryRouter.put('/',iotMiddleware, addItemToInventory);
inventoryRouter.delete('/',iotMiddleware, removeItemFromInventory);


export default inventoryRouter