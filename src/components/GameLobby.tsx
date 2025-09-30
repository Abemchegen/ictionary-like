import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Users,
  Plus,
  ArrowRight,
  Gamepad2,
  Paintbrush,
  PaintRoller,
} from "lucide-react";

interface GameLobbyProps {
  onCreateRoom: (roomId: string, type: string) => void;
  onJoinRoom: (roomId: string, type: string) => void;
}

export const GameLobby = ({ onCreateRoom, onJoinRoom }: GameLobbyProps) => {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState<string>("");

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError("እባክዎ ስምዎን ያስገቡ");
      return;
    }
    setError("");
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onCreateRoom(newRoomId, "private");
  };

  const handleJoinCommonRoom = () => {
    if (!playerName.trim()) {
      setError("እባክዎ ስምዎን ያስገቡ ");
      return;
    }
    setError("");
    onJoinRoom("COMMON", "Common");
  };

  const handleJoinPrivateRoom = () => {
    if (!playerName.trim()) {
      setError("እባክዎ ስምዎን ያስገቡ");
      return;
    }
    if (!roomId.trim()) {
      setError("እባክዎ የክፍል ቁጥሩን ያስገቡ");
      return;
    }
    setError("");
    onJoinRoom(roomId.toUpperCase(), "private");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ይሳሉ ይገምቱ ያሸንፉ!
            </h1>
          </div>
        </div>

        {/* Player Name Input */}
        <Card className="p-6 mb-8 bg-gradient-game border-primary/20">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium mb-2">የእርስዎ ስም</label>
            <Input
              placeholder="እዚህ ስምዎን ያስገቡ..."
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                if (error) setError("");
              }}
              className="text-center text-lg bg-game-surface border-primary/30"
            />
            {error && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {error}
              </div>
            )}
          </div>
        </Card>

        {/* Game Options */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room */}
          <Card className="p-8 bg-gradient-game border-primary/20 hover:border-primary/50 transition-game">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  የግል ክፍል ፈጥረው ጓደኞችዎን ይጋብዙ{" "}
                </h3>
                <p className="text-muted-foreground">
                  Create a private room and invite friends
                </p>
              </div>
              <Button
                onClick={handleCreateRoom}
                variant="game"
                size="lg"
                className="w-full"
              >
                <Plus className="w-5 h-5" />
                ክፍል ፍጠር
              </Button>
            </div>
          </Card>

          {/* Join Common Room */}
          <Card className="p-8 bg-gradient-game border-accent/20 hover:border-accent/50 transition-game">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">የጋራ ክፍል ገብተው ይጫወቱ</h3>
                <p className="text-muted-foreground">
                  Join the public room and play with everyone
                </p>
              </div>
              <Button
                onClick={handleJoinCommonRoom}
                variant="accent"
                size="lg"
                className="w-full"
              >
                <Users className="w-5 h-5" />
                የጋራ ክፍል ግባ
              </Button>
            </div>
          </Card>
        </div>

        {/* Join Private Room */}
        <Card className="mt-8 p-6 bg-game-surface border-border">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h4 className="font-semibold text-lg">የግል ክፍል ይቀላቀሉ</h4>
            <div className="flex gap-2">
              <Input
                placeholder="የክፍል ሚስጥር ቁጥር"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="bg-background border-primary/30"
                maxLength={6}
              />
              <Button
                onClick={handleJoinPrivateRoom}
                disabled={!playerName.trim() || !roomId.trim()}
                variant="outline"
                size="icon"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
