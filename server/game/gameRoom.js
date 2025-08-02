class GameRoom {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.io = io;
    this.players = {}; // playerId -> { id, x, y, alive }
    this.map = this.generateRandomMap(15, 15); // can parametrize later
    this.bombs = []; // Array of { x, y, byPlayer, placedAt }
  }

  generateRandomMap(width, height) {
    const map = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          row.push(1); // indestructible wall border
        } else if (Math.random() < 0.15) {
          row.push(2); // breakable block
        } else {
          row.push(0); // empty
        }
      }
      map.push(row);
    }
    return map;
  }

  addPlayer(socket) {
    const id = socket.id;
    const pos = this.getSpawnPosition();

    this.players[id] = {
      id,
      x: pos.x,
      y: pos.y,
      alive: true,
    };

    socket.join(this.roomId);

    // Send initial state only to the joining player
    socket.emit('init', {
      map: this.map,
      players: this.players,
      playerId: id,
    });

    // Broadcast updated player list to everyone in room
    this.broadcastPlayers();

    // Set up per-socket handlers
    const moveHandler = (direction) => {
      this.handleMovement(id, direction);
    };

    const disconnectHandler = () => {
      this.removePlayer(id);
      // cleanup listeners (Socket.IO auto removes on disconnect)
    };

    const bombHandler = () => this.placeBomb(id);

    socket.on('move', moveHandler);
    socket.on('place_bomb', bombHandler);
    socket.once('disconnect', disconnectHandler);
  }

  removePlayer(socketId) {
    if (this.players[socketId]) {
      delete this.players[socketId];
      this.broadcastPlayers();
    }
  }

  handleMovement(socketId, direction) {
    const player = this.players[socketId];
    if (!player || !player.alive) return;

    let { x, y } = player;

    if (direction === 'up') y--;
    if (direction === 'down') y++;
    if (direction === 'left') x--;
    if (direction === 'right') x++;

    // Bounds + collision with non-walkable tile
    if (
      x < 0 ||
      y < 0 ||
      y >= this.map.length ||
      x >= this.map[0].length ||
      this.map[y][x] !== 0
    ) {
      return;
    }

    player.x = x;
    player.y = y;

    this.broadcastPlayers();
  }

  placeBomb(playerId) {
    const player = this.players[playerId];
    if (!player || !player.alive) return;

    const existing = this.bombs.find(b => b.x === player.x && b.y === player.y);
    if (existing) return; // prevent multiple bombs in one place

    const bomb = { x: player.x, y: player.y, byPlayer: playerId, placedAt: Date.now() };
    this.bombs.push(bomb);
    this.io.to(this.roomId).emit('bomb_placed', bomb);

    setTimeout(() => this.explodeBomb(bomb), 2000);
  }

  explodeBomb(bomb) {
    const blastTiles = this.getBlastTiles(bomb);
    const killedPlayers = [];
  
    // Remove breakable blocks
    for (let { x, y } of blastTiles) {
      if (this.map[y][x] === 2) {
        this.map[y][x] = 0;
      }
    }
  
    // Kill players
    for (let id in this.players) {
      const player = this.players[id];
      if (!player.alive) continue;
  
      if (blastTiles.some(tile => tile.x === player.x && tile.y === player.y)) {
        player.alive = false;
        killedPlayers.push({ id, x: player.x, y: player.y });
      }
    }
  
    this.bombs = this.bombs.filter(b => !(b.x === bomb.x && b.y === bomb.y && b.byPlayer === bomb.byPlayer));
  
    this.broadcastPlayers();
    this.io.to(this.roomId).emit('bomb_exploded', {
      bomb,
      blastTiles,
      updatedMap: this.map,
      killedPlayers
    });
    this.io.to(this.roomId).emit('bombs_update', this.bombs);
  }
  

  getBlastTiles(bomb) {
    const dirs = [
      { dx: 0, dy: 0 }, // center
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];
    const tiles = [];
    for (let { dx, dy } of dirs) {
      const x = bomb.x + dx;
      const y = bomb.y + dy;
      if (x >= 0 && y >= 0 && y < this.map.length && x < this.map[0].length) {
        tiles.push({ x, y });
      }
    }
    return tiles;
  }

  broadcastPlayers() {
    this.io.to(this.roomId).emit('players_update', this.players);
  }

  getSpawnPosition() {
    const width = this.map[0].length;
    const height = this.map.length;
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const isEmpty = this.map[y][x] === 0;
      const occupied = Object.values(this.players).some(p => p.x === x && p.y === y);
      if (isEmpty && !occupied) {
        return { x, y };
      }
    }

    // fallback to a deterministic safe spot
    return { x: 1, y: 1 };
  }

  hasNoPlayers() {
    return Object.keys(this.players).length === 0;
  }
}

module.exports = GameRoom;
