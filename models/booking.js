const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  campground: {
    type: Schema.Types.ObjectId,
    ref: "Campground",
  },
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  totalPrice: Number,
  sessionId: String,
});

module.exports = mongoose.model("Booking", BookingSchema);
