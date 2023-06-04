const express = require("express");
const authController = require("../controllers/auth.js");

const router = express.Router();

router.post('/register', authController.register)
router.post('/login', authController.login);
router.get('/logout1', authController.logout);
router.get('/logout', (req, res) => {
   localStorage.getItem("email")
   localStorage.clear();

    res.send('Logged out successfully');
  });
  
router.post("/notes/add", authController.addNote)
router.post("/notes/get", authController.fetchNotes)


router.post("/deletenote", (req, res) => {
    const {userToken} = req.body 
    res.sendFile(__dirname + "/public/yourNotes.html")
})

module.exports = router;