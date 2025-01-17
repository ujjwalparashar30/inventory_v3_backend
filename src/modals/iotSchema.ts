import mongoose,{Schema} from "mongoose";
import { UserDocument } from "./userSchema";

export interface IotDocument{
    _id : Schema.Types.ObjectId,
    uniqeId : string,
    owner ?: UserDocument
}

const IotSchema = new Schema<IotDocument>({
    uniqeId: {type: String, required: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User'}
})

export const Iot = mongoose.model("Iot",IotSchema)