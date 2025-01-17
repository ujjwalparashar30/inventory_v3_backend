import mongoose,{Schema} from "mongoose";

export interface adminDocument {
    _id: string;
    username : string;
    password : string;
    email : string
}
export const adminSchema = new Schema<adminDocument>({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true}
    })

    export const Admin = mongoose.model('Admin',adminSchema)