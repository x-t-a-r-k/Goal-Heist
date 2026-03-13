
import React, { useState, useEffect } from 'react';
import { ViewState, Game, UserSelection, EventSettings } from './types';
import * as Storage from './services/storageService';
import WelcomePage from './pages/Welcome';
import LoginPage from './pages/Login';
import HeistPage from './pages/Heist';
import AdminPage from './pages/Admin';
import { GameContext } from './contexts/AppContext';
import { DEFAULT_SETTINGS } from './constants';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';

function App() {
  const [view, setView] = useState<ViewState>('WELCOME');
  const [games, setGames] = useState<Game[]>([]);
  const [userSelection, setUserSelection] = useState<UserSelection>({ selectedGameIds: [], sacrificeGameIds: [] });
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const [dbGames, dbSettings] = await Promise.all([
          Storage.fetchGames(),
          Storage.fetchSettings()
        ]);
        setGames(dbGames);
        setSettings(dbSettings);
        setUserSelection(Storage.getUserSelection());

        if (isSupabaseConfigured) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();

    let gamesChannel: any = null;
    let authListener: any = null;

    if (isSupabaseConfigured) {
      gamesChannel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
          Storage.fetchGames().then(setGames);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          Storage.fetchSettings().then(setSettings);
        })
        .subscribe();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (!session && view === 'ADMIN') {
          setView('WELCOME');
        }
      });
      authListener = subscription;
    }

    return () => {
      if (gamesChannel) supabase.removeChannel(gamesChannel);
      if (authListener) authListener.unsubscribe();
    };
  }, [view]);

  const updateSelection = (newSelection: UserSelection) => {
    setUserSelection(newSelection);
    Storage.saveUserSelection(newSelection);
  };

  const updateGames = async (newGames: Game[]) => {
    setGames(newGames);
    try {
      await Storage.saveGamesToDb(newGames);
    } catch (err) {
      console.error("Failed to sync games to storage", err);
      Storage.fetchGames().then(setGames);
    }
  };

  const updateSettings = async (newSettings: EventSettings) => {
    setSettings(newSettings);
    try {
      await Storage.saveSettingsToDb(newSettings);
    } catch (err) {
      console.error("Failed to sync settings to storage", err);
      Storage.fetchSettings().then(setSettings);
    }
  };

  const handleLogout = async () => {
    if (session) {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    }
    setView('WELCOME');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-heist-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-16 h-16 rounded-full border-4 border-heist-green border-t-transparent animate-spin" />
           <p className="font-display font-black text-xl tracking-tighter italic uppercase text-heist-green">
             Calibrating Heist...
           </p>
        </div>
      </div>
    );
  }

  const isWelcome = view === 'WELCOME';

  return (
    <GameContext.Provider value={{ games, updateGames, userSelection, updateSelection, settings, updateSettings }}>
      <div className="min-h-screen bg-heist-dark text-white font-sans flex flex-col">
        {/* Responsive Navigation */}
        {view !== 'ADMIN' && (
          <nav className={`${(isWelcome || view === 'HEIST') ? 'absolute' : 'fixed bg-heist-dark/80 backdrop-blur-md border-b border-white/5'} top-0 w-full z-50 py-3 px-4`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
               <div 
                 className="flex items-center gap-1 cursor-pointer group" 
                 onClick={() => setView('WELCOME')}
               >
                  {isWelcome ? (
                    <img src="https://lh3.googleusercontent.com/d/1ktgP77yAcdentOVT7fi_9jT-ac87RnUE" alt="Goal Heist Logo" className="h-32 sm:h-48 lg:h-64 w-auto max-w-[70vw] sm:max-w-[50vw] object-contain group-hover:scale-105 transition-transform -ml-6 sm:-ml-10 lg:-ml-12 -mt-6 sm:-mt-10 lg:-mt-12" referrerPolicy="no-referrer" />
                  ) : (
                    <img src="https://lh3.googleusercontent.com/d/1ktgP77yAcdentOVT7fi_9jT-ac87RnUE" alt="Goal Heist Logo" className="h-24 sm:h-32 lg:h-40 w-auto max-w-[60vw] sm:max-w-[50vw] object-contain group-hover:scale-105 transition-transform -ml-4 sm:-ml-8 lg:-ml-10 -mt-4 -mb-8 sm:-mt-5 sm:-mb-10 lg:-mt-6 lg:-mb-12" referrerPolicy="no-referrer" />
                  )}
               </div>

               <div className="flex items-center gap-2 sm:gap-4">
                 {session && (
                   <button 
                     onClick={() => setView('ADMIN')}
                     className="flex items-center gap-1.5 px-3 py-1.5 bg-heist-green/10 hover:bg-heist-green/20 border border-heist-green/30 rounded-full text-[10px] font-black uppercase text-heist-green transition-all"
                   >
                     <User size={12} /> <span className="hidden xs:inline">Admin</span>
                   </button>
                 )}
                 {!isWelcome && view !== 'HEIST' && (
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <LogOut size={14} /> <span className="hidden xs:inline">Sign Out</span>
                    </button>
                 )}
                 {view === 'HEIST' && (
                    <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {settings.eventName || 'EVENT #01'}
                    </div>
                 )}
               </div>
            </div>
          </nav>
        )}

        <main className={`flex-1 ${(!isWelcome && view !== 'ADMIN' && view !== 'HEIST') ? 'pt-20' : ''}`}>
          {view === 'WELCOME' && <WelcomePage onStart={() => setView('LOGIN')} />}
          {view === 'LOGIN' && <LoginPage onLoginSuccess={(isAdmin) => setView(isAdmin ? 'ADMIN' : 'HEIST')} />}
          {view === 'HEIST' && <HeistPage />}
          {view === 'ADMIN' && <AdminPage onExit={() => setView('WELCOME')} />}
        </main>
      </div>
    </GameContext.Provider>
  );
}

export default App;
