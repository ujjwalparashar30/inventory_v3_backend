import express from "express";
import mongoose from "mongoose";
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
// const InventoryRouter = require("./src/router/inventoryRouter");

app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
  app.use('/api/v3', userRouter);
  app.use("/api/v3",inventoryRouter)

  app.listen(process.env.PORT , () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });


