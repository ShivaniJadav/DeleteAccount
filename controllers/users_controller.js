const connection = require("../models/dbconfig");
var nodemailer = require("nodemailer");
require('dotenv').config();

const updateotp = async function (email, otp) {
  try {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE users SET verification_code = '${otp}' WHERE email = '${email}'`,
        (error, results) => {
          if (error) reject(false);
          if (results.affectedRows) resolve(true);
          else resolve(false);
        }
      );
    });
  } catch (error) {
    return false;
  }
};

const sendMail = async function (email, data) {
  return new Promise((resolve, reject) => {
    try {
      var transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_PASSWORD,
        },
      });

      var mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: data.subject,
        html: data.html,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          resolve({ status: false, data: error });
        } else {
          resolve({ status: true, data: "Sent email successfully" });
        }
      });
    } catch (error) {
      return false;
    }
  });
};

const isEmailExists = async (email) => {
  try {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM users WHERE email = '${email}' AND status = 'active'`,
        (error, results) => {
          if (error) reject(false);
          if (results.length) resolve(true);
          else resolve(false);
        }
      );
    });
  } catch (error) {
    return false;
  }
}

const sendotp = async (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await updateotp(email, otp);
      if (result) {
        result = await sendMail(email, {
          html: `<center><img src="https://svgshare.com/i/169s.svg" alt="FirmPet" /></center><br>
          <div>Greetings,</div><br> 
          <div>We have received a request to delete your account. <br> Your Varification OTP is: </div>
          <h3>${otp}</h3>
          <div>If it isn't you then consider changing your password.</div><br>
          <div>If you have any feedback or need further assistance, please contact our support team <a href="mailto:support@firmpet.com">support@firmpet.com</a></div><br>
          Best Regards,<br>
          The FirmPet Team`,
          subject: "FirmPet: Delete account Request"
        })
        if(result.status) {
          resolve(result);
        } else {
          reject(result);
        }
      } else {
        reject({ status: false, data: "Error while generating OTP!" });
      }
    } catch (error) {
      reject({ status: false, data: error });
    }
  });
}

const verifyotp = async (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      connection.query(
        `SELECT * FROM users WHERE email = '${email}' AND verification_code = '${otp}'`,
        (error, results) => {
          if (error) reject(false);
          if (results.length) resolve(true);
          else resolve(false);
        }
      );
    } catch (error) {
      reject({ status: false, data: error });
    }
  });
}

const deleteAccount = async (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      connection.query(
        `UPDATE users SET status = 'inactive' WHERE email = '${email}'`,
        (error, results) => {
          if (error) reject(false);
          if (results.affectedRows) resolve(true);
          else resolve(false);
        }
      );
    } catch (error) {
      reject({ status: false, data: error });
    }
  });
}

module.exports = {
  isEmailExists,
  sendotp,
  verifyotp,
  deleteAccount,
  sendMail
};
