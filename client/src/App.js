import React, { useState, useEffect } from "react";
import socket from "./utils/socket";
import GameUI from "./components/GameUI";
import Lobby from "./components/Lobby";

function App() {
  const [roomId, setRoomId] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [map, setMap] = useState([]);
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [joined, setJoined] = useState(false);
  const [bombs, setBombs] = useState([]);
  const [explosions, setExplosions] = useState([]);
  const [deadPlayers, setDeadPlayers] = useState([]);

  const joinRoom = (id) => {
    socket.emit("join_room", id);
    setRoomId(id);
    setJoined(true);
  };


  useEffect(() => {
    socket.on("init", ({ map, players, playerId }) => {
      setMap(map);
      setPlayers(players);
      setPlayerId(playerId);
    });

    socket.on("players_update", (players) => {
      setPlayers(players);
    });

    socket.on("bomb_placed", (bomb) => {
      setBombs((prev) => [...prev, bomb]);
    });

    socket.on("bomb_exploded", ({ bomb, blastTiles, updatedMap, killedPlayers }) => {
      setBombs(prev => prev.filter(b => !(b.x === bomb.x && b.y === bomb.y)));
      setMap(updatedMap);
      setExplosions(blastTiles);
      setDeadPlayers(killedPlayers);

      // Clear explosion visuals after 500ms
      setTimeout(() => {
        setExplosions([]);
        setDeadPlayers([]);
      }, 500);
    });


    const handleKeyDown = (e) => {
      const dir = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right"
      }[e.key];

      if (dir) {
        socket.emit("move", dir);
      } else if (e.key === " " || e.key === "e") {
        e.preventDefault();
        socket.emit("place_bomb");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      socket.off("bomb_placed");
      socket.off("bomb_exploded");
    }
  }, []);

  return joined ? (
    <GameUI
      map={map}
      bombs={bombs}
      players={players}
      playerId={playerId}
      roomId={roomId}
      explosions={explosions}
      deadPlayers={deadPlayers}
    />


  ) : (
    <Lobby
      inputRoom={inputRoom}
      setInputRoom={setInputRoom}
      onCreateRoom={() => joinRoom(crypto.randomUUID().slice(0, 6))}
      onJoinRoom={() => joinRoom(inputRoom)}
    />
  );
}

export default App;
