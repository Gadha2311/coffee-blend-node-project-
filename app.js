const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const nocache = require('nocache');
const usrouter = require('./server/router/user');
const path = require('path');
const mongo = require('./config/connection');
const adrouter = require('./server/router/admin');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const flash = require('express-flash');
const axios = require('axios');

require('dotenv').config();

// Static files
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/user_assets'));
app.use(express.static(__dirname + '/public/adminAssets'));
app.use(flash());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongo.connect();

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(nocache());

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Set view engine
app.set('view engine', 'ejs');

// Uploads
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname + '.png');
  },
});

const upload = multer({ storage: storage });

app.post('/your-upload-route', upload.array('files'), (req, res) => {
  console.log(req.files);
});

// Routes
app.use('/', usrouter);
app.use('/admin', adrouter);

app.get('*', (req, res) => {
  res.render('user/404');
});

// Host

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
