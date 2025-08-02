export default function Tile({
  x,
  y,
  type,
  bombs,
  players,
  playerId,
  TILE_SIZE,
  explosions,
  deadPlayers
}) {
  const hasBomb = bombs.some(b => b.x === x && b.y === y);
  const player = Object.values(players).find(p => p.x === x && p.y === y);
  const isSelf = player?.id === playerId;

  const isExploding = explosions.some(e => e.x === x && e.y === y);
  const isKilledHere = deadPlayers.some(p => p.x === x && p.y === y);

  // Background
  let backgroundColor = "#09090b";
  if (type === 1) backgroundColor = "#27272a"; // wall
  else if (type === 2) backgroundColor = "#ca8a04"; // breakable

  return (
    <div key={`${x}-${y}`}>
      {/* Tile */}
      <div
        className="absolute w-10 h-10 border border-zinc-700 z-0"
        style={{
          left: `${x * TILE_SIZE}px`,
          top: `${y * TILE_SIZE}px`,
          backgroundColor
        }}
      />

      {/* Explosion */}
      {isExploding && (
        <div
          className="absolute w-10 h-10 bg-yellow-300 opacity-70 animate-pulse z-10"
          style={{
            left: `${x * TILE_SIZE}px`,
            top: `${y * TILE_SIZE}px`
          }}
        />
      )}

      {/* Bomb */}
      {hasBomb && !isExploding && (
        <div
          className="absolute z-10 w-6 h-6 rounded-full bg-yellow-400 animate-ping"
          style={{
            left: `${x * TILE_SIZE + 8}px`,
            top: `${y * TILE_SIZE + 8}px`
          }}
        />
      )}

      {/* Player */}
      {player && (
        <div
          className={`absolute z-20 w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold ${player.alive
              ? isSelf
                ? "bg-blue-400"
                : "bg-red-400"
              : "bg-gray-500 text-white"
            }`}
          style={{
            left: `${x * TILE_SIZE + 8}px`,
            top: `${y * TILE_SIZE + 8}px`,
            opacity: player.alive ? 1 : 0.6,
          }}
        >
          {!player.alive && "💀"}
        </div>
      )}

    </div>
  );
}
