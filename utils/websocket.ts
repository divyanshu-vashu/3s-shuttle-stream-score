import { createContext } from 'react';
import { getSocketURL } from '../config';

export interface GameState {
  roomId: string;
  player1: string;
  player2: string;
  score1: number;
  score2: number;
  isAdmin: boolean;
}

export const WebSocketContext = createContext<WebSocket | null>(null);

export const connectWebSocket = () => {
  return new WebSocket(getSocketURL());
};