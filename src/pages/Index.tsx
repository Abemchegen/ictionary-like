import { useState } from "react";
import { GameLobby } from "@/components/GameLobby";
import { GameRoom } from "@/components/GameRoom";

const Index = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const handleCreateRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  return (
    <>
      {!currentRoom ? (
        <GameLobby 
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      ) : (
        <GameRoom 
          roomId={currentRoom}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </>
  );
};

export default Index;
