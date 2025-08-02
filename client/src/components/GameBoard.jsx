import React from "react";
import Tile from "./Tile";

const TILE_SIZE = 40;

export default function GameBoard({ map,
    bombs,
    players,
    playerId,
    explosions,
    roomId,
    deadPlayers }) {
    const width = map[0]?.length || 0;
    const height = map.length || 0;

    return (
        <div className="flex flex-col items-center mt-4 text-white">
            <h2 className="text-xl mb-2">Room ID: {roomId}</h2>

            {/* Map container */}
            <div className="relative" style={{ width: width * TILE_SIZE, height: height * TILE_SIZE }}>
                {/* Tiles layer */}

                {map.map((row, y) =>
                    row.map((tile, x) => (
                        <Tile
                            key={`${x}-${y}`}
                            x={x}
                            y={y}
                            type={tile}
                            bombs={bombs}
                            players={players}
                            TILE_SIZE={TILE_SIZE}
                            playerId={playerId}
                            explosions={explosions}
                            deadPlayers={deadPlayers}
                        />

                    ))
                )}
            </div>
        </div>
    );
}

