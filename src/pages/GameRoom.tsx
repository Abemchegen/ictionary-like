import { useState, useEffect, useRef } from "react";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { PlayerList, Player } from "../components/PlayerList";
import { ChatArea, ChatMessage } from "../components/ChatArea";

import { useToast } from "@/hooks/use-toast";
import { Button } from "../components/ui/button";
import { Copy } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  roomAPI, 
  gameAPI, 
  chatAPI, 
  playerAPI, 
  createWebSocketConnection,
  GameState 
} from "@/services/api";

export const GameRoom = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const roomid = searchParams.get("id");

  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: "",
    currentWord: "",
    timeLeft: 0,
    round: 1,
    totalRounds: 3,
    isPlaying: false,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch initial room data
  useEffect(() => {
    if (!roomid) {
      navigate("/");
      return;
    }

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const [room, roomPlayers, roomMessages, roomGameState] = await Promise.all([
          roomAPI.getRoom(roomid),
          playerAPI.getPlayers(roomid),
          chatAPI.getMessages(roomid),
          gameAPI.getGameState(roomid),
        ]);

        setPlayers(roomPlayers);
        setMessages(roomMessages);
        setGameState(roomGameState);
        
        // Get current player ID from localStorage or room data
        const storedPlayerId = localStorage.getItem(`player_${roomid}`);
        if (storedPlayerId) {
          setCurrentPlayerId(storedPlayerId);
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
        toast({
          title: "Error",
          description: "Failed to load room. Please try again.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomid, navigate, toast]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!roomid) return;

    const ws = createWebSocketConnection(roomid, (data) => {
      switch (data.type) {
        case "player_joined":
        case "player_left":
          setPlayers(data.players);
          break;
        case "game_started":
          setGameState(data.gameState);
          break;
        case "game_state_updated":
          setGameState(data.gameState);
          break;
        case "new_message":
          setMessages((prev) => [...prev, {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          }]);
          break;
        case "drawing_updated":
          // Handle drawing update if needed
          break;
        default:
          break;
      }
    });

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [roomid]);

  const isCurrentPlayerDrawing = gameState.currentPlayer === currentPlayerId;
  const handleLeaveRoom = async () => {
    if (!roomid || !currentPlayerId) return;
    
    try {
      await playerAPI.leaveRoom(roomid, currentPlayerId);
      localStorage.removeItem(`player_${roomid}`);
      navigate("/");
    } catch (error) {
      console.error("Failed to leave room:", error);
      navigate("/");
    }
  };

  const handleCopyRoomId = () => {
    if (!roomid) return;
    navigator.clipboard.writeText(roomid);
    toast({
      title: "Room code copied!",
      description: "Share this code with friends to invite them.",
    });
  };

  const handleStartGame = async () => {
    if (!roomid || !currentPlayerId) return;

    try {
      const newGameState = await gameAPI.startGame(roomid, currentPlayerId);
      setGameState(newGameState);
      toast({
        title: "Game started!",
        description: "Let the drawing begin!",
      });
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!roomid || !currentPlayerId) return;

    try {
      await chatAPI.sendMessage(roomid, currentPlayerId, message);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLikeDrawing = async () => {
    if (!roomid || !currentPlayerId) return;

    try {
      await gameAPI.likeDrawing(roomid, currentPlayerId);
      toast({
        title: "Drawing liked! 👍",
        description: "You liked this drawing",
      });
    } catch (error) {
      console.error("Failed to like drawing:", error);
    }
  };

  const handleDislikeDrawing = async () => {
    if (!roomid || !currentPlayerId) return;

    try {
      await gameAPI.dislikeDrawing(roomid, currentPlayerId);
      toast({
        title: "Feedback sent",
        description: "You disliked this drawing",
      });
    } catch (error) {
      console.error("Failed to dislike drawing:", error);
    }
  };

  const handlePlayerThumbsUp = async (playerId: string, playerName: string) => {
    if (!roomid || !currentPlayerId) return;

    try {
      await playerAPI.thumbsUpPlayer(roomid, currentPlayerId, playerId);
      toast({
        title: `Thumbs up! 👍`,
        description: `You gave ${playerName} a thumbs up!`,
      });
    } catch (error) {
      console.error("Failed to thumbs up player:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Loading room...</div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

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
              onPlayerThumbsUp={handlePlayerThumbsUp}
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
