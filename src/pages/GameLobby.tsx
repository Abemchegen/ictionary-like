import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Users, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { roomAPI, playerAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const GameLobby = () => {
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [joinRoomId, setJoinRoomId] = useState<string>("");
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const room = await roomAPI.createRoom(playerName.trim(), 'private');
      navigate(`/gameroom?type=private&id=${room.id}`);
    } catch (err) {
      setError("Failed to create room. Please try again.");
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommonRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const room = await roomAPI.joinPublicRoom(playerName.trim());
      navigate(`/gameroom?type=public&id=${room.id}`);
    } catch (err) {
      setError("Failed to join public room. Please try again.");
      toast({
        title: "Error",
        description: "Failed to join public room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPrivateRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!joinRoomId.trim()) {
      setError("Please enter room code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await playerAPI.joinRoom(joinRoomId.trim(), playerName.trim());
      navigate(`/gameroom?type=private&id=${joinRoomId.trim()}`);
    } catch (err) {
      setError("Failed to join room. Invalid room code.");
      toast({
        title: "Error",
        description: "Failed to join room. Invalid room code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Player Name Input */}
        <Card className="p-8 mb-8 bg-gradient-game border-primary/20">
          {" "}
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Draw, Guess, Win!
            </h1>
          </div>
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <Input
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                if (error) setError("");
              }}
              className="text-center text-lg bg-game-surface  border-primary/30"
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
                <h3 className="text-2xl font-bold mb-2">Create Private Room</h3>
                <p className="text-muted-foreground">
                  Create a private room and invite friends
                </p>
              </div>
              <Button
                onClick={handleCreateRoom}
                variant="game"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                <Plus className="w-5 h-5" />
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </Card>

          {/* Join Common Room */}
          <Card className="p-8 bg-gradient-game border-primary/20 hover:border-primary/50 transition-game">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/20  rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Join Public Room</h3>
                <p className="text-muted-foreground">
                  Join the public room and play with everyone
                </p>
              </div>
              <Button
                onClick={handleJoinCommonRoom}
                variant="accent"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                <Users className="w-5 h-5" />
                {loading ? "Joining..." : "Join Public"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Join Private Room */}
        <Card className="mt-8 p-6 bg-game-surface border-border">
          <div className="max-w-md mx-auto text-center space-y-4">
            <h4 className="font-semibold text-lg">Join Private Room</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter room code"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                className="text-center bg-background border-primary/30"
                maxLength={6}
              />
              <Button
                onClick={handleJoinPrivateRoom}
                disabled={!joinRoomId.trim() || loading}
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
