
export enum GameStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED'
}

export enum GameResult {
  PENDING = 'PENDING',
  WIN = 'WIN', // Market Hit
  LOSS = 'LOSS' // Market Miss
}

export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  time: string; // ISO string or display string
  market: string; // e.g., "Over 1.5", "Home Win"
  status: GameStatus;
  result: GameResult;
  score?: string; // e.g. "2-1"
  isHot?: boolean;
}

export interface UserSelection {
  selectedGameIds: string[];
  sacrificeGameIds: string[]; 
}

export interface EventSettings {
  eventName: string;
  requiredPicks: number;
  sacrificeCount: number;
  accessCode: string;
  adminCode: string;
}

export type ViewState = 'WELCOME' | 'LOGIN' | 'HEIST' | 'ADMIN';

declare global {
  interface Window {
    html2canvas: any;
  }
}
