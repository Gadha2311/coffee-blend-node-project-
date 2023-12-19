
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const otpgenerator = require("otp-generator")
const usermodel=require('../models/usermodel')
const otpModel=require('../models/user_otpmodel')
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
    const categories = await catModel.find();
    console.log(categories);
    res.render("user/index", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

//shop
const shop = async (req, res) => {
  try {
    const category = req.query.category;

    const products = await productModel
      .find({ $and: [{ category }, { status: true }] })
      .exec();
    const categories = await catModel.find();
    const ctCategory = categories.find(
      (cat) => cat._id.toString() === category
    );

    const categoryName = ctCategory ? ctCategory.name : null;

    res.render("user/shop", {
      categoryName,
      categories,
      products,
      selectedCategory: category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("error occured");
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

    // Check if the user exists
    if (!user) {
      throw new Error("User not found");
    }

    const passwordmatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (passwordmatch && !user.status) {
      // Authentication successful
      req.session.userId = user._id;
      req.session.username = user.username;
      req.session.isAuth = true;
      res.redirect("/");
    } else {
      // Authentication failed
      res.render("user/login", { passworderror: "incorrect password" });
    }
  } catch (error) {
    // Error occurred, could be due to user not found or other issues
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
    // req.session.id=emailexist._id
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
        });
        req.session.user = user;
        req.session.signup = true;
        req.session.forgot = false;
  
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

  
  // otp verifying page 
  // Assuming generateotp and sendmail functions are correctly defined

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
          res.redirect("/login");
        } else if (req.session.forgot) {
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
      
        const id = req.session.userId;
        console.log(id);
        const user = await usermodel.findOne({ _id: id }); 
        console.log(user.username);
        const name = user.username;
        req.session.isAuth = true;
        res.render("user/profile", {name});
        console.log(req.session.user);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  };



//singleproduct
  const singleproduct = async (req, res) => {
    try {
      const id=req.params.id
          const product=await productModel.findOne({_id:id})
          const type= product.type;
          console.log("type",type);
          const similar = await productModel
          .find({ type: type, _id: { $ne: id } })
          .limit(4);
          console.log("similar",similar);
          const categories = await catModel.find();
          product.images = product.images.map(image => image.replace(/\\/g, '/'));
          console.log('Image Path:', product.images[0]);
          res.render('user/singleproduct',{categories,product:product,similar})
    } catch (error) {
      console.log(error);
      res.status(500).send("error occured");
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
    logout
}