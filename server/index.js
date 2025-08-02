// index.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const RoomManager = require('./game/roomManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_room', (roomId) => {
    if (!roomId || typeof roomId !== 'string') return;
    console.log(`Socket ${socket.id} joining room ${roomId}`);
    roomManager.joinRoom(socket, roomId);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Bomberman backend listening on port ${PORT}`);
});
