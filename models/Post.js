const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    images: [{ type: String, required: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Post", postSchema);
