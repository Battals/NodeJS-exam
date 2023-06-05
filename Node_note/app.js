const express = require("express");
const path = require("path");
const mysql = require("mysql");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "html");
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DATABASE_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MYSQL CONNECTED");
  }
});

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));

io.on("connection", (socket) => {
  console.log("A user connected");


  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

http.listen(5000, () => {
  console.log("Server started on port 5000");
});
