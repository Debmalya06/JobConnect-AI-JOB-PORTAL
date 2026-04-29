import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
// Import routes
import authRoutes from "./routes/authRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import jobAlertRoutes from "./routes/jobAlertRoutes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/job-alerts", jobAlertRoutes);

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  
  socket.on("join_room", (data) => {
    socket.join(data.room);
  });

  socket.on("send_message", async (data) => {
    try {
      const Message = (await import("./models/Message.js")).default;
      const newMessage = new Message({
        senderId: data.senderId,
        senderModel: data.senderModel,
        receiverId: data.receiverId,
        receiverModel: data.receiverModel,
        jobId: data.jobId,
        content: data.content
      });
      await newMessage.save();
      io.to(data.room).emit("receive_message", newMessage);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

if (process.env.NODE_ENV !== "production") {
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
