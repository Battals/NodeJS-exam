const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const path = require("path");
const filePath = path.resolve("public/yourNotes.html");

const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DATABASE_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).sendFile(__dirname + "/login.html", {
        message: "Please Provide an email and password",
      });
    }
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (
          !results ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          const errorMessage = "Invalid email or password";

          return res.status(401).json({ error: errorMessage });
        } else {
          const id = results[0].id;

          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });

          console.log("the token is " + token);

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };
          res.cookie("userSave", token, cookieOptions);
          res.sendFile(filePath, { email });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.addNote = (req, res) => {
  const { email, titel, description } = req.body;
  const noteId = Math.floor(Math.random() * 1000);
  console.log(noteId);

  db.query(
    "SELECT id from users WHERE email = ?",
    [email],
    async (err, results) => {
      const idtest = results[0].id;
      const title = titel;
      const userid = idtest;
      console.log(results[0].id);
      if (err) {
        console.log(err);
      } else {
        db.query(
          "INSERT INTO notes (title, description, userid, noteId) VALUES (?,?,?,?) ",
          [title, description, userid, noteId]
        );
      }
    }
  );
};

exports.fetchNotes = (req, res) => {
  const { email } = req.body;
  db.query(
    "SELECT * FROM notes WHERE userid IN (SELECT id FROM users WHERE email = ?)",
    [email],
    (err, results) => {
      if (err) {
        console.log(err);
        res
          .status(500)
          .json({ error: "An error occurred while fetching notes." });
      } else {
        res.status(200).json(results);
      }
    }
  );
};

exports.register = (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  console.log(req.body);
  db.query(
    "SELECT email from users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.log(err);
      } else {
        if (results.length > 0) {
          return res.sendFile(__dirname + "request.html", {
            message: "The email is already in use",
          });
        } else if (password != passwordConfirm) {
          return res.sendFile(__dirname + "request.html", {
            message: "Password dont match",
          });
        }
      }

      let hashedPassword = await bcrypt.hash(password, 8);

      db.query(
        "INSERT INTO users SET ?",
        { email: email, password: hashedPassword },
        (err, results) => {
          if (err) {
            console.log(err);
          } else {
            return res.sendFile(__dirname + "request.html", {
              message: "User registered",
            });
          }
        }
      );
    }
  );
  const publicPath = path.resolve("public");
  const loginFilePath = path.join(publicPath, "login.html");
  res.sendFile(loginFilePath);
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.userSave) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.userSave,
        process.env.JWT_SECRET
      );
      console.log(decoded);

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [decoded.id],
        (err, results) => {
          console.log(results);
          if (!results) {
            return next();
          }
          req.user = results[0];
          return next();
        }
      );
    } catch (err) {
      console.log(err);
      return next();
    }
  } else {
    next();
  }
};
exports.logout = (req, res) => {
  res.cookie("userSave", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/");
};

exports.updateNote = (req, res) => {
    const { noteId, updatedTitle, updatedDescription } = req.body;
  
    db.query(
      "UPDATE notes SET title = ?, description = ? WHERE noteId = ?",
      [updatedTitle, updatedDescription, noteId],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "An error occurred while updating the note" });
        } else {
          res.status(200).json({ message: "Note updated successfully" });
        }
      }
    );
  };
  

exports.deleteNote = (req, res) => {
  const { noteId } = req.body;

  db.query("DELETE FROM notes WHERE noteId = ?", [noteId], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res.status);
    }
  });
};


