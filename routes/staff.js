let fs = require("fs");
let router = require("express").Router();
let Staff = require("../models/staff");
let Appointment = require("../models/appointment");
let Question = require("../models/question");
let PatientModel = require('../models/patient')
let config = require("../config");

let colors = ["success", "info", "warning", "primary", "danger", "dark"];

router.use(/\w/i, function(req, res, next) {
  if (req.session.staff_user == null) res.redirect("/staff/signin");
  else next();
});

router.get("/signup", function(req, res) {
  res.render("staff/signup", {hideNav: true});
});

router.post("/signup", function(req, res) {
  Staff.findOne({staffId: req.body.staffId}, function(err, staff) {
    if (err) return console.log(err);
    if (staff) {
      req.flash("error_msg", "This staff_username is already taken");
      return res.redirect("/staff/signup"); // staff already registered
    }
    if (req.body.password == req.body.confirmPassword) {
      Staff.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        surname: req.body.surname,
        otherName: req.body.otherName,
        phone: req.body.phone,
        address: req.body.address,
        }, function(err, doc) {
          if (err) return console.log(err);
          console.log("staff signup successful");
          res.redirect("/staff/signin");
        });
    } else {
      req.flash("error_msg", "Passwords do not match");
      res.redirect("/staff/signup");
    }
  });
});

router.get("/signin", function(req, res) {
  res.render("staff/signin", {hideNav: true});
});

router.post("/signin", function(req, res) {
  console.log(req.body);
  Staff.findOne({username: req.body.username}, function(err, staff_user) {
    if (err) return console.log(err);
    if(staff_user && staff_user.password == req.body.password) {
      req.session.staff_user = staff_user;
      req.session.home = "/staff/home";
      req.session.profile = "/staff/profile/";
      req.session.logout = "/staff/logout";
      res.redirect("/staff/home")
    }else {
      req.flash("error_msg", "Incorrect Login Details")
      res.redirect("/staff/signin");
    }
  });
});

router.use(function(req, res, next) {
  if (req.session.staff_user == null) {
    res.redirect("/staff/signin");
  } else {
    console.log(req.session.staff_user._id);
    req.session.staff_user = req.session.staff_user;
    req.session.home = "/staff/home";
    req.session.profile = "/staff/profile/";
    req.session.logout = "/staff/logout";
    next();
  }
});

router.get("/profile/:staffId", function(req, res) {
  Staff.findById(req.params.staffId, function(err, staff) {
    if (err) return console.log(err);
    res.render("staff/profile");
    
  });
});

router.post("/profile/:staffId", function(req, res) {
  Staff.findById(req.params.staffId, function(err, staff) {
    if (err) return console.log(err);
    let oldPhoto = staff.photo;
    let keys = Object.keys(req.body);
    keys.forEach((key) => staff[key] = req.body[key]); // update data
    staff.name.surname = req.body.surname;
    staff.name.otherName = req.body.otherName;
    let photoName;
    if (req.files && req.files.photo) {
      fs.unlinkSync(config.photoPath + oldPhoto); // delete old image file
      photoName = "pp_" + new Date().getTime() + "_" + req.files.photo.name;
      req.files.photo.mv(config.photoPath + photoName, function(err) {
      if(err) console.log(err);
      staff.photo = photoName;
      staff.save(function(err, doc) {
          if (err) return console.log(err);
          req.session.staff_user = doc;
          console.log("staff profile update successful");
          res.redirect("/staff/profile/" + req.params.staffId);
        });
      });
    } else {
      staff.save(function(err, doc) {
          if (err) return console.log(err);
          req.session.staff_user = doc;
          console.log("staff profile update successful");
          res.redirect("/staff/profile/" + req.params.staffId);
        });
    }
  });
});

router.get("/logout", function(req, res) {
  req.session.staff_user = null;
  res.redirect("/staff/signin");
});

router.get("/resetPassword/:staffId", function(req, res) {
  Staff.findById(req.params.staffId)
  .select("_id staffId email")
  .exec(function(err, staff) {
    if (err) return console.log(err);
    res.render("staff/reset-password");
  });
});

router.post("/reset_password/:staffId", function(req, res) {
  if (req.body.staffId == req.session.staff_user.staffId && req.body.email == req.session.staff_user.email) {
    if (req.body.password != req.body.confirmPassword) {
      req.flash("error_msg", "Passwords do not match");
      res.redirect("/staff/reset_password");
    }
    Staff.findByIdAndUpdate(req.params.staffId, {$set: {password: req.body.password}})
    .exec(function(err, staff) {
      if (err) return console.log(err);
      console.log("Password reset successful");
      req.session.staff_user = staff;
      req.flash("success_msg", "Password Reset Successfully");
      res.redirect("/staff/login/" + req.params.staffId);
    });
  }
});

router.get("/appointment", function(req, res) {
  Appointment.find({isBooked: false})
    .populate("patient")
    .exec(function(err, docs) {
      if (err) return console.log(err);
      for (let i = 0, length = docs.length; i < length; i++) {
        docs[i].patientName = docs[i].patient.surname + " " + docs[i].patient.otherName;
        docs[i].color = colors[i % colors.length];
      }
      res.render("staff/appointment", {appointments: docs, staff_user: req.session.staff_user});
    });
});

router.post("/appointment/:staffId", function(req, res) {
  console.log(req.body.time);
  console.log(req.body.date);
  let bookedDate = new Date(req.body.date + ":" + req.body.time);
  Appointment.findByIdAndUpdate(req.body.id, {$set: {staff: req.params.staffId, isBooked: true, timeApproved: bookedDate}})
    .exec(function(err, docs) {
      if (err) return console.log(err);
      res.redirect("/staff/appointment");
    })
});

router.get("/question", function(req, res) {
  Question.find({isSolved: false})
    .populate("patient")
    .exec(function(err, docs) {
      if (err) return console.log(err);
      for (let i = 0, length = docs.length; i < length; i++) {
        docs[i].patientName = docs[i].patient.surname + " " + docs[i].patient.otherName;
        docs[i].color = colors[i % colors.length];
      }
      res.render("staff/question", {questions: docs, staff_user: req.session.staff_user});
    });
});

router.post("/question/:staffId", function(req, res) {
  Question.findByIdAndUpdate(req.body.id, {$set: {answer: req.body.answer, staff: req.params.staffId, isSolved: true}})
    .exec(function(err, docs) {
      if (err) return console.log(err);
      res.redirect("/staff/question");
    })
});

router.get("/home", function(req, res) {
  res.render("staff/home");
});


router.get("/create-patient", function(req, res) {
  res.render("patient/signup", {hideNav: true});
});

router.post("/create-patient", function(req, res) {
  PatientModel.findOne({patient_reg_no: req.body.patient_reg_no}, function(err, patient) {
    if (err) return console.log(err);
    if (patient) {
      req.flash("error_msg", "This patient reg number is already taken");
      return res.redirect("/staff/create-patient"); // patient already registered
    }
    req.body.fullname = `${req.body.surname} ${req.body.otherName}`
    if (req.body.password == req.body.confirmPassword) {
      PatientModel.create({...req.body}, function(err, doc) {
          if (err) return console.log(err);
          console.log("patient successful registered");
          req.flash("success_msg", "Signup successful");
          res.redirect("/staff/patients");
        });
    } else {
      req.flash("error_msg", "Passwords do not match");
      res.redirect("/staff/create-patient");
    }
  });
});

router.get("/patients", async (req, res) => {
  let patients = await PatientModel.find({})
  res.render('patients', { patients, layout: 'b-layout'} )
})


module.exports = router;