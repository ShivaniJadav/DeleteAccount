var express = require("express");
var router = express.Router();
var usersController = require("../controllers/users_controller");
const otpGenerator = require('otp-generator')
require('dotenv').config();

router.get("/", async function (req, res, next) {
  if(req.session.email) {
    res.render("delete-account", {email: req.session.email, error: null});
  } else {
    res.render('delete-account', {error: null, email: ''});
  }
});

router.get("/verify", async function (req, res, next) {
    res.render('delete-account', {email: req.session.email, error: ''});
});

router.post("/", async function (req, res, next) {
  try {
    if (typeof req.body.email == "undefined" || req.body.email == "") {
      res.render("delete-account", {email: req.body.email, error: "Please enter email!" });
    } else {
      if(typeof req.body.reason != "undefined" && req.body.reason != '') {
        req.session.reason = req.body.reason;
      }
        let isEmailExists = await usersController.isEmailExists(req.body.email);
        if (isEmailExists) {
          req.session.email = req.body.email;
          let otp = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
          usersController.sendotp(req.body.email, otp);
            res.render("otp-verification", {email: req.body.email });
        } else {
          res.render("delete-account", {email: req.body.email, error: "This email is not registered!" });
        }
    }
  } catch (error) {
    res.render("error", { error: error });
  }
});

router.post("/verify", async function (req, res, next) {
  try {
    if (typeof req.body.otp == "undefined" || req.body.otp == "") {
      // res.render("error", { error: "Please enter OTP!" });
      res.render("otp-verification", {email: req.session.email, error: "Enter valid OTP!" });
    } else {
      let isEmailExists = await usersController.isEmailExists(req.body.email);
        if (isEmailExists) {
      if(await usersController.verifyotp(req.body.email, req.body.otp)) {
        if(await usersController.deleteAccount(req.body.email)) {
          let html = `<center><img src="https://svgshare.com/i/169s.svg" alt="FirmPet" /><br>
          <h3>An Account has been deleted.</h3><h4>Email: ${req.body.email}</h4>`;
          if(typeof req.session.reason != "undefined" && req.session.reason != '') {
            html += `<h4><b>Reason for leaving: </b> ${req.session.reason} </h4>`
          }
          html += `</center>`;
          usersController.sendMail(process.env.ADMIN_EMAIL, {
            html: html,
            subject: "FirmPet: Account Deleted"
          });
          req.session.email = '';
          res.render('delete-confirm')  
          req.session.reason = '';
        } else {
          res.render("error", { error: "Account still active. Please try again!" });  
        }
      } else {
        res.render("otp-verification", { email: req.session.email, error: "Invalid OTP!" });
      }
    } else {
      res.render("error", { error: "Account is already deactivated!" });
    }
    }
  } catch (error) {
    res.render("error", { error: error });
  }
});

module.exports = router;
