const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"],
      required: true,
    },
    profilePic: { type: String }, // URL or local path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);
