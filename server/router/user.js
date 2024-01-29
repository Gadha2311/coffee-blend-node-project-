const express =require("express")
const usrouter =express.Router()
const session=require("../../middlewares/isAuth");
const userController=require('../controllers/userController')
const profilecontrol=require('../controllers/profilecontrol')
const cartcontroller=require('../controllers/cartcontroller')
const checkoutcontroller=require('../controllers/checkoutcontroller')
const orderCountrol=require('../controllers/ordercontrol')
const couponControl=require('../controllers/couponcontroller')
const productcontroller=require('../controllers/productcontroller')
const {loged,signforgot,forgot,logedtohome}=session;



//user login

usrouter.get('/',userController.index)
usrouter.post('/pagination',userController.index)
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
usrouter.get('/userdetails',loged,profilecontrol.userdetails)
usrouter.get('/editprofile',loged,profilecontrol.profileEdit)
usrouter.post('/updateprofile',loged,profilecontrol.profileUpdate)
usrouter.get('/newAddress',loged,profilecontrol.newAddress)
usrouter.post("/addressUpdating",loged,profilecontrol.updateAddress)
usrouter.get("/editaddress/:addressId",loged,profilecontrol.editaddress)
usrouter.post("/updateaddress/:addressId",loged,profilecontrol.editaddressupdate)
usrouter.get("/deleteaddress/:addressId",loged,profilecontrol.deleteAddress)
usrouter.get("/orderhistory",loged,profilecontrol.orderhistory)
usrouter.get("/cancelorder/:id",loged,profilecontrol.ordercancelling)
usrouter.get("/singleorder/:id",loged,profilecontrol.singleOrderPage)
usrouter.get('/rateAndReview',loged,productcontroller.ratePage)
usrouter.get('/returnorder/:id',loged,profilecontrol.orderReturn)
usrouter.get('/cancelitem/:id/:orderId',loged,profilecontrol.itemcancelling)
usrouter.get('/returnitem/:id/:orderId',loged,profilecontrol.itemreturning)
usrouter.post("/cp",loged,profilecontrol.changepassword)
usrouter.get("/download-invoice/:orderId",loged,orderCountrol.downloadInvoice)


//cart
usrouter.get('/cartpage',cartcontroller.showcart)
usrouter.get("/addtocart/:id",loged,cartcontroller.addtocart)
usrouter.get("/deletcart/:id",loged,cartcontroller.deletecart)
usrouter.post("/update-cart-quantity/:productId",session.loged,cartcontroller.updatecart)
usrouter.get("/checkoutpage",loged,cartcontroller.checkoutpage)


//shop
usrouter.get("/shop", userController.shop)
usrouter.post("/searchProducts",userController.searchProducts)
usrouter.get('/filterProducts',userController.filterProducts)
usrouter.get("/sortProducts",userController.sortProducts)


//checkout
usrouter.post("/placeorder",loged,checkoutcontroller.placeorder)
usrouter.post('/create/orderId',loged,checkoutcontroller.upi)

usrouter.post("/checkoutreload",loged,checkoutcontroller.checkoutreload)

//shop
usrouter.get("/shop", userController.shop)
usrouter.get("/singleproduct/:id", userController.singleproduct);
usrouter.get("/shoping/:id", userController.shopping)


//favourite
usrouter.get("/favouritespage",loged,profilecontrol.favouritespage)
usrouter.get("/addtofavourites/:id",loged,profilecontrol.addtofavourite)
usrouter.get("/deletefav/:id",loged,profilecontrol.deletefav)
usrouter.get("/addtocartviafav/:id",loged,profilecontrol.addtocartviafav)


//wallet
usrouter.get('/wallet',loged,profilecontrol.wallet)
usrouter.post('/walletcreate/orderId',loged,profilecontrol.walletupi)
usrouter.post('/walletTopup',loged,profilecontrol.walletTopup)
usrouter.post('/wallettransaction',loged,checkoutcontroller.wallettransaction)

//coupon
usrouter.get("/Rewards",loged,profilecontrol.couponsAndRewards)
usrouter.post("/applyCoupon",loged,checkoutcontroller.applyCoupon)
usrouter.post("/revokeCoupon",loged,checkoutcontroller.recokeCoupon)
usrouter.get("/Rewards",loged,couponControl.couponsAndRewards)

// banner
usrouter.get("/bannerURL",userController.bannerURL)



//logout
usrouter.get('/logout',logedtohome,userController.logout)




//exporting
module.exports=usrouter;
