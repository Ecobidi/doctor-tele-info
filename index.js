const path = require("path");
require("dotenv").config()
const express = require("express");
const expHbs = require("express-handlebars");
const bodyParser = require("body-parser");
const expressSession = require("express-session");
const fileUpload = require("express-fileupload");
const flash = require("connect-flash");
const mongoose =require("mongoose");

const config = require("./config");

const patientRouter = require("./routes/patient");
const staffRouter = require("./routes/staff");

// mongoose connection
// mongoose.connect(config.dbPath);

// mongoose.connection.once("connected", () => console.log("Connected to database"));

// mongoose.connection.on("error", (err) => console.log("Mongoose connection error: " + err));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qmunc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

try {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  console.log('connected to ' + process.env.DB_NAME + ' database.')
} catch (error) {
  console.log('Error connecting to ' + process.env.DB_NAME + ' database.')
  console.log(error)
}


let app = express();

// middlewares
app.engine("hbs", expHbs({defaultLayout: "main", extname: ".hbs"}));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(fileUpload());

app.use(expressSession({
  secret: "282818112",
  resave: false,
  saveUninitialized: true,
}));

app.use(flash());

// global variables
app.use(function(req, res, next) {
  res.locals.author = config.author;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.appname = config.appName
  res.locals.user = req.session.user;
  res.locals.home = req.session.home;
  res.locals.profile = req.session.profile;
  res.locals.logout = req.session.logout;
//   req.session.staff_user = {
//     "_id" : "60fd6bf36b716b1d1079fa6a",
//     "questions" : [ ],
//     "appointments" : [ ],
//     "username" : "doctor1",
//     "password" : "doctor1",
//     "email" : "ecobidi@gmail.com",
//     "surname" : "Obidi",
//     "otherName" : "Chukwudi",
//     "phone" : "9999992",
//     "address" : "20 Aba Road, PortHarcourt",
//     "__v" : 0
// }
  next();
});

app.get("/", (req, res) => { res.render("index"); });

app.use("/patient", patientRouter);

app.use("/staff", staffRouter);

//express-static middleware
app.use(express.static(path.join(__dirname, "public")));

// listen to port
app.listen(process.env.PORT, () => { console.log(`Doctor Tele Information System running on port ${process.env.PORT}`) })