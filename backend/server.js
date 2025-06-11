// // const express = require('express');
// // const http = require('http');
// // const { Server } = require('socket.io');
// // const cors = require('cors');

// // const app = express();
// // app.use(cors());

// // const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: {
// //     origin: "http://localhost:3000",
// //     methods: ["GET", "POST"]
// //   }
// // });

// // const rooms = new Map();
// // const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes

// // console.log('Server started. Active rooms:', [...rooms.keys()]);

// // io.on('connection', (socket) => {
// //   console.log(`User connected: ${socket.id}`);
// //   console.log('Current rooms:', [...rooms.entries()].map(([code, room]) => ({
// //     code,
// //     players: room.players.map(p => p.name)
// //   })));

// //   socket.on('createRoom', ({ roomCode, name }, callback) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     if (rooms.has(normalizedCode)) {
// //       return callback({ error: 'Room already exists' });
// //     }

// //     const newRoom = {
// //       players: [{ id: socket.id, name, symbol: 'X', isConnected: true }],
// //       currentTurn: 'X',
// //       board: Array(9).fill(null),
// //       createdAt: Date.now(),
// //       lastActivity: Date.now()
// //     };

// //     rooms.set(normalizedCode, newRoom);
// //     socket.join(normalizedCode);
// //     callback({ success: true, roomCode: normalizedCode, yourSymbol: 'X' });
// //   });

// //   socket.on('joinRoom', ({ roomCode, name }, callback) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     const room = rooms.get(normalizedCode);
// //     if (!room) return callback({ error: 'Room does not exist' });
// //     if (room.players.length >= 2) return callback({ error: 'Room is full' });

// //     const newPlayer = { id: socket.id, name, symbol: 'O', isConnected: true };
// //     room.players.push(newPlayer);
// //     room.lastActivity = Date.now();
// //     socket.join(normalizedCode);

// //     room.players.forEach(player => {
// //       io.to(player.id).emit('startGame', {
// //         roomCode: normalizedCode,
// //         players: room.players,
// //         currentTurn: room.currentTurn,
// //         yourSymbol: player.symbol
// //       });
// //     });

// //     callback({ success: true });
// //   });

// //   socket.on('makeMove', ({ roomCode, cellIndex, symbol }) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     const room = rooms.get(normalizedCode);
// //     if (!room) return;
// //     if (room.board[cellIndex] !== null || room.currentTurn !== symbol) return;

// //     room.board[cellIndex] = symbol;
// //     room.currentTurn = symbol === 'X' ? 'O' : 'X';
// //     room.lastActivity = Date.now();

// //     io.to(normalizedCode).emit('moveMade', {
// //       cellIndex,
// //       symbol,
// //       currentTurn: room.currentTurn,
// //       board: room.board
// //     });

// //     checkWinner(room, normalizedCode);
// //   });

// //   function checkWinner(room, roomCode) {
// //     const winPatterns = [
// //       [0, 1, 2], [3, 4, 5], [6, 7, 8],
// //       [0, 3, 6], [1, 4, 7], [2, 5, 8],
// //       [0, 4, 8], [2, 4, 6]
// //     ];

// //     for (const [a, b, c] of winPatterns) {
// //       if (room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]) {
// //         io.to(roomCode).emit('gameEnded', { winner: room.board[a] });
// //         return true;
// //       }
// //     }

// //     if (!room.board.includes(null)) {
// //       io.to(roomCode).emit('gameEnded', { winner: 'draw' });
// //       return true;
// //     }

// //     return false;
// //   }

// //   socket.on('resetGame', ({ roomCode }) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     const room = rooms.get(normalizedCode);
// //     if (room) {
// //       room.board = Array(9).fill(null);
// //       room.currentTurn = 'X';
// //       room.lastActivity = Date.now();
// //       io.to(normalizedCode).emit('gameReset', {
// //         board: room.board,
// //         currentTurn: room.currentTurn
// //       });
// //     }
// //   });

// //   socket.on('gameOver', ({ roomCode, winner }) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     const room = rooms.get(normalizedCode);
// //     if (room) {
// //       io.to(normalizedCode).emit('gameEnded', { winner });
// //     }
// //   });

// //   socket.on('getGameState', ({ roomCode }, callback) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     const room = rooms.get(normalizedCode);
// //     if (room) {
// //       callback({
// //         board: room.board,
// //         currentTurn: room.currentTurn,
// //         players: room.players
// //       });
// //     } else {
// //       callback(null);
// //     }
// //   });

// //   socket.on('disconnect', () => {
// //     console.log(`User disconnected: ${socket.id}`);
// //     for (const [roomCode, room] of rooms) {
// //       const player = room.players.find(p => p.id === socket.id);
// //       if (player) {
// //         player.isConnected = false;
// //         room.lastActivity = Date.now();
// //         const remainingPlayer = room.players.find(p => p.isConnected);
// //         if (remainingPlayer) {
// //           io.to(remainingPlayer.id).emit('partnerDisconnected');
// //         }
// //       }
// //     }
// //   });

// //   socket.on('reconnectToRoom', ({ roomCode }, callback) => {
// //     const normalizedCode = roomCode.toUpperCase().trim();
// //     const room = rooms.get(normalizedCode);
// //     if (!room) return callback({ error: 'Room does not exist' });

// //     const player = room.players.find(p => p.id === socket.id);
// //     if (player) {
// //       player.isConnected = true;
// //       room.lastActivity = Date.now();
// //       socket.join(normalizedCode);

// //       const otherPlayer = room.players.find(p => p.id !== socket.id && p.isConnected);
// //       if (otherPlayer) {
// //         io.to(otherPlayer.id).emit('partnerReconnected');
// //       }

// //       return callback({
// //         success: true,
// //         roomState: {
// //           players: room.players,
// //           currentTurn: room.currentTurn,
// //           board: room.board
// //         }
// //       });
// //     }

// //     callback({ error: 'Player not found in room' });
// //   });
// // });

// // setInterval(() => {
// //   const now = Date.now();
// //   for (const [roomCode, room] of rooms) {
// //     if (
// //       room.players.length === 0 ||
// //       (room.players.every(p => !p.isConnected) && now - room.lastActivity > MAX_INACTIVE_TIME)
// //     ) {
// //       rooms.delete(roomCode);
// //       console.log(`Cleaned up inactive room: ${roomCode}`);
// //     }
// //   }
// // }, 60 * 1000); // Every minute

// // const PORT = process.env.PORT || 5000;
// // server.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
//   connectionStateRecovery: {
//     maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
//     skipMiddlewares: true,
//   },
//   pingInterval: 10000,  // Send ping every 10 seconds
//   pingTimeout: 5000,    // Wait 5 seconds for pong before considering connection dead
// });

// const rooms = new Map();
// const MAX_INACTIVE_TIME = 30 * 60 * 1000; // 30 minutes

// console.log('Server started. Active rooms:', [...rooms.keys()]);

// // Track all connected sockets
// const connectedSockets = new Set();

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);
//   connectedSockets.add(socket.id);
  
//   // Send current room state to newly connected client
//   sendCurrentRoomState();

//   // Handle reconnection events
//   socket.on('reconnect', (attemptNumber) => {
//     console.log(`User reconnected: ${socket.id}, attempt ${attemptNumber}`);
//     // Re-establish room presence
//     for (const [roomCode, room] of rooms) {
//       const player = room.players.find(p => p.id === socket.id);
//       if (player) {
//         player.isConnected = true;
//         room.lastActivity = Date.now();
//         socket.join(roomCode);
        
//         // Notify other players in the room
//         room.players.forEach(p => {
//           if (p.id !== socket.id && p.isConnected) {
//             io.to(p.id).emit('partnerReconnected');
//           }
//         });
        
//         // Send updated game state to reconnected player
//         io.to(socket.id).emit('gameStateUpdate', {
//           board: room.board,
//           currentTurn: room.currentTurn,
//           players: room.players
//         });
//       }
//     }
//   });

//   socket.on('createRoom', ({ roomCode, name }, callback) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     if (rooms.has(normalizedCode)) {
//       return callback({ error: 'Room already exists' });
//     }

//     const newRoom = {
//       players: [{ id: socket.id, name, symbol: 'X', isConnected: true }],
//       currentTurn: 'X',
//       board: Array(9).fill(null),
//       createdAt: Date.now(),
//       lastActivity: Date.now()
//     };

//     rooms.set(normalizedCode, newRoom);
//     socket.join(normalizedCode);
//     callback({ success: true, roomCode: normalizedCode, yourSymbol: 'X' });
    
//     sendCurrentRoomState();
//   });

//   // ... [keep all your other existing event handlers] ...
//     socket.on('joinRoom', ({ roomCode, name }, callback) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     const room = rooms.get(normalizedCode);
//     if (!room) return callback({ error: 'Room does not exist' });
//     if (room.players.length >= 2) return callback({ error: 'Room is full' });

//     const newPlayer = { id: socket.id, name, symbol: 'O', isConnected: true };
//     room.players.push(newPlayer);
//     room.lastActivity = Date.now();
//     socket.join(normalizedCode);

//     room.players.forEach(player => {
//       io.to(player.id).emit('startGame', {
//         roomCode: normalizedCode,
//         players: room.players,
//         currentTurn: room.currentTurn,
//         yourSymbol: player.symbol
//       });
//     });

//     callback({ success: true });
//   });

//   socket.on('makeMove', ({ roomCode, cellIndex, symbol }) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     const room = rooms.get(normalizedCode);
//     if (!room) return;
//     if (room.board[cellIndex] !== null || room.currentTurn !== symbol) return;

//     room.board[cellIndex] = symbol;
//     room.currentTurn = symbol === 'X' ? 'O' : 'X';
//     room.lastActivity = Date.now();

//     io.to(normalizedCode).emit('moveMade', {
//       cellIndex,
//       symbol,
//       currentTurn: room.currentTurn,
//       board: room.board
//     });

//     checkWinner(room, normalizedCode);
//   });

//   function checkWinner(room, roomCode) {
//     const winPatterns = [
//       [0, 1, 2], [3, 4, 5], [6, 7, 8],
//       [0, 3, 6], [1, 4, 7], [2, 5, 8],
//       [0, 4, 8], [2, 4, 6]
//     ];

//     for (const [a, b, c] of winPatterns) {
//       if (room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]) {
//         io.to(roomCode).emit('gameEnded', { winner: room.board[a] });
//         return true;
//       }
//     }

//     if (!room.board.includes(null)) {
//       io.to(roomCode).emit('gameEnded', { winner: 'draw' });
//       return true;
//     }

//     return false;
//   }

//   socket.on('resetGame', ({ roomCode }) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     const room = rooms.get(normalizedCode);
//     if (room) {
//       room.board = Array(9).fill(null);
//       room.currentTurn = 'X';
//       room.lastActivity = Date.now();
//       io.to(normalizedCode).emit('gameReset', {
//         board: room.board,
//         currentTurn: room.currentTurn
//       });
//     }
//   });

//   socket.on('gameOver', ({ roomCode, winner }) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     const room = rooms.get(normalizedCode);
//     if (room) {
//       io.to(normalizedCode).emit('gameEnded', { winner });
//     }
//   });

//   socket.on('getGameState', ({ roomCode }, callback) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     const room = rooms.get(normalizedCode);
//     if (room) {
//       callback({
//         board: room.board,
//         currentTurn: room.currentTurn,
//         players: room.players
//       });
//     } else {
//       callback(null);
//     }
//   });



//   socket.on('disconnect', (reason) => {
//     console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
//     connectedSockets.delete(socket.id);
    
//     // Mark player as disconnected but keep them in the room temporarily
//     for (const [roomCode, room] of rooms) {
//       const player = room.players.find(p => p.id === socket.id);
//       if (player) {
//         player.isConnected = false;
//         room.lastActivity = Date.now();
        
//         // Notify other players in the room
//         room.players.forEach(p => {
//           if (p.id !== socket.id && p.isConnected) {
//             io.to(p.id).emit('partnerDisconnected');
//           }
//         });
//       }
//     }
    
//     sendCurrentRoomState();
//   });

//   // Heartbeat mechanism
//   socket.on('ping', (cb) => {
//     if (typeof cb === 'function') {
//       cb();
//     }
//   });
//     socket.on('reconnectToRoom', ({ roomCode }, callback) => {
//     const normalizedCode = roomCode.toUpperCase().trim();
//     const room = rooms.get(normalizedCode);
//     if (!room) return callback({ error: 'Room does not exist' });

//     const player = room.players.find(p => p.id === socket.id);
//     if (player) {
//       player.isConnected = true;
//       room.lastActivity = Date.now();
//       socket.join(normalizedCode);

//       const otherPlayer = room.players.find(p => p.id !== socket.id && p.isConnected);
//       if (otherPlayer) {
//         io.to(otherPlayer.id).emit('partnerReconnected');
//       }

//       return callback({
//         success: true,
//         roomState: {
//           players: room.players,
//           currentTurn: room.currentTurn,
//           board: room.board
//         }
//       });
//     }

//     callback({ error: 'Player not found in room' });
//   });
// });

// setInterval(() => {
//   const now = Date.now();
//   for (const [roomCode, room] of rooms) {
//     if (
//       room.players.length === 0 ||
//       (room.players.every(p => !p.isConnected) && now - room.lastActivity > MAX_INACTIVE_TIME)
//     ) {
//       rooms.delete(roomCode);
//       console.log(`Cleaned up inactive room: ${roomCode}`);
//     }
//   }
// }, 60 * 1000); // Every minute

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);

// });

// function sendCurrentRoomState() {
//   console.log('Current rooms:', [...rooms.entries()].map(([code, room]) => ({
//     code,
//     players: room.players.map(p => p.name)
//   })));
// }

// // ... [keep your existing cleanup interval and server startup code] ...
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://ultimate-tic-tac-toe-frontend.vercel.app/",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const rooms = new Map();
const MAX_INACTIVE_TIME = 30 * 60 * 1000;

console.log('Server started. Active rooms:', [...rooms.keys()]);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Send heartbeat every 10 seconds
  const heartbeatInterval = setInterval(() => {
    socket.emit('heartbeat');
  }, 10000);

  socket.on('createRoom', ({ roomCode, name }, callback) => {
    const normalizedCode = roomCode.toUpperCase().trim();
    if (rooms.has(normalizedCode)) {
      return callback({ error: 'Room already exists' });
    }

    const newRoom = {
      players: [{ id: socket.id, name, symbol: 'X', isConnected: true }],
      currentTurn: 'X',
      board: Array(9).fill(null),
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    rooms.set(normalizedCode, newRoom);
    socket.join(normalizedCode);
    callback({ success: true, roomCode: normalizedCode, yourSymbol: 'X' });
    updateRoomState(normalizedCode);
  });

  socket.on('joinRoom', ({ roomCode, name }, callback) => {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = rooms.get(normalizedCode);
    if (!room) return callback({ error: 'Room does not exist' });
    if (room.players.length >= 2) return callback({ error: 'Room is full' });

    const newPlayer = { id: socket.id, name, symbol: 'O', isConnected: true };
    room.players.push(newPlayer);
    room.lastActivity = Date.now();
    socket.join(normalizedCode);

    updateRoomState(normalizedCode);
    callback({ success: true });
  });

  socket.on('makeMove', ({ roomCode, cellIndex, symbol }) => {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = rooms.get(normalizedCode);
    if (!room) return;
    if (room.board[cellIndex] !== null || room.currentTurn !== symbol) return;

    room.board[cellIndex] = symbol;
    room.currentTurn = symbol === 'X' ? 'O' : 'X';
    room.lastActivity = Date.now();

    io.to(normalizedCode).emit('moveMade', {
      cellIndex,
      symbol,
      currentTurn: room.currentTurn,
      board: room.board
    });

    checkWinner(room, normalizedCode);
  });

  function checkWinner(room, roomCode) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of winPatterns) {
      if (room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]) {
        io.to(roomCode).emit('gameEnded', { winner: room.board[a] });
        return true;
      }
    }

    if (!room.board.includes(null)) {
      io.to(roomCode).emit('gameEnded', { winner: 'draw' });
      return true;
    }

    return false;
  }

  socket.on('resetGame', ({ roomCode }) => {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = rooms.get(normalizedCode);
    if (room) {
      room.board = Array(9).fill(null);
      room.currentTurn = 'X';
      room.lastActivity = Date.now();
      io.to(normalizedCode).emit('gameReset', {
        board: room.board,
        currentTurn: room.currentTurn
      });
    }
  });

  socket.on('getGameState', ({ roomCode }, callback) => {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = rooms.get(normalizedCode);
    if (room) {
      callback({
        board: room.board,
        currentTurn: room.currentTurn,
        players: room.players
      });
    } else {
      callback(null);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    clearInterval(heartbeatInterval);
    
    for (const [roomCode, room] of rooms) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.isConnected = false;
        room.lastActivity = Date.now();
        const remainingPlayer = room.players.find(p => p.isConnected);
        if (remainingPlayer) {
          io.to(remainingPlayer.id).emit('partnerDisconnected');
        }
      }
    }
  });

  socket.on('reconnectToRoom', ({ roomCode }, callback) => {
    const normalizedCode = roomCode.toUpperCase().trim();
    const room = rooms.get(normalizedCode);
    if (!room) return callback({ error: 'Room does not exist' });

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isConnected = true;
      room.lastActivity = Date.now();
      socket.join(normalizedCode);

      const otherPlayer = room.players.find(p => p.id !== socket.id && p.isConnected);
      if (otherPlayer) {
        io.to(otherPlayer.id).emit('partnerReconnected');
      }

      return callback({
        success: true,
        roomState: {
          players: room.players,
          currentTurn: room.currentTurn,
          board: room.board
        }
      });
    }

    callback({ error: 'Player not found in room' });
  });
});

function updateRoomState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players.forEach(player => {
    io.to(player.id).emit('startGame', {
      roomCode,
      players: room.players,
      currentTurn: room.currentTurn,
      yourSymbol: player.symbol
    });
  });
}

setInterval(() => {
  const now = Date.now();
  for (const [roomCode, room] of rooms) {
    if (
      room.players.length === 0 ||
      (room.players.every(p => !p.isConnected) && now - room.lastActivity > MAX_INACTIVE_TIME)
    ) {
      rooms.delete(roomCode);
      console.log(`Cleaned up inactive room: ${roomCode}`);
    }
  }
}, 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});