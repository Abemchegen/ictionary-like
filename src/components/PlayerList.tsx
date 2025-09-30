import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, User, Palette } from "lucide-react";

export interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing?: boolean;
  isConnected?: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentRound: number;
  totalRounds: number;
}

export const PlayerList = ({
  players,
  currentRound,
  totalRounds,
}: PlayerListProps) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const leader = sortedPlayers[0];

  return (
    <Card className="p-4 bg-game-surface border-primary/20">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-primary mb-2">ተጫዋቾች</h3>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`p-3 rounded-lg border transition-all ${
              player.isDrawing
                ? "bg-primary/20 border-primary shadow-glow"
                : "bg-background/10 border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mr-6">
                {/* Player Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    player.isConnected !== false
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/20 text-muted-foreground"
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>

                {/* Player Name */}
                <span
                  className={`font-medium truncate ${
                    player.isDrawing ? "text-primary" : "text-foreground"
                  }`}
                >
                  {player.name}
                </span>

                {/* Status Badges */}
                {player.isDrawing && <p>🎨</p>}
              </div>

              {/* Score */}
              <div
                className={`font-bold text-lg ${
                  index === 0 && player.score > 0
                    ? "text-ethiopia-yellow"
                    : "text-primary"
                }`}
              >
                {player.score}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {players.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Waiting for players...</p>
          </div>
        )}
      </div>
    </Card>
  );
};
