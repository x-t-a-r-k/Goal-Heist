
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Game, UserSelection, EventSettings, GameStatus, GameResult } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const SELECTION_KEY = 'gh_selection_v2';
const GAMES_LOCAL_KEY = 'gh_mock_games_v1';
const SETTINGS_LOCAL_KEY = 'gh_mock_settings_v1';

export const getUserSelection = (): UserSelection => {
  const stored = localStorage.getItem(SELECTION_KEY);
  if (!stored) return { selectedGameIds: [], sacrificeGameIds: [] };
  try {
    return JSON.parse(stored);
  } catch (e) {
    return { selectedGameIds: [], sacrificeGameIds: [] };
  }
};

export const saveUserSelection = (selection: UserSelection) => {
  localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
};

export const fetchGames = async (): Promise<Game[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id.toString(),
        homeTeam: item.home_team,
        awayTeam: item.away_team,
        league: item.league,
        time: item.kickoff_time || 'TBD',
        market: item.market,
        status: (item.status || GameStatus.SCHEDULED) as GameStatus,
        result: (item.result || GameResult.PENDING) as GameResult,
        score: item.score || '0-0',
        isHot: !!item.is_hot
      }));
    } catch (error) {
      console.error('Fetch games failed:', error);
      return getLocalGamesFallback();
    }
  } else {
    return getLocalGamesFallback();
  }
};

const getLocalGamesFallback = (): Game[] => {
  const stored = localStorage.getItem(GAMES_LOCAL_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveGamesToDb = async (games: Game[]) => {
  if (!isSupabaseConfigured) {
    localStorage.setItem(GAMES_LOCAL_KEY, JSON.stringify(games));
    return;
  }

  const payload = games.map(g => {
    let validDate = null;
    if (g.time && g.time !== 'TBD') {
        const d = new Date(g.time);
        validDate = isNaN(d.getTime()) ? null : d.toISOString();
    }

    return {
      id: parseInt(g.id),
      home_team: g.homeTeam,
      away_team: g.awayTeam,
      league: g.league,
      kickoff_time: validDate,
      market: g.market,
      status: g.status,
      result: g.result,
      score: g.score,
      is_hot: !!g.isHot
    };
  });

  const { error } = await supabase.from('games').upsert(payload, { onConflict: 'id' });
  if (error) throw new Error(error.message);
};

export const deleteGameFromDb = async (id: string) => {
  if (isSupabaseConfigured) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) return;
    const { error } = await supabase.from('games').delete().eq('id', numericId);
    if (error) throw error;
  } else {
    const games = getLocalGamesFallback();
    const updated = games.filter(g => g.id !== id);
    localStorage.setItem(GAMES_LOCAL_KEY, JSON.stringify(updated));
  }
};

export const fetchSettings = async (): Promise<EventSettings> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return getLocalSettingsFallback();

      return {
        eventName: data.event_name,
        requiredPicks: data.required_picks,
        sacrificeCount: data.sacrifice_count,
        accessCode: data.access_code,
        adminCode: data.admin_code
      };
    } catch (err) {
      return getLocalSettingsFallback();
    }
  } else {
    return getLocalSettingsFallback();
  }
};

const getLocalSettingsFallback = (): EventSettings => {
  const stored = localStorage.getItem(SETTINGS_LOCAL_KEY);
  return stored ? DEFAULT_SETTINGS : DEFAULT_SETTINGS;
};

export const saveSettingsToDb = async (settings: EventSettings) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 1, 
        event_name: settings.eventName,
        required_picks: settings.requiredPicks,
        sacrifice_count: settings.sacrificeCount,
        access_code: settings.accessCode,
        admin_code: settings.adminCode
      }, { onConflict: 'id' });
    if (error) throw error;
  } else {
    localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(settings));
  }
};
