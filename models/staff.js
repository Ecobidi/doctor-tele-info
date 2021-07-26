const mongoose = require("mongoose");

let MedicalStaffSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  surname: {
    type: String, required: true
  },
  otherName: {
    type: String, required: true
  },
  email: String,
  password: {
    type: String,
    required: true,
  },
  specialization: String,
  hospital: String,
  photo: String,
  phone: String,
  address: String,
  questions: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "question"
  }],
  appointments: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "appointment"
  }]
});

module.exports = mongoose.model("medical_staff", MedicalStaffSchema);