import {z} from "zod"

export const userSchemaValidation = z.object({
    username : z.string({message : "username can only be string"}).
    min(1,{message :"username cannot be empty"}).
    max(100,{message : "username cannot be more than 100 characters"}),

    password : z.string({message : "username can only be string"})
    .min(5,{message:"password should contain atleast 5 characters"})
    .max(20,{message : "password cannot be more than 20 characters"})
    .regex(/[!@#$%^&*(),.?":{}|<>]/,{message: "password should contain atleast one special character"})
})