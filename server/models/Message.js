import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderModel: { type: String, required: true, enum: ["Company", "Candidate"] },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverModel: { type: String, required: true, enum: ["Company", "Candidate"] },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Message", MessageSchema);
