const express = require("express");
const router = express.Router();
const User = require("./../modals/users");
const { jwtAuthMiddleWare, generateJWtToken } = require("./../jwt");

router.post("/signup", async (req, res) => {
  try {
    console.log("signup called");
    const data = req.body;
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("data saved");
    const payload = {
      id: response.id,
    };
    const token = generateJWtToken(payload, process.env.JWT_Secret);
    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log("signup", error);
    res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { adharCardNumber, password } = req.body;
    const user = await User.findOne({ adharCardNumber: adharCardNumber });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid user name or password" });
    }
    const payLoad = {
      id: user.id,
    };
    const token = generateJWtToken(payLoad);

    res.status(200).json({ message: "login sucessfull", token: token });
  } catch (error) {
    console.log("login", error);
    res.status(500).json({ message: "internal server error", error: error });
  }
});

router.get("/profile", jwtAuthMiddleWare, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    console.log("user", user);
    res.status(200).json({ message: "Profile data", data: user });
  } catch (error) {
    console.log("login", error);
    res.status(500).json({ message: "internal server error", error: error });
  }
});

router.put("/profile/password", jwtAuthMiddleWare, async (req, res) => {
  try {
    const userData = req.user;
    const { currentPassword, newPassword } = req.body;
    const userId = userData.id;
    const user = await User.findById(userId);
    if (!user.comparePassword(currentPassword)) {
      return res.status(400).json({ message: "Invalid password" });
    }
    user.password = newPassword;

    const response = await user.save();
    res
      .status(200)
      .json({ message: "Password updated sucessfully", response: response });
  } catch (error) {
    console.log("login", error);
    res.status(500).json({ message: "internal server error", error: error });
  }
});

module.exports = router;
