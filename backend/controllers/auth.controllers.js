import User from "../models/user.model.js";
import genToken from "../config/token.js";
import bcrypt from "bcryptjs";
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({
        message: "Email already exists!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      password: hashedPassword,
      email,
    });
    const token = await genToken(user._id);
    // don't return password in response
    user.password = undefined;
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `sign up error${error}` });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });
    // don't return password in response
    user.password = undefined;
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `login error ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    // Clear the HTTP-only cookie named "token"
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    return res.status(200).json({
      message: "Logged out successfully!"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Logout failed",
      error: error.message
    });
  }
};
