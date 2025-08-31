const Player = require("../models/Player");
const xlsx = require("xlsx");
const fs = require("fs");

// Normalize role values coming from sheet
function normalizeRole(raw = "") {
  const s = String(raw).trim().toLowerCase();
  if (["batsman", "bat", "batter"].includes(s)) return "Batsman";
  if (["bowler"].includes(s)) return "Bowler";
  if (["all-rounder", "all rounder", "allrounder", "all"].includes(s)) return "All-Rounder";
  if (["wicket-keeper", "wicketkeeper", "wk", "keeper"].includes(s)) return "Wicket-Keeper";
  return raw; // fallback (will fail enum if invalid)
}

// @desc Upload Excel & save players
// @route POST /api/players/upload
const uploadPlayers = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Transform Excel rows to match schema
    const playersData = sheetData
      .map((row) => {
        const name = row["Name"]?.toString().trim();
        const role = normalizeRole(row["Role"]);
        if (!name || !role) return null; // skip invalid
        return {
          name,
          role,
          profilePic: row["Profile Picture"] ? String(row["Profile Picture"]).trim() : "",
        };
      })
      .filter(Boolean);

    // Clear old data & insert
    await Player.deleteMany({});
    const players = await Player.insertMany(playersData);

    // Delete uploaded file (optional)
    try { fs.unlinkSync(filePath); } catch {}

    res.json({
      message: "Players uploaded successfully!",
      firstPlayer: players[0] || null
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload players" });
  }
};

// @desc Get all players (raw order)
// @route GET /api/players
const getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch players" });
  }
};

// @desc Get one player by index in raw order
// @route GET /api/players/:index
const getPlayerByIndex = async (req, res) => {
  try {
    const players = await Player.find();
    const index = parseInt(req.params.index, 10);
    if (index < 0 || index >= players.length) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json(players[index]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player" });
  }
};

// @desc Get auction order in round-robin sets (10/10/10/5)
// @route GET /api/players/auction-order
const getAuctionOrder = async (req, res) => {
  try {
    const ORDER = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
    const QUOTA = { "Batsman": 10, "Bowler": 10, "All-Rounder": 10, "Wicket-Keeper": 5 };

    // preserve insertion order, then group by role
    const all = await Player.find().lean();
    const groups = {
      "Batsman": [],
      "Bowler": [],
      "All-Rounder": [],
      "Wicket-Keeper": []
    };
    for (const p of all) {
      if (groups[p.role]) groups[p.role].push(p);
    }

    const result = [];
    const markers = []; // { index, label }

    let cycle = 0;
    const hasRemaining = () =>
      ORDER.some((r) => groups[r].length > 0);

    while (hasRemaining()) {
      cycle += 1;
      for (const role of ORDER) {
        const bucket = groups[role];
        if (bucket.length === 0) continue;

        // marker at the start of each role-chunk in this cycle
        const startIndex = result.length;
        markers.push({ index: startIndex, label: `${role} Set ${cycle}` });

        const take = QUOTA[role];
        const chunk = bucket.splice(0, take); // take up to quota
        result.push(...chunk);
      }
    }

    res.json({ players: result, markers });
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Failed to build auction order" });
  }
};

module.exports = {
  uploadPlayers,
  getPlayers,
  getPlayerByIndex,
  getAuctionOrder
};
