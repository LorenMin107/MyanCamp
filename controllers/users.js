const User = require("../models/user");
const Contact = require("../models/contact");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

// Register a new user and log them in with passport
module.exports.register = async (req, res) => {
  try {
    const { email, username, password, phone } = req.body;
    const user = new User({ email, username, phone }); // create a new user
    const registeredUser = await User.register(user, password); // register the user with the password (hashing)
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/campgrounds"; // redirect to the returnTo path or /campgrounds
  res.redirect(redirectUrl);
};

module.exports.renderContact = (req, res) => {
  res.render("users/contact", { currentPage: "contact" });
};

module.exports.submitContact = async (req, res) => {
  const { message } = req.body;
  const user = req.user;
  const newContact = new Contact({ name: user.username, email: user.email, message, user: user._id });
  await newContact.save();
  user.contacts.push(newContact._id);
  await user.save();
  req.flash("success", "Thank you for your message! We'll reply as soon as possible.");
  res.redirect("/contact");
};

module.exports.logout = (req, res) => {
  req.logout(function (err) {
    // call back function to logout the user
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

module.exports.about = (req, res) => {
  res.render("about", { currentPage: "about" });
};

module.exports.terms = (req, res) => {
  res.render("terms", { currentPage: "terms" });
};

module.exports.privacy = (req, res) => {
  res.render("privacy", { currentPage: "privacy" });
};
