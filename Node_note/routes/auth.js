const express = require("express");
const authController = require("../controllers/auth.js");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);



router.post("/notes/add", authController.addNote);
router.post("/notes/get", authController.fetchNotes);
router.post("/notes/update", authController.updateNote);
router.post("/notes/delete", authController.deleteNote);
router.post("/send-email", (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "roniapo@hotmail.com",
      pass: "seyhel",
    },
  });

  const note = req.body;

  const mailOptions = {
    from: "roniapo@hotmail.com",
    to: note.email,
    subject: "Note Email",
    text: note,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent successfully");
    }
  });
});

module.exports = router;
