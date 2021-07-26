const mongoose = require("mongoose");

let PatientSchema = new mongoose.Schema({
  patient_reg_no: {
    type: String,
    required: true,
    unique: true
  },
  surname: {type: String, required: true},
  otherName: {type: String, required: true},
  email: String,
  fullname: String,
  password: {
    type: String,
    default: '1234'
  },
  phone: String,
  address: String,
  questions: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "question"
  }],
  appointments: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "appointment"
  }],
  blood_group: String,
  genotype: String,
  gender: String,
});

module.exports = mongoose.model("patient", PatientSchema);