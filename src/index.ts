import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser"
const app = express()
import dotenv from "dotenv"
dotenv.config();

mongoose.connect(process.env.DB_URL as string).then(()=>{
    console.log("Connected to the database")
}).catch((err)=>{
    console.log(err)
})

import userRouter from "./router/userRouter";
import inventoryRouter from "./router/inventoryRouter";
import adminRouter from "./router/adminRouter";
// const InventoryRouter = require("./src/router/inventoryRouter");

app.use(express.json())
app.use(cookieParser())


app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  app.use('/api/v3/user', userRouter);
  app.use("/api/v3/inventory",inventoryRouter)
  app.use("/api/v3/admin",adminRouter)

  app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });

  export default app


