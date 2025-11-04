import express from "express";
import { Login, logOut, signUp } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

// POST   /api/users/signup  → Create new user
authRouter.post("/signup", signUp);

// POST   /api/users/login   → Authenticate user
authRouter.post("/login", Login);

// GET    /api/users/logout  → Clear cookie & log out
authRouter.get("/logout", logOut);

export default authRouter;