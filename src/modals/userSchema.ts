import mongoose,{Schema} from "mongoose";
import { IotDocument } from "./iotSchema";
import { Document } from "mongoose";

// Define the Item Schema for user items

export interface userItem{
  _id ?: Schema.Types.ObjectId,
  itemId : Schema.Types.ObjectId,
  count : number
}
const UserItemSchema = new Schema<userItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  count: {
    type: Number,
    default: 1, // Start with a count of 1 when a new item is added
    min: 1,     // Ensure the count is always at least 1
  },
});

// Define the User Schema

export interface UserDocument extends Document {
  username : string,
  password : string,
  items : userItem[],
  iot : IotDocument[],
  shoppingList : [string]
}
const UserSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  items: [UserItemSchema], // Use the UserItemSchema for user items
  iot : [{
    type: Schema.Types.ObjectId,
    ref: 'Iot',
    require : true
  }],
  shoppingList : [{
    type : String
  }
  ]
});

export const User = mongoose.model('User', UserSchema);


