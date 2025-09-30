import { useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { PlayerList, Player } from "./PlayerList";
import { ChatArea, ChatMessage } from "./ChatArea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Share2, 
  ExternalLink, 
  Clock, 
  Users, 
  Trophy,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const GameRoom = ({ roomId, onLeaveRoom }: GameRoomProps) => {
  const { toast } = useToast();
  
  // Mock game state - in real app this would come from backend
  const [gameState, setGameState] = useState({
    currentPlayer: "player1",
    currentWord: "ዝናብ", // Rain in Amharic
    timeLeft: 75,
    round: 1,
    totalRounds: 3,
    isPlaying: true
  });

  const [players] = useState<Player[]>([
    { id: "player1", name: "አበበ", score: 150, isDrawing: true, isConnected: true },
    { id: "player2", name: "ፍቃዱ", score: 120, isConnected: true },
    { id: "player3", name: "Sarah", score: 90, isConnected: true },
    { id: "player4", name: "መሪያም", score: 60, isConnected: false },
  ]);

  const [messages] = useState<ChatMessage[]>([
    {
      id: "1",
      playerId: "player2",
      playerName: "ፍቃዱ",
      message: "water",
      timestamp: new Date(Date.now() - 60000),
      type: "guess"
    },
    {
      id: "2",
      playerId: "player3",
      playerName: "Sarah",
      message: "ውሃ",
      timestamp: new Date(Date.now() - 30000),
      type: "close"
    },
    {
      id: "3",
      playerId: "system",
      playerName: "System",
      message: "መሪያም guessed it!!",
      timestamp: new Date(Date.now() - 10000),
      type: "correct"
    }
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

  const handleShareRoom = () => {
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    if (navigator.share) {
      navigator.share({
        title: "Join my Amharic Scribble game!",
        text: "Let's play drawing and guessing game in Amharic!",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Room link copied!",
        description: "Share this link with friends to invite them.",
      });
    }
  };

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
    // In real app, this would send to backend
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLeaveRoom}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Leave
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Room: {roomId}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRoomId}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareRoom}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Game Status */}
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 bg-game-surface border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="font-mono text-lg text-accent">
                  {formatTime(gameState.timeLeft)}
                </span>
              </div>
            </Card>
            
            <Card className="px-4 py-2 bg-game-surface border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-ethiopia-yellow" />
                <span>Round {gameState.round}/{gameState.totalRounds}</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Game Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Players */}
          <div className="col-span-12 lg:col-span-3">
            <PlayerList 
              players={players}
              currentRound={gameState.round}
              totalRounds={gameState.totalRounds}
            />
          </div>

          {/* Main Canvas Area */}
          <div className="col-span-12 lg:col-span-6">
            <DrawingCanvas 
              isDrawing={isCurrentPlayerDrawing}
              word={isCurrentPlayerDrawing ? gameState.currentWord : undefined}
            />
          </div>

          {/* Right Sidebar - Chat */}
          <div className="col-span-12 lg:col-span-3">
            <ChatArea
              messages={messages}
              onSendMessage={handleSendMessage}
              isDrawing={isCurrentPlayerDrawing}
              canGuess={canGuess}
            />
          </div>
        </div>

        {/* Game Info Footer */}
        <div className="mt-6 text-center">
          <Card className="p-4 bg-gradient-game border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>{players.filter(p => p.isConnected !== false).length} players online</span>
              </div>
              <div className="text-center">
                {isCurrentPlayerDrawing ? (
                  <span className="text-primary font-medium">🎨 Your turn to draw!</span>
                ) : (
                  <span className="text-accent">💭 Guess the drawing!</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span>Next: {players[(players.findIndex(p => p.isDrawing) + 1) % players.length]?.name}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};