const express =require("express")
const adminrouter=express.Router()
const multer=require('multer')
const admincontroller=require("../controllers/adminController")
const sessions=require("../../middlewares/isadAuth")
const productcontroller=require("../controllers/productcontroller")
const upload=multer({dest:'uploads/'})
const app=express();

app.use(express.static('public/admin_assets'))
adminrouter.use(express.urlencoded({extended:true}))


adminrouter.get("/",admincontroller.login)
adminrouter.post("/adminlogin",admincontroller.adminlogin)

adminrouter.get("/adminpannel",sessions.adisAuth,admincontroller.adminpannel)
adminrouter.get("/userslist",sessions.adisAuth,admincontroller.userslist)
adminrouter.get("/update/:email",sessions.adisAuth,admincontroller.userupdate)
adminrouter.post("/searchuser",sessions.adisAuth,admincontroller.searchuser)
adminrouter.get("/searchview",sessions.adisAuth,admincontroller.searchview)
adminrouter.get("/filter/:option",sessions.adisAuth,admincontroller.filter)

adminrouter.get("/adlogout",sessions.adisAuth,admincontroller.adlogout)


adminrouter.get("/category",sessions.adisAuth,admincontroller.category)
adminrouter.get("/newcat",sessions.adisAuth,admincontroller.newcat)
adminrouter.post("/add-category",sessions.adisAuth,admincontroller.addcategory)
adminrouter.get("/unlistcat/:id",sessions.adisAuth,admincontroller.unlistcat)
adminrouter.get("/updatecat/:id",sessions.adisAuth,admincontroller.updatecat)
adminrouter.post("/update-category/:id",sessions.adisAuth,admincontroller.updatecategory)

adminrouter.get("/product",sessions.adisAuth,productcontroller.product)
adminrouter.get("/newproduct",sessions.adisAuth,productcontroller.newproduct)
adminrouter.post("/addproduct",sessions.adisAuth,upload.array('images'),productcontroller.addproduct)
adminrouter.get("/unlist/:id",sessions.adisAuth,productcontroller.unlist)
adminrouter.get("/deletepro/:id",sessions.adisAuth,productcontroller.deleteproduct)
adminrouter.get("/updatepro/:id",sessions.adisAuth,productcontroller.updatepro)
adminrouter.get("/editimg/:id/",sessions.adisAuth,productcontroller.editing)
adminrouter.get("/deleteimg",sessions.adisAuth,productcontroller.deleteimg)
adminrouter.post("/updateimg/:id",sessions.adisAuth,upload.array('images'),productcontroller.updateimg)
adminrouter.post("/updateproduct/:id",sessions.adisAuth,productcontroller.updateproduct)


module.exports=adminrouter