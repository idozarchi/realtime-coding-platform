require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const codeBlockRoutes = require('./routes/codeBlocks');
const connectDB = require('./config/database');
const { corsOptions, socketCorsOptions } = require('./config/cors');
const setupStaticFiles = require('./config/staticConfig');
const setupSocketHandlers = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketCorsOptions);

connectDB();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/codeblocks', codeBlockRoutes);

setupSocketHandlers(io);

setupStaticFiles(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});