import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: "guess" | "correct" | "close" | "system";
  isCorrect?: boolean;
}

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isDrawing: boolean;
  canGuess: boolean;
}

export const ChatArea = ({
  messages,
  onSendMessage,
  isDrawing,
  canGuess,
}: ChatAreaProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isDrawing || !canGuess) return;

    onSendMessage(currentMessage.trim());
    setCurrentMessage("");
  };

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case "correct":
        return "bg-success/10 border-success/30 text-success-foreground";
      case "close":
        return "bg-warning/10 border-warning/30 text-warning-foreground";
      case "system":
        return "bg-primary/10 border-primary/30 text-primary-foreground";
      default:
        return "bg-background/10 border-border";
    }
  };

  return (
    <Card className="p-1 bg-game-surface border-primary/20 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-scroll custom-scrollbar space-y-2 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border  transition-all ${getMessageStyle(
              message
            )}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {message.type === "correct" ? (
                  <div className="text-sm font-medium text-success">
                    <span className="text-primary">
                      {message.playerName} :{" "}
                    </span>{" "}
                    መልሰዋል
                  </div>
                ) : message.type === "close" ? (
                  <div className="text-sm">
                    <span className="text-primary">
                      {message.playerName} :{" "}
                    </span>
                    <span className="text-warning font-medium">
                      {message.message}
                    </span>
                    <span className="text-warning"> ቀርበዋል!</span>
                  </div>
                ) : (
                  <div className="text-sm">
                    <span className="text-primary">
                      {message.playerName} :{" "}
                    </span>
                    <span> {message.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No guesses yet...</p>
            <p className="text-sm">Start guessing to earn points!</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder={
            isDrawing
              ? "You can't guess while drawing..."
              : canGuess
              ? "Type your guess in Amharic or English..."
              : "Game not started yet"
          }
          disabled={isDrawing || !canGuess}
          className="bg-background/20 border-primary/30 focus:border-primary"
          maxLength={100}
        />
        <Button
          type="submit"
          disabled={!currentMessage.trim() || isDrawing || !canGuess}
          variant="game"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};
