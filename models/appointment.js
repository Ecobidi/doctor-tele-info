const mongoose = require("mongoose");

let appointmentSchema = new mongoose.Schema({
  title: String,
  timeApproved: Date,
  patient: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "patient"
  },
  medical_staff: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "medical_staff"
  },
  isBooked: { type: Boolean, default: false }
});

module.exports = mongoose.model("appointment", appointmentSchema);