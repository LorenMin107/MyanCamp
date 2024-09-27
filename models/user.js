const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true, // Ensure an index is set for sorting
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  bookings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  contacts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Contact",
    },
  ],
});

// add the passport-local-mongoose plugin to the UserSchema to hash and salt the password and save the user to the database
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
