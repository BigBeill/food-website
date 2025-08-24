const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema ({
   filename: { type: String, required: true },
   url: { type: String, required: true },
   size: { type: Number, required: true },
   mimetype: { type: String, required: true },
   uploadedAt: { type: Date, default: Date.now },
});

module.exports = imageSchema;