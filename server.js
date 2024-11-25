const express = require("express");
const app = express();
require("dotenv").config();
require("./db");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const port = process.env.PORT;

app.get("/", function (req, res) {
  console.log("this is called");
  res.send("hello from server of votting app");
});

const candidateRoutes = require("./routes/CandidateRoutes");
const userRoutes = require("./routes/UserRoutes");
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(port, () => {
  console.log("listening on port 3000");
});
