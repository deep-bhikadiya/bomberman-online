import React from "react";
import GameBoard from "./GameBoard";

export default function GameUI({ map,
  bombs,
  players,
  playerId,
  explosions,
  roomId,
  deadPlayers }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <GameBoard
        map={map}
        bombs={bombs}
        players={players}
        playerId={playerId}
        roomId ={roomId}
        explosions={explosions}
        deadPlayers={deadPlayers}
      />
    </div>
  );
}
