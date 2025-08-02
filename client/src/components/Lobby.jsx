import React from "react";

export default function Lobby({ onCreateRoom, onJoinRoom, inputRoom, setInputRoom }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
      <div className="p-8 bg-zinc-700 rounded-2xl shadow-xl w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">Bomberman Online</h1>
        <div className="space-y-2">
          <button
            onClick={onCreateRoom}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🎮 Create Room
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white"
            />
            <button
              onClick={() => {
                if (inputRoom.trim()) {
                  onJoinRoom(inputRoom.trim());
                } else {
                  alert("Please enter a room ID to join.");
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
