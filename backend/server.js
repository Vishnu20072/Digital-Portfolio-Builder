
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Portfolio = require("./models/Portfolio");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Home API
app.get("/", (req, res) => {
    res.send("Welcome to Digital Portfolio Builder!");
});

// Authentication Middleware
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access denied. Token required."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.id;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// Login API
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        // Find user in MongoDB
        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful!",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log("Login Error:", error.message);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// Registration API
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "Registration successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.log("Registration Error:", error.message);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// Save / Update Portfolio API
app.post("/portfolio", verifyToken, async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            profession,
            about,
            education,
            skills,
            photo,
            projects
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        // Generate unique portfolio slug
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") +
            "-" + req.userId;

        // Save or update portfolio
        const portfolio = await Portfolio.findOneAndUpdate(
            { userId: req.userId },
            {
                userId: req.userId,
                name,
                email,
                phone,
                profession,
                about,
                education,
                skills,
                photo,
                projects: projects || [],
                slug
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            message: "Portfolio saved to MongoDB successfully!",
            portfolio
        });

    } catch (error) {
        console.log("Portfolio Save Error:", error.message);

        res.status(500).json({
            message: "Failed to save portfolio"
        });
    }
});

// Get logged-in user's portfolio
app.get("/portfolio/my", verifyToken, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({
            userId: req.userId
        });

        if (!portfolio) {
            return res.status(404).json({
                message: "Portfolio not found"
            });
        }

        res.json(portfolio);

    } catch (error) {
        console.log("Portfolio Fetch Error:", error.message);

        res.status(500).json({
            message: "Failed to fetch portfolio"
        });
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Failed:", error.message);
    });

