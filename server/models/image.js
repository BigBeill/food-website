const imageSchema = {
   filename: { type: String, required: true },
   url: { type: String, required: true },
   size: { type: Number, required: true },
   mimetype: { type: String, required: true },
   createdAt: { type: Date, default: Date.now },
}