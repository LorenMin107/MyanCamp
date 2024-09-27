const Campground = require("../models/campground");
const Booking = require("../models/booking");
const User = require("../models/user");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

function calculateDaysAndPrice(startDate, endDate, pricePerNight) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const totalPrice = daysCount * pricePerNight;
  return { daysCount, totalPrice };
}
module.exports.bookCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const { daysCount, totalPrice } = calculateDaysAndPrice(req.body.startDate, req.body.endDate, campground.price);
  // Pass booking details to checkout page via query parameters
  res.redirect(
    `/bookings/${campground._id}/checkout?startDate=${req.body.startDate}&endDate=${req.body.endDate}&totalDays=${daysCount}&totalPrice=${totalPrice}`
  );
};

module.exports.renderCheckoutPage = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  const { startDate, endDate, totalDays, totalPrice } = req.query;
  res.render("campgrounds/checkout", {
    campground,
    startDate,
    endDate,
    daysCount: totalDays,
    totalPrice: parseFloat(totalPrice),
  });
};

// Proceed with the booking
module.exports.proceedBooking = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const booking = new Booking({
    user: req.user._id,
    campground: campground._id,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    totalDays: req.body.totalDays,
    totalPrice: req.body.totalPrice,
  });
  await booking.save();
  campground.bookings.push(booking._id);
  await campground.save();
  req.user.bookings.push(booking); // Associate booking with user
  await req.user.save(); // Save user with new booking
  req.flash("success", "Successfully booked campground!");
  res.redirect(
    `/bookings/${campground._id}/checkout?startDate=${req.body.startDate}&endDate=${req.body.endDate}&totalDays=${req.body.totalDays}&totalPrice=${req.body.totalPrice}`
  );
};

module.exports.processPayment = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, totalDays, totalPrice } = req.query;
  const campground = await Campground.findById(id);
  const user = await User.findById(req.user._id);

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${campground.title} - ${totalDays} days`,
            description: `Booking for ${totalDays} days at ${campground.title} by ${user.username}`,
          },
          unit_amount: Math.round(totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/bookings/${id}/success?session_id={CHECKOUT_SESSION_ID}&startDate=${startDate}&endDate=${endDate}&totalDays=${totalDays}&totalPrice=${totalPrice}`,
    cancel_url: `${req.protocol}://${req.get("host")}/bookings/${id}/checkout`,
    metadata: {
      username: user.username,
      totalDays: totalDays,
    },
  });

  res.redirect(303, session.url);
};

module.exports.paymentSuccess = async (req, res) => {
  const { id } = req.params;
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  if (session.payment_status === "paid") {
    const booking = new Booking({
      user: req.user._id,
      campground: id,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      totalDays: req.query.totalDays,
      totalPrice: req.query.totalPrice,
      sessionId: session.id, // Store sessionId
    });
    await booking.save();

    const campground = await Campground.findById(id).populate("images");
    campground.bookings.push(booking._id);
    await campground.save();

    req.user.bookings.push(booking._id); // Associate booking with user
    await req.user.save(); // Save user with new booking

    req.flash("success", "Successfully booked campground!");
    res.render("bookings/transaction", { booking, session, user: req.user, campground, username: req.user.username });
  } else {
    req.flash("error", "Payment failed. Please try again.");
    res.redirect(`/bookings/${id}/checkout`);
  }
};

module.exports.viewBooking = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("campground");
  res.render("bookings/view", { bookings, user: req.user, currentPage: "bookings" });
};

module.exports.viewTransaction = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate("campground").populate("user");
  if (!booking) {
    req.flash("error", "Cannot find that booking!");
    return res.redirect("/bookings/view");
  }
  const campground = booking.campground;
  const session = await stripe.checkout.sessions.retrieve(booking.sessionId); // Use sessionId from booking
  res.render("bookings/transaction", { booking, session, campground, user: req.user, username: booking.user.username });
};
