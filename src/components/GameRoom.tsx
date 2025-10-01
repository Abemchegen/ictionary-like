import { useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { PlayerList, Player } from "./PlayerList";
import { ChatArea, ChatMessage } from "./ChatArea";
import { Button } from "@/components/ui/button";

import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameRoomProps {
  roomId: string;
  type: String;
  onLeaveRoom: () => void;
}

export const GameRoom = ({ roomId, type, onLeaveRoom }: GameRoomProps) => {
  const { toast } = useToast();

  // Mock game state - in real app this would come from backend
  const [gameState, setGameState] = useState({
    currentPlayer: "player1",
    currentWord: "ዝናብ", // Rain in Amharic
    timeLeft: 75,
    round: 1,
    totalRounds: 3,
    isPlaying: true,
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
      message: "መሪያም guessed it!!",
      timestamp: new Date(Date.now() - 10000),
      type: "correct",
    },
  ]);

  const isCurrentPlayerDrawing = gameState.currentPlayer === "player1"; // Assume current user is player1
  const canGuess = gameState.isPlaying && !isCurrentPlayerDrawing;

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
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

  const handlePlayerThumbsUp = (playerId: string, playerName: string) => {
    toast({
      title: `Thumbs up! 👍`,
      description: `You gave ${playerName} a thumbs up!`,
    });
    console.log(`Thumbs up given to player: ${playerName}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Private Room Controls */}
        {type === "private" && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">Room Code:</span>
              <span className="text-lg font-bold text-primary">{roomId}</span>
            </div>
            <Button variant="game" size="lg" onClick={handleStartGame}>
              Start Game
            </Button>
            <Button variant="outline" size="lg" onClick={handleCopyRoomId}>
              <Copy className="w-4 h-4 mr-2" />
              Share with Friends
            </Button>
          </div>
        )}

        {/* Game Layout */}
        <div className="flex">
          {/* Left Sidebar - Players */}
          <div className="">
            <PlayerList
              players={players}
              timeLeft={gameState.timeLeft}
              onLeaveRoom={onLeaveRoom}
              currentRound={gameState.round}
              totalRounds={gameState.totalRounds}
              onPlayerThumbsUp={handlePlayerThumbsUp}
            />
          </div>

          {/* Main Canvas Area */}
          <div className="">
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
              canGuess={canGuess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
