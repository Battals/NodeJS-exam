const express = require("express");
const authController = require("../controllers/auth.js");

const router = express.Router();

router.post('/register', authController.register)
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post("/notes/add", authController.addNote)

router.post("/postNotes", (req, res) => {
    const {userToken} = req.body 
    res.sendFile(__dirname + "/public/yourNotes.html")
})


router.post("/deletenote", (req, res) => {
    const {userToken} = req.body 
    res.sendFile(__dirname + "/public/yourNotes.html")
})

module.exports = router;