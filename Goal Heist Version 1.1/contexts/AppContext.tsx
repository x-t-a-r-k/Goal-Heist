import React from 'react';
import { Game, UserSelection, EventSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface GameContextType {
  games: Game[];
  updateGames: (games: Game[]) => void;
  userSelection: UserSelection;
  updateSelection: (s: UserSelection) => void;
  settings: EventSettings;
  updateSettings: (s: EventSettings) => void;
}

export const GameContext = React.createContext<GameContextType>({
  games: [],
  updateGames: () => {},
  userSelection: { selectedGameIds: [], sacrificeGameIds: [] },
  updateSelection: () => {},
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {}
});