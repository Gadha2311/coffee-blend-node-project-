const bcrypt=require('bcryptjs')
const catModel = require("../models/category_model");
const cartModel=require('../models/cart_model')
const usermodel=require('../models/usermodel')
const orderModel=require('../models/order_model')
const productModel=require('../models/product_model')
const walletModel=require('../models/wallet_model')
const favModel=require('../models/favouriteModel')
const KEY_ID = process.env.KEY_ID;
const key_secret = process.env.key_secret;
const Razorpay = require("razorpay");

const {
  passwordValid,
} = require("../../utils/validators/usersigninvalidator");
const couponModel = require("../models/coupon_model");




const userdetails = async (req, res) => {
  try {
    const userid = req.session.userId;
    console.log("id:", userid);
    const userdata = await usermodel.findOne({ _id: userid });
    const categories = await catModel.find();
    res.render("user/userdetails", { categories, userData: userdata });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const profileEdit = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userData = await usermodel.findOne({ _id: userId });
    const categories = await catModel.find();
    res.render("user/editprofile", { userData: userData, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const profileUpdate = async (req, res) => {
  try {
    const id = req.session.userId;
    const { username, phone, email } = req.body;
    console.log("values:", username, phone, email);
    const data = await usermodel.updateOne(
      { _id: id },
      { $set: { username: username, phone: phone } }
    );
    console.log(data);
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


const newAddress = async (req, res) => {
  try {
    const categories = await catModel.find();
    res.render("user/newAddress", { categories });
  } catch (err) {
    res.status(500).send("error occured");
    console.log(err);
  }
};



const updateAddress = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const userId = req.session.userId;
    console.log("id", userId);

    const existingUser = await usermodel.findOne({ _id: userId });

    if (existingUser) {
   
      const existingAddress = await usermodel.findOne({
        _id: userId,
        address: {
          $elemMatch: {
            fullname: fullname,
            adname: adname,
            street: street,
            pincode: pincode,
            city: city,
            state: state,
            country: country,
            phonenumber: phone,
          },
        },
      });
      if (existingAddress) {
        const categories = await catModel.find();
          const errorMessage = 'This address already exists';
          return res.render('user/newAddress', { errorMessage,categories }); 
      }
      
      existingUser.address.push({
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      });

      await existingUser.save();

     
      return res.redirect("/userdetails");
    }
    const newAddress = await usermodel.create({
      userId: userId,
      address: {
        saveas: saveas,
        fullname: fullname,
        adname: adname,
        street: street,
        pincode: pincode,
        city: city,
        state: state,
        country: country,
        phonenumber: phone,
      },
    });
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const editaddress = async (req, res) => {
  try {
    const addressid = req.params.addressId;
    const userid = req.session.userId;
    console.log("the id is:", addressid);
    const user = await usermodel.findById(userid);
    const addressToEdit = user.address.id(addressid);
    console.log(addressToEdit);
    const categories = await catModel.find();
    res.render("user/editaddress", { addressToEdit, categories });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const editaddressupdate = async (req, res) => {
  try {
    const {
      saveas,
      fullname,
      adname,
      street,
      pincode,
      city,
      state,
      country,
      phone,
    } = req.body;
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    console.log("id", userId);

    
    const isAddressExists = await usermodel.findOne({
      _id: userId,
      address: {
        $elemMatch: {
          _id: { $ne: addressId }, 
          saveas: saveas,
          fullname: fullname,
          adname: adname,
          street: street,
          pincode: pincode,
          city: city,
          state: state,
          country: country,
          phonenumber: phone,
        },
      },
    });

    if (isAddressExists) {
     
      return res.status(400).send("Address already exists");
    }

    
    const result = await usermodel.updateOne(
      { _id: userId, "address._id": addressId },
      {
        $set: {
          "address.$.saveas": saveas,
          "address.$.fullname": fullname,
          "address.$.adname": adname,
          "address.$.street": street,
          "address.$.pincode": pincode,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.country": country,
          "address.$.phonenumber": phone,
        },
      }
    );

   

    res.redirect("/userdetails");
  } catch (err) {
    res.status(500).send("Error occurred");
    console.log(err);
  }
};

const changepassword = async (req, res) => {
  try {
    const userid = req.session.userId;
    const password = req.body.newPassword;
    const newpassword = req.body.confirmPassword;
    const ispasswordvalid = passwordValid(newpassword);
    const categories = await catModel.find();
    const user = await usermodel.findById(userid);
    const passwordmatch = await bcrypt.compare(password, user.password);
    if (passwordmatch) {
      if (!ispasswordvalid) {
        console.log("passwor not valid");
        res.render("users/userdetails", {
          perror: "passworld have (A,a,@)",
          categories: categories,
          userData: user,
        });
      }
      else {
        const newhashedpassword = await bcrypt.hash(newpassword, 10);
        await usermodel.updateOne(
          { _id: userid },
          { password: newhashedpassword }
        );
        res.redirect("/userdetails");
      }
    } else {
      res.render("users/userdetails", {
        perror: "old password is incorrect",
        categories: categories,
        userData: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const userId = req.session.userId;
    const data = await usermodel.updateOne(
      { _id: userId, "address._id": addressId },
      { $pull: { address: { _id: addressId } } }
    );
    console.log("ithaahnu data", data);
    res.redirect("/userdetails");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const orderhistory = async (req, res) => {
  try {
    const userId = req.session.userId;
    const categories = await catModel.find({});
    const od = await orderModel.find({ userId: userId });
    const allOrderItems = [];
    od.forEach((order) => {
      allOrderItems.push(...order.items);
    });
    const orders = await orderModel.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $sort: {
          createdAt: -1, 
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
    ]);
    const updatedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productDetails: order.productDetails.find(
          (product) => product._id.toString() === item.productId.toString()
        ),
      })),
    }));
    console.log("its orders", orders[0].items);
    console.log("its orders model", od);
    console.log("its items", orders[0]);
    res.render("user/orderhistory", {
      od,
      orders: updatedOrders,
      categories,
      allOrderItems,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

const itemcancelling = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });

    const itemIndex = order.items.findIndex((item) => item.productId == id);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in the order");
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (order.paymentMethod == "Razorpay" || order.paymentMethod == "Wallet") {
      const user = await walletModel.findOne({ userId: userId });

      const refund = order.items[itemIndex].price;

      const currentWallet = user.wallet;
      console.log(currentWallet);

      const newWallet = currentWallet + refund;
      console.log(newWallet);
      const amountUpdate = await walletModel.updateOne(
        { userId: userId },
        {
          $set: { wallet: newWallet },
          $push: {
            walletTransactions: {
              reason: "item Cancelled",
              date: new Date(),
              type: "Credited", 
              amount: refund, 
            },
          },
        }
      );
    }

    const nonCancelledItems = order.items.filter(
      (item) => item.status !== "cancelled"
    );

    if (nonCancelledItems.length < 2) {
      order.status = "Cancelled";

      await orderModel.updateOne(
        { _id: orderId, "items.productId": order.items[itemIndex].productId },
        {
          $set: {
            "items.$.status": "cancelled",
            updatedAt: new Date(),
          },
        }
      );

      await order.save();
      return res.redirect(`/singleOrder/${orderId}`);
    }

    const result = await orderModel.updateOne(
      { _id: orderId, "items.productId": order.items[itemIndex].productId },
      {
        $set: {
          "items.$.status": "cancelled", 
          totalPrice: order.totalPrice - order.items[itemIndex].price,
          updatedAt: new Date(),
        },
      }
    );

    res.redirect(`/singleOrder/${orderId}`);
  } catch (err) {
    console.log(err);
    res.send("couldnt cancel");
  }
};

const itemreturning = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });

    const user = await walletModel.findOne({ userId: userId });

    const itemIndex = order.items.findIndex((item) => item.productId == id);

    if (itemIndex === -1) {
      return res.status(404).send("Item not found in the order");
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const refund = order.items[itemIndex].price;
    console.log("refundAmount", refund);

    const currentWallet = user.wallet;
    const newWallet = currentWallet + refund;
    const amountUpdate = await walletModel.updateOne(
      { userId: userId },
      {
        $set: { wallet: newWallet },
        $push: {
          walletTransactions: {
            reason: "ordered item returned",
            date: new Date(),
            type: "Credited",
            amount: refund,
          },
        },
      }
    );

    const nonReturnedItems = order.items.filter(
      (item) => item.status !== "returned"
    );

    if (nonReturnedItems.length < 2) {
      order.status = "Returned";

      await orderModel.updateOne(
        { _id: orderId, "items.productId": order.items[itemIndex].productId },
        {
          $set: {
            "items.$.status": "returned",
            updatedAt: new Date(),
          },
        }
      );

      await order.save();
      return res.redirect(`/singleOrder/${orderId}`);
    }

    const result = await orderModel.updateOne(
      { _id: orderId, "items.productId": order.items[itemIndex].productId },
      {
        $set: {
          "items.$.status": "returned",
          totalPrice: order.totalPrice - order.items[itemIndex].price,
          updatedAt: new Date(),
        },
      }
    );

    res.redirect(`/singleOrder/${orderId}`);
  } catch (err) {
    console.log(err);
    res.send("couldnt cancel");
  }
};


const singleOrderPage = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await orderModel.findOne({ _id: id });
    const categories = await catModel.find({});
    res.render("user/orderDetails", { categories, order });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};


const ordercancelling = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.userId;
    const update = await orderModel.updateOne(
      { _id: id },
      { status: "Cancelled" }
    );
    const result = await orderModel.findOneAndUpdate(
      { _id: id },
      { $set: { updatedAt: new Date() } },
      { new: true }
    );
    if (
      result.paymentMethod == "Razorpay" ||
      result.paymentMethod == "Wallet"
    ) {
      const user = await walletModel.findOne({ userId: userId });

      const refund = result.totalPrice;

      const currentWallet = user.wallet;
      console.log(currentWallet);

      const newWallet = currentWallet + refund;
      console.log(newWallet);
      const amountUpdate = await walletModel.updateOne(
        { userId: userId },
        {
          $set: { wallet: newWallet },
          $push: {
            walletTransactions: {
              reason: "oreder cancelled",
              date: new Date(),
              type: "Credited", 
              amount: refund, 
            },
          },
        }
      );
    }
    console.log("result", result);
    const items = result.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    for (const item of items) {
      const product = await productModel.findOne({ _id: item.productId });
      product.stock += item.quantity;
      await product.save();
    }

    res.redirect("/orderhistory");
  } catch (err) {
    res.status(500).send("error occured");
    console.log(err);
  }
};

const orderReturn = async (req, res) => {
  try{
      const userId=req.session.userId

      const id= req.params.id
      const update=await orderModel.updateOne({_id:id},{status:"Returned"})
      const order=await orderModel.findOne({_id:id})
      console.log("paranja order",order)
      const refund=order.totalPrice;
      console.log("refundAmount",refund)  
      const result=await orderModel.findOne({_id:id})
      
      const items=result.items.map(item=>({
       productId:item.productId,
       quantity:item.quantity,
       
   }))
   for(const item of items){
      const product =await productModel.findOne({_id:item.productId})
      product.stock+=item.quantity
      await product.save()
     
  }

     res.redirect("/orderhistory")

  }
  catch(err){
      console.log(err)
  }
};



const addtofavourite = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const quantity = 1;

    let fav;
    if (userId) {
      fav = await favModel.findOne({ userId: userId });
    }
    if (!fav) {
      fav = await favModel.findOne({ sessionId: req.session.id });
    }

    if (!fav) {
      fav = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    const productExist = fav.item.findIndex((item) => item.productId == pid);

    if (productExist !== -1) {
      fav.item[productExist].quantity += 1;
      fav.item[productExist].total = fav.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        price: price,
      };
      fav.item.push(newItem);
    }

    if (userId && !fav.userId) {
      fav.userId = userId;
    }

    await fav.save();
    res.redirect("/favouritespage");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred");
  }
};

const favouritespage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.session.id;
    const categories = await catModel.find();
    let fav;

    if (userId) {
      fav = await favModel.findOne({ userId: userId }).populate({
        path: "item.productId",
        select: "images name price",
      });
    } else {
      fav = await favModel.findOne({ sessionId: sessionId }).populate({
        path: "item.productId",
        select: "images name price",
      });
    }

    if (!fav || !fav.item) {
      cart = new favModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    res.render("user/favourites.ejs", { fav, categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred");
  }
};

const deletefav = async (req, res) => {
  try {
    const userId = req.session.userId;
    const pid = req.params.id;
    const result = await favModel.updateOne(
      { userId: userId },
      { $pull: { item: { _id: pid } } }
    );
    const updatefav = await favModel.findOne({ userId: userId });
    const newTotal = updatefav.item.reduce((acc, item) => acc + item.total, 0);
    updatefav.total = newTotal;
    await updatefav.save();
    res.redirect("/favouritespage");
  } catch (error) {
    console.error(err);
    res.status(500).send("Error occurred");
  }
};
const addtocartviafav = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await productModel.findOne({ _id: pid });

    const userId = req.session.userId;
    const price = product.price;
    const stock = product.stock;
    const quantity = 1;
    console.log("session id", req.session.id);
    let cart;
    if (userId) {
      cart = await cartModel.findOne({ userId: userId });
    }
    if (!cart) {
      cart = await cartModel.findOne({ sessionId: req.session.id });
    }

    if (!cart) {
      console.log("creating a new cart");
      cart = new cartModel({
        sessionId: req.session.id,
        item: [],
        total: 0,
      });
    }

    const productExist = cart.item.findIndex((item) => item.productId == pid);

    if (productExist !== -1) {
      cart.item[productExist].quantity += 1;
      cart.item[productExist].total = cart.item[productExist].quantity * price;
    } else {
      const newItem = {
        productId: pid,
        quantity: 1,
        price: price,
        stock: stock,
        total: quantity * price,
      };
      cart.item.push(newItem);
    }

    if (userId && !cart.userId) {
      cart.userId = userId;
    }

    cart.total = cart.item.reduce((acc, item) => acc + item.total, 0);

    await cart.save();
    res.redirect("/cartpage");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
};

const wallet = async (req, res) => {
  try {
  const userId = req.session.userId;
  const categories = await catModel.find({});
  const users=await usermodel.findOne({_id:userId});
  var user = await walletModel.findOne({ userId: userId }).sort({ 'walletTransactions.date': -1});
  
  if (!user) {
      user = await walletModel.create({ userId: userId });
  }
  
  const userWallet = user.wallet;
  const usertransactions=user.walletTransactions
  
  res.render("user/wallet", { categories, userWallet ,usertransactions,user:users});
  } catch (err) {
  console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

const walletupi = async (req, res) => {
  console.log("body:", req.body);
  var options = {
    amount: 500,
    currency: "INR",
    receipt: "order_rcpt",
  };
  instance.orders.create(options, function (err, order) {
    console.log("order1 :", order);
    res.send({ orderId: order.id });
  });
};

const walletTopup = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const Amount = parseFloat(req.body.Amount);
    console.log(Amount);
    const wallet = await walletModel.findOne({ userId: userId });
    wallet.wallet += Amount;
    wallet.walletTransactions.push({
      type: "Credited",
      amount: Amount,
      date: new Date(),
    });

    await wallet.save();
    res.redirect("/wallet");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
};

const couponsAndRewards=async (req,res)=>{
  try{

      const userId = req.session.userId;
      console.log(userId);
      const user = await usermodel.findById(userId);
      const coupons = await couponModel.find({
        couponCode: { $nin: user.usedCoupons },
        status:true
      });
      const categories=await catModel.find()
      res.render('user/rewardsPage',{categories,coupons,referralCode:userId})
  }
  catch(err){
      console.log(err);
      res.send(err)
  }
}






module.exports = {
    userdetails,
    profileUpdate,
    profileEdit,
    newAddress,
    updateAddress,
    editaddress,
    editaddressupdate,
    changepassword,
    deleteAddress,
    orderhistory,
    ordercancelling,
    itemreturning,
    itemcancelling,
    singleOrderPage,
    orderReturn,
    addtofavourite,
    favouritespage,
    deletefav,
    addtocartviafav,
    wallet,
    walletupi,
    walletTopup,
    couponsAndRewards
}    