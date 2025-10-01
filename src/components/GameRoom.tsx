import { useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { PlayerList, Player } from "./PlayerList";
import { ChatArea, ChatMessage } from "./ChatArea";

import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const GameRoom = () => {
  const { toast } = useToast();

  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const roomid = searchParams.get("id");

  // Mock game state - in real app this would come from backend
  const [gameState, setGameState] = useState({
    currentPlayer: "player1",
    currentWord: "ዝናብ", // Rain in Amharic
    timeLeft: 75,
    round: 1,
    totalRounds: 3,
    isPlaying: false,
  });

  const [players] = useState<Player[]>([
    {
      id: "player1",
      name: "አበበ",
      score: 150,
      isDrawing: true,
      isConnected: true,
    },
    { id: "player2", name: "ፍቃዱ", score: 120, isConnected: true },
    { id: "player3", name: "Sarah", score: 90, isConnected: true },
  ]);

  const [messages] = useState<ChatMessage[]>([
    {
      id: "1",
      playerId: "player2",
      playerName: "ፍቃዱ",
      message: "ውሃ",
      timestamp: new Date(Date.now() - 60000),
      type: "guess",
    },
    {
      id: "2",
      playerId: "player3",
      playerName: "Sarah",
      message: "ውሃ",
      timestamp: new Date(Date.now() - 30000),
      type: "close",
    },
    {
      id: "3",
      playerId: "system",
      playerName: "System",
      message: "መልሰዋል",
      timestamp: new Date(Date.now() - 10000),
      type: "correct",
    },
    {
      id: "4",
      playerId: "system",
      playerName: "System",
      message: "መልሰዋል",
      timestamp: new Date(Date.now() - 10000),
      type: "correct",
    },
    {
      id: "5",
      playerId: "girly",
      playerName: "sds",
      message: "water",
      timestamp: new Date(Date.now() - 10000),
      type: "guess",
    },
    {
      id: "6",
      playerId: "sddsds",
      playerName: "sdsdsd",
      message: "rain",
      timestamp: new Date(Date.now() - 10000),
      type: "guess",
    },
    {
      id: "7",
      playerId: "system",
      playerName: "System",
      message: "መልሰዋል",
      timestamp: new Date(Date.now() - 10000),
      type: "correct",
    },
  ]);
  const navigate = useNavigate();
  const isCurrentPlayerDrawing = gameState.currentPlayer === "player1"; // Assume current user is player1
  const handleLeaveRoom = () => {
    navigate("/");
  };
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomid);
    toast({
      title: "Room code copied!",
      description: "Share this code with friends to invite them.",
    });
  };
  const handleStartGame = () => {
    setGameState({ ...gameState, isPlaying: true });
    toast({
      title: "Game started!",
      description: "Let the drawing begin!",
    });
  };
  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    // In real app, this would send to backend
  };

  const handleLikeDrawing = () => {
    toast({
      title: "Drawing liked! 👍",
      description: "You liked this drawing",
    });
    // In real app, would send like to backend and show in chat
    console.log("Player liked the drawing");
  };

  const handleDislikeDrawing = () => {
    toast({
      title: "Feedback sent",
      description: "You disliked this drawing",
    });
    console.log("Player disliked the drawing");
  };

  return (
    <div className="min-h-screen w-full h-full bg-background py-3 px-1">
      <div className="w-full mx-auto">
        {/* Private Room Controls */}
        {type === "private" && !gameState.isPlaying && (
          <div className="mb-2 flex items-center w-full justify-center ">
            <div className="flex p-2 space-x-3 w-1/2 items-center justify-center">
              <Button
                variant="game"
                className="w-2/4"
                onClick={handleStartGame}
              >
                Start Game
              </Button>
              <Button
                variant="outline"
                className="w-2/4"
                onClick={handleCopyRoomId}
              >
                <Copy className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        )}
        {/* Game Layout */}
        <div className="flex max-h-screen">
          {/* Left Sidebar - Players */}
          <div className="min-w-48 mr-2">
            <PlayerList
              players={players}
              timeLeft={gameState.timeLeft}
              onLeaveRoom={handleLeaveRoom}
              currentRound={gameState.round}
              totalRounds={gameState.totalRounds}
            />
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 h-full mr-2">
            <DrawingCanvas
              isDrawing={isCurrentPlayerDrawing}
              word={gameState.currentWord}
              onLike={handleLikeDrawing}
              onDislike={handleDislikeDrawing}
            />
          </div>

          {/* Right Sidebar - Chat */}
          <div className="">
            <ChatArea
              messages={messages}
              onSendMessage={handleSendMessage}
              isDrawing={isCurrentPlayerDrawing}
              canGuess={gameState.isPlaying}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
