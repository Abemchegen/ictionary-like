import { useState, useEffect, useRef } from "react";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { PlayerList, Player } from "../components/PlayerList";
import { ChatArea, ChatMessage } from "../components/ChatArea";

import { useToast } from "@/hooks/use-toast";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Copy, Trophy } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  roomAPI,
  gameAPI,
  chatAPI,
  playerAPI,
  createWebSocketConnection,
  GameState,
  TopPlayer,
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
    phase: "waiting",
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [rankings, setRankings] = useState<TopPlayer[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial room data
  useEffect(() => {
    if (!roomid) {
      navigate("/");
      return;
    }

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const [room, roomPlayers, roomMessages, roomGameState] =
          await Promise.all([
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
          setMessages((prev) => [
            ...prev,
            {
              ...data.message,
              timestamp: new Date(data.message.timestamp),
            },
          ]);
          break;
        case "drawing_updated":
          // Handle drawing update if needed
          break;
        case "game_ended":
          setRankings(data.rankings);
          setGameState(data.gameState);
          break;
        case "round_ended":
          setGameState(data.gameState);
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

  // Game flow management
  useEffect(() => {
    if (!roomid || !gameState.isPlaying) return;

    const phase = gameState.phase;

    if (phase === "word_selection" && isCurrentPlayerDrawing) {
      // Fetch word choices for the current drawer
      fetchWordChoices();

      // Auto-select after 10 seconds if no selection
      gameTimerRef.current = setTimeout(() => {
        if (wordChoices.length > 0) {
          handleSelectWord(wordChoices[0]);
        }
      }, 10000);
    } else if (phase === "drawing") {
      // Drawing phase - 60 seconds
      gameTimerRef.current = setTimeout(async () => {
        await handleEndRound();
      }, 60000);
    } else if (phase === "round_end") {
      // Show round results for a few seconds then move to next round
      gameTimerRef.current = setTimeout(async () => {
        await handleNextRound();
      }, 5000);
    } else if (phase === "game_end") {
      // Show final rankings for 30 seconds then restart
      setShowRankings(true);
      gameTimerRef.current = setTimeout(async () => {
        await handleRestartGame();
      }, 30000);
    }

    return () => {
      if (gameTimerRef.current) {
        clearTimeout(gameTimerRef.current);
      }
    };
  }, [gameState.phase, gameState.isPlaying, roomid, isCurrentPlayerDrawing]);

  const fetchWordChoices = async () => {
    // need both roomid and currentPlayerId to fetch word choices
    if (!roomid || !currentPlayerId) return;
    try {
      const choices = await gameAPI.getWordChoices(roomid);
      setWordChoices(choices.choices);
    } catch (error) {
      console.error("Failed to fetch word choices:", error);
    }
  };

  const handleStartGame = async () => {
    if (!roomid) return;

    try {
      const endpoint =
        type === "private" ? gameAPI.startPrivateGame : gameAPI.startGame;
      const newGameState = await endpoint(roomid, currentPlayerId);
      setGameState(newGameState);
      setCurrentPlayerId(newGameState.currentPlayer);
      toast({
        title: "Game started!",
        description: "Get ready to draw!",
      });
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        title: "Error",
        description:
          (error instanceof Error ? error.message : String(error)) +
          ". Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectWord = async (word: string) => {
    if (!roomid || !currentPlayerId) return;

    try {
      const newGameState = await gameAPI.selectWordAndStartGame(
        roomid,
        currentPlayerId,
        word
      );
      setGameState(newGameState);
      setWordChoices([]);
      toast({
        title: "Word selected!",
        description: "Start drawing!",
      });
    } catch (error) {
      console.error("Failed to select word:", error);
    }
  };

  const handleEndRound = async () => {
    if (!roomid) return;

    try {
      const newGameState = await gameAPI.endRound(
        roomid,
        gameState.currentWord
      );
      setGameState(newGameState);
    } catch (error) {
      console.error("Failed to end round:", error);
    }
  };

  const handleNextRound = async () => {
    if (!roomid) return;

    try {
      // Get next drawer
      const { nextDrawer } = await gameAPI.nextDrawer(roomid);

      // Fetch updated game state
      const newGameState = await gameAPI.getGameState(roomid);
      setGameState(newGameState);
      setCurrentPlayerId(nextDrawer.id);
    } catch (error) {
      console.error("Failed to move to next round:", error);
    }
  };

  const handleRestartGame = async () => {
    if (!roomid) return;

    try {
      setShowRankings(false);
      const newGameState = await gameAPI.restartGame(roomid);
      setGameState(newGameState);
      setCurrentPlayerId(newGameState.currentPlayer);
      toast({
        title: "New game started!",
        description: "Let's play again!",
      });
    } catch (error) {
      console.error("Failed to restart game:", error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!roomid || !currentPlayerId || isCurrentPlayerDrawing) return;

    try {
      // Submit as guess during game
      if (gameState.isPlaying && gameState.phase === "drawing") {
        const result = await gameAPI.submitGuess(
          roomid,
          currentPlayerId,
          message
        );
        // Check if the result indicates correct guess
        const isCorrect = Object.values(result).some((val) => val === true);
        if (isCorrect) {
          // Award points based on time remaining (example: 10 points base)
          await gameAPI.correctGuess(roomid, currentPlayerId, 10);
          toast({
            title: "Correct! 🎉",
            description: "You guessed the word!",
          });
        }
      } else {
        await chatAPI.sendMessage(roomid, currentPlayerId, message);
      }
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
      await playerAPI.thumbsPlayer(roomid, currentPlayerId, playerId, true);
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
          <div className="text-2xl font-bold text-primary mb-2">
            Loading room...
          </div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full h-full bg-background py-3 px-1">
      <div className="w-full mx-auto">
        {/* Rankings Modal */}
        {showRankings && rankings.length > 0 && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h2 className="text-3xl font-bold text-primary">Game Over!</h2>
                <p className="text-muted-foreground mt-2">Final Rankings</p>
              </div>
              <div className="space-y-3">
                {rankings.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0
                        ? "bg-accent/20 border-2 border-accent"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-primary">
                        #{player.rank}
                      </div>
                      <div className="font-medium">{player.name}</div>
                    </div>
                    <div className="text-xl font-bold text-accent">
                      {player.score}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Starting new game in a moment...
              </p>
            </Card>
          </div>
        )}

        {/* Word Selection Modal */}
        {gameState.phase === "word_selection" && isCurrentPlayerDrawing && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-primary text-center mb-6">
                Choose a word to draw
              </h2>
              <div className="space-y-3">
                {Array.isArray(wordChoices) && wordChoices.length > 0 ? (
                  wordChoices.map((word, index) => (
                    <div>
                      {" "}
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full text-lg py-6 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleSelectWord(word)}
                      >
                        {word}
                      </Button>
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        10 seconds to choose...
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-6">
                    Loading words...
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

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
              canGuess={gameState.isPlaying && gameState.phase === "drawing"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
