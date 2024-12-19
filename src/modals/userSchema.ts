import mongoose,{Schema} from "mongoose";

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

export interface UserDocument {
  username : string,
  password : string,
  items : userItem[]
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
});

export const User = mongoose.model('User', UserSchema);


