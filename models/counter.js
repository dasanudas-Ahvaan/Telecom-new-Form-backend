// models/Counter.js
const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  // यह ID ट्रैकिंग के उद्देश्य को परिभाषित करता है (जैसे: 'member_id')
  _id: { 
    type: String, 
    required: true 
  }, 
  // यह अगली संख्या रखता है (e.g., 1, 2, 3...)
  seq: { 
    type: Number, 
    default: 0 
  } 
});

const Counter = mongoose.model("Counter", CounterSchema);
module.exports = Counter;