const express =require("express")
const usrouter =express.Router()
const session=require("../../middlewares/isAuth");
const userController=require('../controllers/userController')
const {loged,signforgot,forgot,logedtohome}=session;



//user login

usrouter.get('/',userController.index)
usrouter.get('/login',signforgot,userController.login)
usrouter.post("/verifylogin",userController.verifylogin)
usrouter.get("/profile",loged,userController.profile)

//signin

usrouter.get('/signin',userController.signin)
usrouter.post("/signup",userController.signup)
usrouter.get('/signin_otp',signforgot,userController.signin_otp)
usrouter.post("/verifyotp",signforgot,userController.verifyotp)
usrouter.get('/resendotp',signforgot,userController.resendotp)


//forgot and reset

usrouter.get('/forgot_password',userController.forgot_password)
usrouter.post('/reset_password',userController.reset_password)
usrouter.get('/reenter_password',forgot,userController.reenter_password)
usrouter.post('/confirm_password',forgot,userController.confirm_password )

//profile


usrouter.get("/shop", userController.shop)
usrouter.get("/singleproduct/:id", userController.singleproduct);

//logout
usrouter.get('/logout',logedtohome,userController.logout)




//exporting
module.exports=usrouter;
