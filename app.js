const express=require('express')
const session =require('express-session')
const app=express()
const bodyParser=require('body-parser')
const nocache=require('nocache')
const usrouter=require("./server/router/user")
const path=require('path')
const mongo=require('./config/connection')
const adrouter=require('./server/router/admin')
const cookieParser = require('cookie-parser')
const multer=require("multer")

//static
app.set("views",path.join(__dirname,"views"));
app.use(express.static(__dirname +'/public'))
app.use(express.static(__dirname +'/public/user_assets'))


mongo.connect()

app.use(cookieParser());
app.use(express.json())


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(nocache())





app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
}));


//view engine
app.set("view engine","ejs")




//uploads
app.use('/uploads',express.static('uploads'))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname+".png"); 
  }
});

const upload = multer({ storage: storage });

app.post('/your-upload-route', upload.array('files'), (req, res) => {
  console.log(req.files);
});

app.use("/",usrouter)
app.use ("/admin",adrouter)



//host
app.listen(4000,()=>{
    console.log("http://localhost:4000");
})







