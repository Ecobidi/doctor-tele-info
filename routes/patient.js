let fs = require("fs");
let router = require("express").Router();
let PatientModel = require("../models/patient");
let AppointmentModel = require("../models/appointment");
let QuestionModel = require("../models/question");
let config = require("../config");

let colors = ["success", "info", "warning", "primary", "danger", "dark"];

// router.get("/signup", function(req, res) {
//   res.render("patient/signup", {hideNav: true});
// });

// router.post("/signup", function(req, res) {
//   PatientModel.findOne({patient_reg_no: req.body.patient_reg_no}, function(err, patient) {
//     if (err) return console.log(err);
//     if (patient) {
//       req.flash("error_msg", "This patient reg number is already taken");
//       return res.redirect("/patient/signup"); // patient already registered
//     }
//     if (req.body.password == req.body.confirmPassword) {
//       let photoName;
//       if (req.files && req.files.photo) {
//         console.log(req.files);
//         photoName = "pp_" + new Date().getTime() + "_" + req.files.photo.name;
//         req.files.photo.mv(config.photoPath + photoName, function(err) {
//         if(err) console.log(err);
//         PatientModel.create({
//           patient_reg_no: req.body.patient_reg_no,
//           password: req.body.password,
//           email: req.body.email,
//           name: {
//             surname: req.body.surname,
//             otherName: req.body.otherName
//           },
//           phone: req.body.phone,
//           photo: photoName,
//           address: req.body.address,
//           }, function(err, doc) {
//             if (err) return console.log(err);
//             console.log("patient signup successful");
//             req.flash("success_msg", "Signup successful");
//             res.redirect("/patient/signin");
//           });
//         });
//       }
//     } else {
//       req.flash("error_msg", "Passwords do not match");
//       res.redirect("/patient/signup");
//     }
//   });
// });

router.get("/signin", function(req, res) {
  res.render("patient/signin", {hideNav: true});
});

router.post("/signin", function(req, res) {
  PatientModel.findOne({patient_reg_no: req.body.patient_reg_no}, function(err, user) {
    if (err) return console.log(err);
    if(user && user.password == req.body.password) {
      req.session.user = user;
      req.session.home = "/patient/home";
      req.session.profile = "/patient/profile/";
      req.session.logout = "/patient/logout";
      res.redirect("/patient/home")
    } else {
      req.flash("error_msg", "Incorrect Login Details")
      res.redirect("/patient/signin");
    }
  });
});

router.use(function(req, res, next) {
  console.log("=======called=========");
  if (req.session.user == null) {
    res.redirect("/patient/signin");
  } else {
    console.log(req.session.user._id);
    req.session.user = req.session.user;
    req.session.home = "/patient/home";
    req.session.profile = "/patient/profile/";
    req.session.logout = "/patient/logout";
    next();
  }
});

router.get("/profile/:patient_id", function(req, res) {
  PatientModel.findById(req.params.patient_id, function(err, patient) {
    if (err) return console.log(err);
    res.render("patient/profile");
  });
});

router.post("/profile/:patient_id", function(req, res) {
  PatientModel.findById(req.params.patient_id, function(err, patient) {
    if (err) return console.log(err);
    let keys = Object.keys(req.body);
    keys.forEach((key) => patient[key] = req.body[key]); // update data
    patient.save(function(err, doc) {
      if (err) return console.log(err);
      req.session.user = doc;
      console.log("patient profile update successful");
      res.redirect("/patient/profile/" + req.params.patient_id);
    });
  });
})

router.get("/logout", function(req, res) {
  req.session.user = null;
  res.redirect("/patient/signin");
});

router.get("/reset_password/:patient_id", function(req, res) {
  PatientModel.findById(req.params.patient_id)
  .select("_id patient_reg_no email")
  .exec(function(err, patient) {
    if (err) return console.log(err);
    res.render("patient/reset-password");
  });
});

router.post("/reset_password/:patient_id", function(req, res) {
  if (req.body.patient_reg_no == req.session.user.patient_reg_no && req.body.email == req.session.user.email) {
    if (req.body.password != req.body.confirmPassword) {
      req.flash("error_msg", "Passwords do not match");
      res.redirect("/patient/reset_password");
    }
    PatientModel.findByIdAndUpdate(req.params.patient_id, {$set: {password: req.body.password}})
    .exec(function(err, patient) {
      if (err) return console.log(err);
      req.session.user = patient;
      console.log("Password reset successful");
      req.flash("success_msg", "Password Reset Successfully");
      res.redirect("/patient/login/" + req.params.patient_id);
    });
  }
});

router.get("/appointment/:patient_id", function(req, res) {
  AppointmentModel.find({patient: req.params.patient_id})
    .populate("medical_staff")
    .exec(function(err, docs) {
      if (err) return console.log(err);
      for (let i = 0, length = docs.length; i < length; i++) {
        docs[i].timeScheduled = docs[i].timeApproved ? new Date(docs[i].timeApproved).toGMTString() : false;
        // docs[i].staffName =  docs[i].timeApproved ?  (docs[i].medical_staff.surname + " " + docs[i].medical_staff.otherName) : "";
        docs[i].color = colors[i % colors.length];
      }
      res.render("patient/appointment", {appointments: docs});
    })
})

router.post("/appointment/book/:patient_id", function(req, res) {
  AppointmentModel.create({title: req.body.title, patient: req.params.patient_id}, function(err, doc) {
    if (err) return console.log(err);
    res.redirect("/patient/appointment/" + req.params.patient_id);
  });
});

router.get("/question/:patient_id", function(req, res) {
  QuestionModel.find({patient: req.params.patient_id})
    .populate("medical_staff")
    .exec(function(err, docs) {
      console.log(docs)
      if (err) return console.log(err);
      for (let i = 0, length = docs.length; i < length; i++) {
        // docs[i].staffName =  docs[i].isSolved ?  (docs[i].medical_staff.surname + " " + docs[i].medical_staff.otherName) : "";
        docs[i].color = colors[i % colors.length];
      }
      res.render("patient/question", {questions: docs});
    })
})

router.post("/question/:patient_id", function(req, res) {
  QuestionModel.create({title: req.body.title, patient: req.params.patient_id},
    function(err, doc) {
      if (err) return console.log(err);
      res.redirect("/patient/question/" + req.params.patient_id);
    });
});

router.get("/home", function(req, res) {
  res.render("patient/home");
});

module.exports = router;