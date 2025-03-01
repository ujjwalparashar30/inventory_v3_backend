import express from "express"
import { isAdmin } from "../middleware/middleware";
import { createAdmin, deleteAdmin, generateIotId, getAdmin, loginUser, logoutUser, updateAdmin } from "../controllers/adminController";
const adminRouter = express.Router();


//get info 
adminRouter.get("/",isAdmin , getAdmin)

//create admin
adminRouter.post("/",
    isAdmin,
     createAdmin)

//updateAdmin
adminRouter.put("/:id", isAdmin, updateAdmin)

//delete admin
adminRouter.delete("/:id",isAdmin,deleteAdmin)

// Login route
adminRouter.post('/login', loginUser);

//logout route
adminRouter.post("/logout",logoutUser);

//generate new iot id
adminRouter.post("/generateIotId", generateIotId);

export default adminRouter;