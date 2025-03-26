// Define allowed origins
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "https://realtime-coding-platform-xi.vercel.app",
    "https://realtime-coding-platform-git-main-idos-projects-e7dca031.vercel.app"
].filter(Boolean); // Remove any undefined values

// CORS configuration for Express
const corsOptions = {
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};

// CORS configuration for Socket.IO
const socketCorsOptions = {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
};

module.exports = {
    allowedOrigins,
    corsOptions,
    socketCorsOptions
}; 