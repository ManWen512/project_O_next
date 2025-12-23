import mongoose, { models, model } from "mongoose";

const AiContentSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  output: { type: String },
  //   embedding: {
  //     type: [Number],
  //     required: true,
  //     validate: {
  //       validator: function(v) {
  //         return v.length === 384; // Match your embedding dimensions
  //       },
  //       message: 'Embedding must have exactly 384 dimensions'
  //     }
  //   },
  //
  chatId: { type: String, required: true }, // for chat messages
  images: [
    {
      url: { type: String },
      source: { type: String },
      author: { type: String },
      license: { type: String },
      imageId: { type: String }, // Unique ID from source (e.g., Unsplash ID)
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// ✅ Safe model export (prevents overwrite)
const AiContent = models?.AiContent || model("AiContent", AiContentSchema);

export default AiContent;
