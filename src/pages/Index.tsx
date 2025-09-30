import { useState } from "react";
import { GameLobby } from "@/components/GameLobby";
import { GameRoom } from "@/components/GameRoom";

const Index = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentRoomType, setCurrentRoomType] = useState<string | null>(null);

  const handleCreateRoom = (roomId: string, type: string) => {
    setCurrentRoom(roomId);
    setCurrentRoomType(type);
  };

  const handleJoinRoom = (roomId: string, type: string) => {
    setCurrentRoom(roomId);
    setCurrentRoomType(type);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setCurrentRoomType(null);
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
          type={currentRoomType}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </>
  );
};

export default Index;
