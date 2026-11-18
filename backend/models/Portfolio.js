const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    email: String,
    phone: String,
    profession: String,
    about: String,
    education: String,
    skills: String,
    photo: String,

    projects: [
        {
            name: String,
            description: String,
            technologies: String,
            link: String
        }
    ],

    slug: {
        type: String,
        unique: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Portfolio", portfolioSchema);