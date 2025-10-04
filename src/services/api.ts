const BASE_URL = 'http://localhost:3000/api'; // TODO: Update with your backend URL

export interface Player {
  id: string;
  name: string;
  score: number;
  isDrawing?: boolean;
  isConnected?: boolean;
  hasDrawn?: boolean;
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

/**
 * Generic response handler:
 * - parses JSON when possible
 * - for non-ok responses, tries to extract server message (error or message) and throws Error(msg)
 * - returns typed data for ok responses
 */
async function handleResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text().catch(() => '');
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    // Prefer server-provided fields
    const msg = (data && (data.error || data.message)) || (typeof data === 'string' && data) || response.statusText || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data as T;
}

// Helper to do POST with JSON body
async function postJson<T = any>(url: string, body?: any, opts: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: opts.credentials || 'same-origin', // change to 'include' if you use cookies
    ...opts,
  });
  return handleResponse<T>(response);
}

// Helper to do GET
async function getJson<T = any>(url: string, opts: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { method: 'GET', credentials: opts.credentials || 'same-origin', ...opts });
  return handleResponse<T>(response);
}

// Player APIs
export const playerAPI = {
  joinRoom: async (roomId: string, playerName: string): Promise<{ player: Player; room: Room }> => {
    return postJson(`${BASE_URL}/rooms/${roomId}/join`, { playerName });
  },

  leaveRoom: async (roomId: string, playerId: string): Promise<void> => {
    await postJson(`${BASE_URL}/rooms/${roomId}/leave`, { playerId });
  },

  getPlayers: async (roomId: string): Promise<Player[]> => {
    return getJson<Player[]>(`${BASE_URL}/rooms/${roomId}/players`);
  },

  thumbsUpPlayer: async (roomId: string, playerId: string, targetPlayerId: string): Promise<void> => {
    await postJson(`${BASE_URL}/rooms/${roomId}/thumbsup`, { playerId, targetPlayerId });
  },
};

// Room APIs
export const roomAPI = {
  createRoom: async (playerName: string, type: 'private' | 'public' = 'private'): Promise<Room> => {
    return postJson<Room>(`${BASE_URL}/rooms`, { playerName, type });
  },

  getRoom: async (roomId: string): Promise<Room> => {
    return getJson<Room>(`${BASE_URL}/rooms/${roomId}`);
  },

  joinPublicRoom: async (playerName: string): Promise<Room> => {
    return postJson<Room>(`${BASE_URL}/rooms/public/join`, { playerName });
  },
};

// Game APIs
export const gameAPI = {
  startGame: async (roomId: string, playerId: string): Promise<GameState> => {
    return postJson<GameState>(`${BASE_URL}/rooms/${roomId}/start`, { playerId });
  },

  startPrivateGame: async (roomId: string, playerId: string): Promise<GameState> => {
    return postJson<GameState>(`${BASE_URL}/rooms/${roomId}/start-private`, { playerId });
  },

  getGameState: async (roomId: string): Promise<GameState> => {
    return getJson<GameState>(`${BASE_URL}/rooms/${roomId}/game-state`);
  },

  getWordChoices: async (roomId: string): Promise<WordChoice> => {
    return getJson<WordChoice>(`${BASE_URL}/rooms/${roomId}/word-choices`);
  },

  selectWordAndStartGame: async (roomId: string, playerId: string, word: string): Promise<GameState> => {
    return postJson<GameState>(`${BASE_URL}/rooms/${roomId}/select-word`, { playerId, word });
  },

  submitGuess: async (roomId: string, playerId: string, guess: string): Promise<{ correct: boolean; close: boolean }> => {
    return postJson<{ correct: boolean; close: boolean }>(`${BASE_URL}/rooms/${roomId}/guess`, { playerId, guess });
  },

  correctGuess: async (roomId: string, playerId: string): Promise<void> => {
    await postJson(`${BASE_URL}/rooms/${roomId}/correct-guess`, { playerId });
  },

  likeDrawing: async (roomId: string, playerId: string): Promise<void> => {
    await postJson(`${BASE_URL}/rooms/${roomId}/like`, { playerId });
  },

  dislikeDrawing: async (roomId: string, playerId: string): Promise<void> => {
    await postJson(`${BASE_URL}/rooms/${roomId}/dislike`, { playerId });
  },

  endRound: async (roomId: string): Promise<GameState> => {
    return postJson<GameState>(`${BASE_URL}/rooms/${roomId}/end-round`);
  },

  nextDrawer: async (roomId: string): Promise<{ playerId: string }> => {
    return postJson<{ playerId: string }>(`${BASE_URL}/rooms/${roomId}/next-drawer`);
  },

  endGame: async (roomId: string): Promise<{ rankings: RankingPlayer[] }> => {
    return postJson<{ rankings: RankingPlayer[] }>(`${BASE_URL}/rooms/${roomId}/end-game`);
  },

  restartGame: async (roomId: string): Promise<GameState> => {
    return postJson<GameState>(`${BASE_URL}/rooms/${roomId}/restart`);
  },
};

// Chat APIs
export const chatAPI = {
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const data = await getJson<any>(`${BASE_URL}/rooms/${roomId}/messages`);
    const messages = Array.isArray(data) ? data : [];
    return messages.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
  },

  sendMessage: async (roomId: string, playerId: string, message: string): Promise<ChatMessage> => {
    const data = await postJson<any>(`${BASE_URL}/rooms/${roomId}/messages`, { playerId, message });
    return { ...data, timestamp: new Date(data.timestamp) };
  },
};

// Drawing APIs
export const drawingAPI = {
  sendDrawing: async (roomId: string, playerId: string, drawingData: string): Promise<void> => {
    await postJson(`${BASE_URL}/rooms/${roomId}/drawing`, { playerId, drawingData });
  },

  getDrawing: async (roomId: string): Promise<string> => {
    const data = await getJson<any>(`${BASE_URL}/rooms/${roomId}/drawing`);
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