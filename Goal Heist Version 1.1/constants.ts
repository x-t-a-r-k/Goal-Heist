import { Game, EventSettings } from './types';

export const INITIAL_GAMES: Game[] = []; // Starts empty, Admin must populate

export const DEFAULT_SETTINGS: EventSettings = {
  eventName: 'Weekend Event #1',
  requiredPicks: 16,
  sacrificeCount: 1,
  accessCode: 'GOAL',
  adminCode: 'ADMIN1'
};