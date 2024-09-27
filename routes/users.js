const express = require("express");
const router = express.Router();
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");
const Contact = require("../models/contact");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.route("/register").get(users.renderRegister).post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), // authenticate the user with the local strategy (passport-local)
    users.login
  );
router.get("/about", users.about);
router.get("/terms", users.terms);
router.get("/privacy", users.privacy);

router.route("/contact").get(users.renderContact).post(catchAsync(users.submitContact));

router.get("/logout", users.logout);

module.exports = router;
