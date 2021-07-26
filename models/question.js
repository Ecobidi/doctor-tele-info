const mongoose = require("mongoose");

let QuestionSchema = new mongoose.Schema({
  title: String, 
  answer: String,
  isSolved: {type: Boolean, default: false},
  patient: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "patient"
  },
  medical_staff: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "medical_staff"
  },
});

module.exports = mongoose.model("question", QuestionSchema);