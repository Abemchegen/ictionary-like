import { useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { PlayerList, Player } from "./PlayerList";
import { ChatArea, ChatMessage } from "./ChatArea";
import { Button } from "@/components/ui/button";

import { Copy, Clock, Trophy, ArrowLeft } from "lucide-react";
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

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    // In real app, this would send to backend
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex bg-game-surface p-1 justify-between items-center">
          {/* Game Status */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 text-sm mr-5 hover:cursor-pointer"
              onClick={() => {
                onLeaveRoom();
              }}
            >
              <ArrowLeft className="w-5" /> <span>ተመለስ</span>
            </div>
            <div className="flex items-center gap-2 text-sm mr-5">
              <Clock className="w-4 h-4 text-accent" />
              <span className="font-mono text-lg text-accent">
                {formatTime(gameState.timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm mr-5">
              <Trophy className="w-4 h-4 text-ethiopia-yellow" />
              <span>
                {gameState.round}/{gameState.totalRounds} ዙር
              </span>
            </div>
          </div>
          {/* Drawing Word Display - absolutely centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none w-full">
            {isCurrentPlayerDrawing && gameState.currentWord && (
              <p className="text-3xl font-bold text-primary">
                {gameState.currentWord}
              </p>
            )}
            {!isCurrentPlayerDrawing && gameState.currentWord && (
              <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-3xl font-bold text-primary">
                  {Array.from(gameState.currentWord)
                    .map(() => "_")
                    .join(" ")}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Drawing Word Display */}

        {/* Game Layout */}
        <div className="flex">
          {/* Left Sidebar - Players */}
          <div className="">
            <PlayerList
              players={players}
              currentRound={gameState.round}
              totalRounds={gameState.totalRounds}
            />
          </div>

          {/* Main Canvas Area */}
          <div className="">
            <DrawingCanvas isDrawing={isCurrentPlayerDrawing} />
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

      {type == "private" && (
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="game" size="lg" onClick={handleCopyRoomId}>
              ጨዋታውን ይጀምሩ
            </Button>
            <Button variant="outline" size="lg" onClick={handleCopyRoomId}>
              <Copy className="w-4 h-4" />
              ጓደኞችዎን ይጋብዙ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
