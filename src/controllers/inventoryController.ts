import express,{ Request, RequestHandler, Response } from "express";
import { User, UserDocument, userItem } from "../modals/userSchema";
import { Item } from "../modals/itemSchema";
import fetchItemFromExternalApi from "../api/fetchItemUsingApi";
import {Schema } from "mongoose";

export const addItemToInventory = async (req: Request, res: Response) :Promise<any>=> {
    const { code, count = 1 } = req.body;  // Default count to 1 if not provided
    //@ts-ignore
    const user_id = req.userId
    const user:any = await User.findById(user_id);

    const query = {
        $or: [
            { upc: code },
            { ean: code }
        ] 
    };

    let newItem:userItem|null = await Item.findOne(query);

    if (newItem) {
        console.log('Item found in database');
        //@ts-ignore
        await addOrUpdateUserItem(user, newItem._id, count);

        return res.status(200).json({
            success: true,
            message: 'Item found in the database and updated in user items',
            item: newItem,
            code
        });
    }

    // Fetch the item from external API if it's not found in the database
    try {
        const body = await fetchItemFromExternalApi(code);

        if (body && body.items && body.items.length > 0) {
            const {
                ean, title, upc, gtin, asin, description, brand, model,
                dimension, weight, category, currency, lowest_recorded_price,
                highest_recorded_price, images
            } = body.items[0];

           let newItem = new Item({
                ean, title, upc, gtin, asin, description, brand, model,
                dimension, weight, category, currency, lowest_recorded_price,
                highest_recorded_price, images
            });

            await newItem.save();
            console.log('Stored in the database');
            console.log(user)

            await addOrUpdateUserItem(user, newItem._id, count);

            return res.status(200).json({
                success: true,
                message: 'Item found using external API, saved to the database, and updated in user items',
                item: newItem,
                code
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Item not found in external API',
                code
            });
        }
    } catch (err) {
        console.error('External API error:', err);

        return res.status(500).json({
            success: false,
            message: 'Error occurred during the external API request',
            error: (err as Error).message
        });
    }
};

export const removeItemFromInventory = async (req: Request, res: Response) :Promise<any> => {
    const { code, count = 1 } = req.body;
    //@ts-ignore
    const user:any = await User.findById(req.userId);

    if (!user) {
        return res.status(400).json({
            success: false,
            message: 'User not found in request context',
        });
    }

    // Ensure the user has an items array
    if (!user.items) {
        return res.status(400).json({
            success: false,
            message: 'User does not have an inventory',
        });
    }

    const query = {
        $or: [
            { upc: code },
            { ean: code }
        ]
    };

    let itemToRemove = await Item.findOne(query);

    if (!itemToRemove) {
        return res.status(404).json({
            success: false,
            message: 'Item not found in the database',
            code
        });
    }

    try {
        const result = await removeUserItem(user, itemToRemove._id, count);

        if (result.removed) {
            return res.status(200).json({
                success: true,
                message: 'Item removed from user inventory',
                item: itemToRemove,
                code
            });
        } else if (result.decremented) {
            return res.status(200).json({
                success: true,
                message: `Item count decremented by ${count}`,
                item: itemToRemove,
                code
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unable to remove item or decrement count',
                code
            });
        }
    } catch (err) {
        console.error('Error during item removal:', err);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: (err as Error).message
        });
    }
};


// Helper function to remove or decrement item in user's items array
async function removeUserItem(user:any, itemId: Schema.Types.ObjectId, count:number) {
    const existingItem = user.items.find((item:userItem) => item.itemId.toString() === itemId.toString());

    if (existingItem) {
        // If the item's count is greater than the decrement count
        if (existingItem.count > count) {
            existingItem.count -= count;  // Decrement the count
            await user.save();
            return { decremented: true };
        } 
        // If the item's count is less than or equal to the decrement count, remove the item
        else {
            user.items = user.items.filter((item:userItem) => !(item.itemId.toString() === itemId.toString()));
            await user.save();
            return { removed: true };
        }
    } else {
        // Item does not exist in user's inventory
        return { removed: false };
    }
}


// Helper function to add or update item in user's items array
async function addOrUpdateUserItem(user:any, itemId: Schema.Types.ObjectId, count:number) {
    const existingItem:userItem|undefined = user.items.find((item:userItem) => item.itemId.toString() === itemId.toString());

    if (existingItem) {
        // Add the count to the existing item's count
        existingItem.count += count;
    } else {
        // If it doesn't exist, add it with the given count
        user.items.push({ itemId, count });
    }

    // Save the updated user
    await user.save();
}
