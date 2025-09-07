const express = require('express');
const http = require('http');
const { initIo } = require('./config/socket');
const { initializeSocket } = require('./socket/socketServer');
require('dotenv').config();
const { connectDB } = require('./config/DB');
const {initRedis} = require('./config/redis');
const app = express();

app.set('trust proxy', true);

app.use(express.static('public'));
app.use(express.json());

// Create HTTP server handling both http via Express and websocket via Socket.IO
const httpServer = http.createServer(app);
const io = initIo(httpServer);

// Initialize database connection
connectDB();
initRedis();
// Routes
app.get('/', (req, res) => {res.sendFile(__dirname + '/public/index.html');});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/conversation', require('./routes/conversationRoutes'));
app.use('/api/message', require('./routes/messageRoutes'));

// Initialize Socket.IO
initializeSocket(io);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
