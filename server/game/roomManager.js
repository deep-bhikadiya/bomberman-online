const GameRoom = require('./gameRoom');

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> GameRoom
  }

  joinRoom(socket, roomId) {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new GameRoom(roomId, this.io);
      this.rooms.set(roomId, room);
    }

    room.addPlayer(socket);

    socket.on('disconnect', () => {
      if (room.hasNoPlayers()) {
        this.rooms.delete(roomId);
      }
    });
  }
}

module.exports = RoomManager;
