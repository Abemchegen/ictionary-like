const BASE_URL = 'http://localhost:3000/api'; // TODO: Update with your backend URL

export interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing?: boolean;
  isConnected?: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: "guess" | "correct" | "close" | "system";
  isCorrect?: boolean;
}

export interface GameState {
  currentPlayer: string;
  currentWord: string;
  timeLeft: number;
  round: number;
  totalRounds: number;
  isPlaying: boolean;
  phase?: 'waiting' | 'word_selection' | 'drawing' | 'round_end' | 'game_end';
}

export interface WordChoice {
  words: string[];
}

export interface RankingPlayer extends Player {
  rank: number;
}

export interface Room {
  id: string;
  type: 'private' | 'public';
  players: Player[];
  gameState: GameState;
}

// Player APIs
export const playerAPI = {
  // Join a room with player name
  joinRoom: async (roomId: string, playerName: string): Promise<{ player: Player; room: Room }> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });
    if (!response.ok) throw new Error('Failed to join room');
    return response.json();
  },

  // Leave a room
  leaveRoom: async (roomId: string, playerId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!response.ok) throw new Error('Failed to leave room');
  },

  // Get players in a room
  getPlayers: async (roomId: string): Promise<Player[]> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/players`);
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
  },

  // Give thumbs up to a player
  thumbsUpPlayer: async (roomId: string, playerId: string, targetPlayerId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/thumbsup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, targetPlayerId }),
    });
    if (!response.ok) throw new Error('Failed to thumbs up player');
  },
};

// Room APIs
export const roomAPI = {
  // Create a new room
  createRoom: async (playerName: string, type: 'private' | 'public' = 'private'): Promise<Room> => {
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, type }),
    });
    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  // Get room details
  getRoom: async (roomId: string): Promise<Room> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  },

  // Join common/public room
  joinPublicRoom: async (playerName: string): Promise<Room> => {
    const response = await fetch(`${BASE_URL}/rooms/public/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });
    if (!response.ok) throw new Error('Failed to join public room');
    return response.json();
  },
};

// Game APIs
export const gameAPI = {
  // Start the game (public room)
  startGame: async (roomId: string, playerId: string): Promise<GameState> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!response.ok) throw new Error('Failed to start game');
    return response.json();
  },

  // Start private game
  startPrivateGame: async (roomId: string, playerId: string): Promise<GameState> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/start-private`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!response.ok) throw new Error('Failed to start private game');
    return response.json();
  },

  // Get current game state
  getGameState: async (roomId: string): Promise<GameState> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/game-state`);
    if (!response.ok) throw new Error('Failed to fetch game state');
    return response.json();
  },

  // Get word choices
  getWordChoices: async (roomId: string): Promise<WordChoice> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/word-choices`);
    if (!response.ok) throw new Error('Failed to fetch word choices');
    return response.json();
  },

  // Select word and start drawing phase
  selectWordAndStartGame: async (roomId: string, playerId: string, word: string): Promise<GameState> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/select-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, word }),
    });
    if (!response.ok) throw new Error('Failed to select word');
    return response.json();
  },

  // Submit a guess
  submitGuess: async (roomId: string, playerId: string, guess: string): Promise<{ correct: boolean; close: boolean }> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, guess }),
    });
    if (!response.ok) throw new Error('Failed to submit guess');
    return response.json();
  },

  // Notify correct guess
  correctGuess: async (roomId: string, playerId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/correct-guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!response.ok) throw new Error('Failed to notify correct guess');
  },

  // Like a drawing
  likeDrawing: async (roomId: string, playerId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!response.ok) throw new Error('Failed to like drawing');
  },

  // Dislike a drawing
  dislikeDrawing: async (roomId: string, playerId: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/dislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!response.ok) throw new Error('Failed to dislike drawing');
  },

  // End current round
  endRound: async (roomId: string): Promise<GameState> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/end-round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to end round');
    return response.json();
  },

  // Get next drawer
  nextDrawer: async (roomId: string): Promise<{ playerId: string }> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/next-drawer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to get next drawer');
    return response.json();
  },

  // End game
  endGame: async (roomId: string): Promise<{ rankings: RankingPlayer[] }> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/end-game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to end game');
    return response.json();
  },

  // Restart game
  restartGame: async (roomId: string): Promise<GameState> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/restart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to restart game');
    return response.json();
  },
};

// Chat APIs
export const chatAPI = {
  // Get chat messages
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    const messages = Array.isArray(data) ? data : [];
    return messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  },

  // Send a message (guess)
  sendMessage: async (roomId: string, playerId: string, message: string): Promise<ChatMessage> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, message }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return {
      ...data,
      timestamp: new Date(data.timestamp),
    };
  },
};

// Drawing APIs
export const drawingAPI = {
  // Send drawing data (could be base64 or canvas data)
  sendDrawing: async (roomId: string, playerId: string, drawingData: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/drawing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, drawingData }),
    });
    if (!response.ok) throw new Error('Failed to send drawing data');
  },

  // Get current drawing data
  getDrawing: async (roomId: string): Promise<string> => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/drawing`);
    if (!response.ok) throw new Error('Failed to fetch drawing');
    const data = await response.json();
    return data.drawingData;
  },
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (roomId: string, onMessage: (data: any) => void) => {
  const ws = new WebSocket(`ws://localhost:3000/ws/rooms/${roomId}`); // TODO: Update with your WebSocket URL

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return ws;
};
