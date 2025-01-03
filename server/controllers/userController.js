
const bcrypt=require('bcryptjs')
const nodemailer=require('nodemailer')
const otpgenerator = require("otp-generator")
const usermodel=require('../models/usermodel')
const otpModel=require('../models/user_otpmodel')
const bannerModel = require("../models/banner_model");
const {Email,pass}=require('dotenv').config({path: '../env'})
const {
    nameValid,
    emailValid,
    phoneValid,
    confirmpasswordValid,
    passwordValid,
  } = require("../../utils/validators/usersigninvalidator")
const catModel = require('../models/category_model')
const productModel=require('../models/product_model')
const walletModel=require('../models/wallet_model')
const uuid = require('uuid')
const mongoose=require('mongoose')



// otp generating function 
const generateotp = () => {
    const otp = otpgenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    console.log("Generated OTP:", otp);
    return otp;
  };
  

// otp email sending function 
const sendmail = async (email, otp) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "gadhavenu2311@gmail.com", 
        pass: "wedp ediy sghb wpvu" 
      },
    });

    var mailOptions = {
      from: "coffeeblend<gadhavenu2311@gmail.com>",
      to: email,
      subject: "E-Mail Verification",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Error in sending mail:", err);
  }
};


// index page rendering
const index = async (req, res) => {
  try {
    const [categories, banners] = await Promise.all([
      catModel.find(),
      bannerModel.find(),
      productModel.find()
,    ]);

    console.log(categories);
    console.log(banners);

      const limit = 6;
      let page = parseInt(req.body.currentPage) || 1;
      const action = req.body.action;
      const prodCount = await productModel.countDocuments();
      const totalPages = Math.ceil(prodCount/limit);
      if(action){
        page+=action
      }
      const skip = (page-1)*limit;
      const from = skip + 1;
      const to = skip + limit;
      const products=await productModel.find().limit(limit).skip(skip)

      if(req.body.currentPage)
      {
        return res.json({
          currentPage:page,
          totalPages,
          products,
          from,
          to,
          success:true,
          totalProduccts:prodCount
        })
      }

    res.render("user/index", { categories, banners ,products,currentPage:page, totalPages});
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render('user/serverError')
  }
};

const bannerURL = async (req, res) => {
  try {
    const bannerId = req.query.id;
    console.log("Banner ID:", bannerId);
    const banner = await bannerModel.findOne({ _id: bannerId });
    console.log("ithhahnu mwoney", banner.bannerlink);
    if (banner.label == "category") {
      const categoryId = new mongoose.Types.ObjectId(banner.bannerlink);
      const category = await catModel.findOne({ _id: categoryId });
      res.redirect(`/shop?category=${categoryId}`);
    } else if (banner.label == "product") {
      const productId = new mongoose.Types.ObjectId(banner.bannerlink);
      const product = await productModel.findOne({ _id: productId });
      res.redirect(`/singleproduct/${productId}`);
    } else if (banner.label == "coupon") {
      const couponId = new mongoose.Types.ObjectId(banner.bannerlink);
      const coupon = await couponModel.findOne({ _id: couponId });
      res.redirect("/Rewards");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.render('user/serverError')
  }
};

//shop page
const shop = async (req, res) => {
  try {
    const category = req.query.category;
    let products;

    if (category) {
     
      products = await productModel.find({ $and: [{ category }, { status: true }] }).exec();
    } else {
     
      products = await productModel.find({ status: true }).exec();
    }

    const categories = await catModel.find();
    const ctCategory = category ? categories.find(cat => cat._id.toString() === category) : null;
    const categoryName = ctCategory ? ctCategory.name : null;
    const theCategory = category ? await catModel.find({ _id: category }) : null;

    res.render("user/shop", { theCategory, categoryName, categories, products, selectedCategory: category });
    console.log("ipooooo", theCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send("error occurred");
  }
};

const contact=async(req,res)=>{
  try {
    res.render("user/contact")
  } catch (error) {
    console.log(error);
    res.status(500).send("error occured")
    
  }
}


const shopping = async (req, res) => {
  try {
    const category = req.query.category;
    let products;

    if (category) {
      
      products = await productModel.find({ $and: [{ category }, { status: true }] }).exec();
    } else {
     
      products = await productModel.find({ status: true }).exec();
    }

    const categories = await catModel.find();
    const ctCategory = category ? categories.find(cat => cat._id.toString() === category) : null;
    const categoryName = ctCategory ? ctCategory.name : null;
    const theCategory = category ? await catModel.find({ _id: category }) : null;

    res.render("user/mainshop", { theCategory, categoryName, categories, products, selectedCategory: category });
    console.log("ipooooo", theCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send("error occurred");
  }
};


//searchproduct
const searchProducts = async (req, res) => {
  try {
    const searchProduct = req.body.searchProducts;

    const data = await catModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, "i") },
    });

    const productdata = await productModel.findOne({
      name: { $regex: new RegExp(`^${searchProduct}`, "i") },
    });

    const result = await catModel.aggregate([
      {
        $match: {
          types: {
            $elemMatch: {
              $regex: new RegExp(`^${searchProduct}`, "i"),
            },
          },
        },
      },
      {
        $unwind: "$types",
      },
      {
        $match: {
          types: {
            $regex: new RegExp(`^${searchProduct}`, "i"),
          },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: "$name", 
          matchingType: "$types",
        },
      },
    ]);
    console.log("nskbvbnsc ", result);

    if (data) {
      const categoryId = data._id;
      return res.redirect(`/shop?category=${categoryId}`);
    } else if (result.length !== 0) {
      const categoryData = result[0].matchingType;
      const foundCategory = await catModel.findOne({
        types: {
          $in: [categoryData],
        },
      });

      res.redirect(
        `/filterProducts?category=${foundCategory._id}&filterType=${categoryData}`
      );
    } else if (productdata) {
      const productId = productdata._id;
      return res.redirect(`/singleproduct/${productId}`);
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);

    
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
};




function getSortingLabel(sortOption) {
  if (sortOption === "-1") {
    return "Price: High To Low";
  } else if (sortOption === "1") {
    return "Price: Low To High";
  } else {
    return "Default Sorting";
  }
}

const filterProducts = async (req, res) => {
  try {
    const category = req.query.category;
    const selectedType = req.query.filterType;
    const sortOption = req.query.sortOption;
    
    const theCategory = await catModel.findOne({ _id: category });

    if (!theCategory) {
      
      console.error("Category not found");
      res.render("user/serverError");
      return;
    }

    const categoryName = theCategory.name;

    let products;

    const filterConditions = {
      category: category,
      status: true,
    };
    if (selectedType && selectedType !== "All") {
      filterConditions.type = selectedType;
    }
    if (sortOption === "-1") {
      products = await productModel
        .find(filterConditions)
        .sort({ price: -1 })
        .exec();
    } else if (sortOption === "1") {
      products = await productModel
        .find(filterConditions)
        .sort({ price: 1 })
        .exec();
    } else {
      products = await productModel.find(filterConditions).exec();
    }
    const categories = await catModel.find();
    const ctCategory = categories.find(
      (cat) => cat._id.toString() === category
    );

    res.render("user/shop", {
      selectedType,
      theCategory,
      categoryName,
      categories,
      products,
      selectedCategory: category,
      sorting: getSortingLabel(sortOption), 
    });

    console.log("ipooooo", theCategory);
  } catch (error) {
    console.log(error);
    res.render("user/serverError")
  }
};
function getSortingLabel(sortOption) {
  if (sortOption === "-1") {
    return "Price: High To Low";
  } else if (sortOption === "1") {
    return "Price: Low To High";
  } else {
    return "Default Sorting";
  }
}

const sortProducts = async (req, res) => {
  try {
    const sortOption = parseInt(req.query.sortPro, 10);
    const selectedType = req.query.type;
    const category = req.query.category;

    let products;
    console.log(sortOption);

    if (category) {
      products = await productModel
        .find({ $and: [{ category: category }, { status: true }] })
        .sort({ price: sortOption })
        .exec();
    } else {
      products = await productModel
        .find({ status: true })
        .sort({ price: sortOption })
        .exec();
    }

    let sorting;
    if (sortOption === -1) {
      sorting = "Price: High To Low";
    } else if (sortOption === 1) {
      sorting = "Price: Low To High";
    }

    console.log("propro", products);
    const categories = await catModel.find();
    const ctCategory = category ? categories.find((cat) => cat.id.toString() === category) : null;
    const categoryName = ctCategory ? ctCategory.name : null;
    const theCategory = category ? await catModel.find({ _id: category }) : null;

    res.render("user/shop", {
      selectedType,
      theCategory,
      categoryName,
      categories,
      products: products,
      sortoption: sortOption,
      selectedCategory: category,
      sorting,
    });
    console.log("ipoppop", theCategory);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};



// login page rendering
const login=(req,res)=>{
  res.render('user/login')
}


// login verification
const verifylogin = async (req, res) => {
  try {
    const username = req.body.username;
    const user = await usermodel.findOne({ username: username });

   
    if (!user) {
      throw new Error("User not found");
    }

    const passwordmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (passwordmatch && !user.status) {
    
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.isAuth = true;
      res.redirect("/");
    } else {
     
      res.render("user/login", { passworderror: "incorrect password" });
    }
  } catch (error) {
   
    res.render("user/login", { username: "incorrect username" });
  }
};



// fogot password page rendering
const forgot_password = async (req, res) => {
  try {
    res.render("user/forgot_password");
  } catch {
    res.status(200).send("error occured");
  }
};


// forgot pass email varification
const reset_password= async (req, res) => {
  try {
    const email = req.body.email;
    const emailexist = await usermodel.findOne({ email: email });
    console.log(emailexist);
    if (emailexist) {
      req.session.forgot = true;
      req.session.signup = false;
      req.session.user = { email: email };
      const otp = generateotp();
      console.log(otp);
      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 60 * 1000;
      const filter = { email: email };
      const update = {
        $set: {
          email: email,
          otp: otp,
          expiry: new Date(expiryTimestamp),
        },
      };

      const options = { upsert: true };

      await otpModel.updateOne(filter, update, options);

      await sendmail(email, otp);
      res.redirect("/signin_otp");
    } else {
      res.render("user/forgot_password", { email: "E-Mail Not Exist" });
    }
  } catch (err) {
    res.status(400).send("error occurred: " + err.message);
    console.log(err);
  }
};


// pass changing page rendering
const reenter_password = async (req, res) => {
  try {
      res.render("user/reenter_password");
  } catch {
    res.status(400).send("error occured");
  }
};



// changing password
const confirm_password = async (req, res) => {
  try {
      const password = req.body.newPassword;
      const cpassword = req.body.confirmPassword;
      const ispasswordValid = passwordValid(password);
      const iscpasswordValid = confirmpasswordValid(cpassword, password);

      if (!ispasswordValid) {
        res.render("user/reenter_password", {
          perror: "Password should contain (A,a,@)",
        });
      } else if (!iscpasswordValid) {
        console.log("Passwords do not match");
        res.render("user/reenter_password", { cperror: "Passwords not match" });
      } else {
        const hashedpassword = await bcrypt.hash(password, 10);
        const email = req.session.user.email;
        await usermodel.updateOne(
          { email: email },
          { password: hashedpassword }
        );
        req.session.forgot = false;
        res.redirect("/login");
      }
  } catch {
    res.status(400).send("error occured");
  }
};


// signin page rendering
const signin=(req,res)=>{
  res.render('user/signin')
}


  // user otp sneding 
  const signup= async (req, res) => {
    try {
      const username = req.body.username;
      const email = req.body.email;
      const phone = req.body.phone;
      const password = req.body.password;
      const cpassword = req.body.confirm_password;
      const code=req.body.code;

    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Password:', password);
    console.log('Confirm Password:', cpassword);
  
      const isusernameValid = nameValid(username);
      const isEmailValid = emailValid(email);
      const isPhoneValid = phoneValid(phone);
      const ispasswordValid = passwordValid(password);
      const iscpasswordValid = confirmpasswordValid(cpassword, password);
  
      const emailExist = await usermodel.findOne({ email: email });
      if (emailExist) {
        res.render("user/signin", { emailerror: "E-mail already exits" });
      } else if (!isusernameValid) {
        res.render("user/signin", { nameerror: "Enter a valid Name" });
      } else if (!isEmailValid) {
        res.render("user/signin", { emailerror: "Enter a valid E-mail" });
      } else if (!isPhoneValid) {
        res.render("user/signin", { phoneerror: "Enter a valid Phone Number" });
      } else if (!ispasswordValid) {
        res.render("user/signin", {
          passworderror: "Password should contain one(A,a,2)",
        });
      } else if (!iscpasswordValid) {
        res.render("user/signin", {
          cpassworderror: "Password and Confirm password should be match",
        });
      } else {
        const hashedpassword = await bcrypt.hash(password, 10);
        const user = new usermodel({
          username: username,
          email: email,
          phone: phone,
          password: hashedpassword,
          code: uuid.v4() 
        });
        req.session.user = user;
        req.session.signup = true;
        req.session.forgot = false;
        const reference = await usermodel.findOne({ code: code.trim() })
        console.log(reference, '0000');
        console.log(code, 'coooo');
        if (reference) {
            req.session.reference = reference._id
            console.log(req.session.reference, 'fff');
        }

        const otp = generateotp();
        console.log(otp);
        const currentTimestamp = Date.now();
        const expiryTimestamp = currentTimestamp + 30 * 1000;
        const filter = { email: email };
        const update = {
          $set: {
            user: Email,
            otp: otp,
            expiry: new Date(expiryTimestamp),
          },
        };
  
        const options = { upsert: true };
  
        await otpModel.updateOne(filter, update, options);
       
        await sendmail(email, otp);
        res.redirect("/signin_otp");
        
      }
    } catch (err) {
      console.error("Error:", err);
      res.send("error");
    }
  };

  
  // otp page rendering 
  const signin_otp = async (req, res) => {
    try {
        res.render("user/signin_otp");
    } catch {
      res.status(200).send("error occured");
    }
  };


const verifyotp = async (req, res) => {
  try {
    const enteredotp = req.body.otp;
    const user = req.session.user;
    const email = req.session.user.email;
    
    const userdb = await otpModel.findOne({ email: email });
    const otp = userdb.otp;
    const expiry = userdb.expiry;
    
    if (enteredotp == otp && expiry.getTime() >= Date.now()) {
      user.isVerified = true;
      try {
        if (req.session.signup) {
          await usermodel.create(user);
          req.session.signup = false;
          const reference = req.session.reference
                    console.log(reference, 'yyyy');
                    const refer = await usermodel.findOne({ _id: reference })
                    console.log('refer',refer);
                    if (refer) {
                        const wallet = await walletModel.findOne({ userId: refer._id })
                        wallet.wallet += 100;
                        console.log(wallet, 'ppp');
                        wallet.walletTransactions.push({
                          date: new Date(),
                          type:"Credited",
                          amount: 100
                        })
                        await wallet.save();
                    }

          res.redirect("/login");
        } 
        else if (req.session.forgot) {
          res.redirect("/reenter_password");
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while saving user data");
      }
    } else {
      res.render("user/signin_otp", { otperror: "Wrong password/Time expired" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
};
  

const resendotp = async (req, res) => {
  try {
    console.log("resend otp is working");
      const email = req.session.user.email;
      const otp = generateotp();
      console.log(otp);

      const currentTimestamp = Date.now();
      const expiryTimestamp = currentTimestamp + 30 * 1000;
      await otpModel.updateOne(
        { email: email },
        { otp: otp, expiry: new Date(expiryTimestamp) }
      );
      await sendmail(email, otp);
    
  } catch (err) {
    console.log(err);
  }
};

  
  // user profile page 
  const profile = async (req, res) => {
    try {
        const categories = await catModel.find();
        const id = req.session.userId;
        const user = await usermodel.findOne({ _id: id }); 
        
        console.log(user.username);
        const name = user.username;
        res.render("user/profile", { categories, name , userData:user});
        console.log(req.session.user);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };


//singleproduct
const singleproduct = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("haywanu", id);
    const product = await productModel.findOne({ _id: id , status: true }).populate({
      path: "userRatings.userId",
      select: "username",
    });
    console.log("haywanu", product);

    const type = product.type;

    const convertedId = new mongoose.Types.ObjectId(id);

    const result = await productModel.aggregate([
      {
        $match: { _id: convertedId },
      },
      {
        $unwind: { path: "$userRatings", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$userRatings.rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const totalRatings = result.length > 0 ? result[0].totalRatings : 0;

    console.log("hey there", result);

    console.log(averageRating, totalRatings);

    const similar = await productModel
      .find({ type: type, _id: { $ne: id } })
      .limit(4);
    console.log("similar", similar);
    const categories = await catModel.find();
    product.images = product.images.map((image) => image.replace(/\\/g, "/"));
    console.log("Image Path:", product.images[0]);
    console.log("ithu rateng aa ", product.userRatings[0]);
    res.render("user/singleproduct", {
      categories,
      product: product,
      similar,
      averageRating,
      totalRatings,
    });
  } catch (err) {
    console.log("Shopping Page Error:", err);
    res.render("user/serverError")
  }
};



//logout
const logout = async (req, res) => {
  try {
    
      req.session.isAuth = false;
      req.session.destroy();
      res.redirect("/");
    
  } catch (error) {
    console.log(error);
    res.send("Error Occured");
  }
};






module.exports={
    index,
    login,
    shop,
    verifylogin,
    signin,
    verifyotp,
    resendotp,
    signup,
    signin_otp,
    forgot_password,
    reset_password,
    reenter_password,
    confirm_password ,
    profile,
    singleproduct,
    logout,
    sortProducts,
    searchProducts,
    filterProducts,
    bannerURL,
    shopping ,
    contact

}