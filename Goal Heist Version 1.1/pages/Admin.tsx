
import React, { useContext, useState, useEffect, useRef } from 'react';
import { GameContext } from '../contexts/AppContext';
import { Game, GameResult, GameStatus } from '../types';
import * as Storage from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { 
  Shield, 
  Save, 
  Loader2, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2,
  Trash2,
  PlusCircle,
  User,
  Edit2,
  Calendar,
  X,
  AlertCircle,
  RotateCcw,
  Clock,
  Target,
  Flame
} from 'lucide-react';

interface AdminPageProps {
  onExit: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onExit }) => {
  const { games, updateGames, settings, updateSettings } = useContext(GameContext);
  const [localGames, setLocalGames] = useState<Game[]>(games);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    id: '',
    league: 'PREMIER LEAGUE',
    home: '',
    away: '',
    time: '',
    market: 'OVER 1.5 GOALS'
  });

  useEffect(() => {
    setLocalGames(games);
    setLocalSettings(settings);
  }, [games, settings]);

  useEffect(() => {
    const getEmail = async () => {
      const { data } = await supabase.auth.getUser();
      setAdminEmail(data.user?.email || 'Admin User');
    };
    getEmail();
    
    if (!editingGameId) {
      const nextId = getNextId(games);
      setFormData(prev => ({ ...prev, id: nextId.toString() }));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [games]);

  const getNextId = (currentGames: Game[]) => {
    const ids = currentGames.map(g => parseInt(g.id)).filter(id => !isNaN(id));
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Storage.saveGamesToDb(localGames);
      await Storage.saveSettingsToDb(localSettings);
      updateGames(localGames);
      updateSettings(localSettings);
      showToast('Vault Synchronized! Matches are locked in.');
    } catch (err: any) {
      showToast(`Sync Failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGameUpdate = (id: string, updates: Partial<Game>) => {
    setLocalGames(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const handleDeleteGame = async (id: string) => {
    if (confirm('Permanently delete this fixture from the heist?')) {
      try {
        await Storage.deleteGameFromDb(id);
        const updated = localGames.filter(g => g.id !== id);
        setLocalGames(updated);
        updateGames(updated);
        showToast('Fixture Removed');
      } catch (err) {
        showToast('Operation Failed', 'error');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('WARNING: This will delete ALL fixtures. Every single game will be wiped for the new week. Proceed?')) {
      try {
        setIsSaving(true);
        for (const game of localGames) {
          await Storage.deleteGameFromDb(game.id);
        }
        setLocalGames([]);
        updateGames([]);
        showToast('Vault Cleared. Post new games.');
      } catch (err) {
        showToast('Clear failed', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const startEdit = (game: Game) => {
    setEditingGameId(game.id);
    let timeFormatted = '';
    if (game.time && game.time.includes('T')) {
      timeFormatted = game.time.slice(0, 16);
    }
    setFormData({
      id: game.id,
      league: game.league,
      home: game.homeTeam,
      away: game.awayTeam,
      time: timeFormatted,
      market: game.market
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelEdit = () => {
    setEditingGameId(null);
    setFormData(prev => ({
      ...prev,
      id: getNextId(localGames).toString(),
      home: '',
      away: '',
      time: '',
      market: 'OVER 1.5 GOALS'
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.home || !formData.away || !formData.time) {
      showToast("Match details incomplete.", 'error');
      return;
    }

    const isoDate = new Date(formData.time).toISOString();
    const gameData: Game = {
      id: formData.id,
      homeTeam: formData.home.toUpperCase(),
      awayTeam: formData.away.toUpperCase(),
      league: formData.league.toUpperCase(),
      time: isoDate,
      market: formData.market.toUpperCase(),
      status: GameStatus.SCHEDULED,
      result: GameResult.PENDING,
      score: '0-0'
    };

    if (editingGameId) {
      setLocalGames(prev => prev.map(g => g.id === editingGameId ? gameData : g));
      setEditingGameId(null);
      showToast('Fixture Updated');
    } else {
      if (localGames.some(g => g.id === formData.id)) {
        showToast(`ID ${formData.id} already exists`, 'error');
        return;
      }
      setLocalGames(prev => [gameData, ...prev]);
      showToast('Match Added to Heist');
    }

    const nextId = getNextId(editingGameId ? localGames : [gameData, ...localGames]);
    setFormData(prev => ({
      ...prev, // KEEP LEAGUE
      id: nextId.toString(),
      home: '',
      away: '',
      time: '',
      market: 'OVER 1.5 GOALS'
    }));
  };

  const formatCardDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const suffix = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
        }
      };
      const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const month = d.toLocaleDateString('en-GB', { month: 'short' });
      return `${weekday} ${day}${suffix(day)} ${month}`;
    } catch { return dateStr; }
  };

  const formatCardTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-heist-dark text-gray-100 flex flex-col font-sans uppercase">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-heist-card/95 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="flex flex-col justify-center">
            <img src="https://lh3.googleusercontent.com/d/1ktgP77yAcdentOVT7fi_9jT-ac87RnUE" alt="Goal Heist Logo" className="h-16 sm:h-20 w-auto object-contain -ml-3 sm:-ml-4 -mt-3 -mb-4 sm:-mt-4 sm:-mb-5" referrerPolicy="no-referrer" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">
              {localSettings.eventName || 'ADMIN CONTROL'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
           <button 
             disabled={isSaving} 
             onClick={handleSave} 
             className="bg-heist-green text-black px-5 py-2 rounded-lg text-[10px] font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"
           >
             {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
             <span className="hidden xs:inline">LOCK IN SYNC</span>
           </button>

           <div className="relative" ref={profileRef}>
             <button 
               onClick={() => setIsProfileOpen(!isProfileOpen)}
               className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center hover:border-heist-green transition-colors"
             >
               <User size={18} />
             </button>

             {isProfileOpen && (
               <div className="absolute right-0 mt-3 w-56 bg-heist-card border border-gray-800 rounded-xl shadow-2xl p-2 animate-slide-down">
                 <div className="px-3 py-2 border-b border-gray-800 mb-2 text-center">
                    <p className="text-[10px] text-gray-500 font-black">ADMINISTRATOR</p>
                    <p className="text-xs text-white font-bold lowercase truncate">{adminEmail}</p>
                 </div>
                 <button 
                    onClick={() => { onExit(); supabase.auth.signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-black transition-colors"
                 >
                   <LogOut size={14} /> LEAVE VAULT
                 </button>
               </div>
             )}
           </div>
        </div>
      </header>

      <main className="flex-1 mt-24 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8 pb-40">
        
        {/* EVENT CONFIG */}
        <section className="bg-heist-card border border-gray-800 rounded-2xl p-6 shadow-xl relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-heist-green"></div>
          <h3 className="text-[10px] font-black text-gray-500 mb-6 tracking-[0.2em]">EVENT PARAMETERS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold">EVENT NAME</label>
              <input 
                type="text" 
                value={localSettings.eventName} 
                onChange={(e) => setLocalSettings({...localSettings, eventName: e.target.value.toUpperCase()})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-black focus:border-heist-green transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold">REQUIRED PICKS</label>
              <input 
                type="number" 
                value={localSettings.requiredPicks} 
                onChange={(e) => setLocalSettings({...localSettings, requiredPicks: parseInt(e.target.value)})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-black focus:border-heist-green transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold">SACRIFICE LIMIT</label>
              <input 
                type="number" 
                value={localSettings.sacrificeCount} 
                onChange={(e) => setLocalSettings({...localSettings, sacrificeCount: parseInt(e.target.value)})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-black focus:border-heist-green transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold">ACCESS CODE</label>
              <input 
                type="text" 
                value={localSettings.accessCode} 
                onChange={(e) => setLocalSettings({...localSettings, accessCode: e.target.value.toUpperCase()})}
                className="w-full bg-black/50 border border-heist-green/20 rounded-xl px-4 py-3 text-heist-green text-xs font-mono font-black focus:border-heist-green transition-all"
              />
            </div>
          </div>
        </section>

        {/* ADD / EDIT FIXTURE FORM */}
        <section ref={formRef} className="bg-heist-card border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-gray-500 tracking-[0.2em]">
              {editingGameId ? 'EDITING FIXTURE' : 'POST NEW FIXTURE'}
            </h3>
            {editingGameId && (
              <button onClick={cancelEdit} className="text-[10px] font-black text-red-500 flex items-center gap-1 hover:underline">
                <X size={12} /> ABORT EDIT
              </button>
            )}
          </div>
          
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500">FIXTURE ID</label>
              <input 
                type="number" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black focus:border-heist-green transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500">LEAGUE / COMPETITION</label>
              <div className="relative">
                <input 
                  placeholder="E.G. PREMIER LEAGUE" 
                  value={formData.league} 
                  onChange={e => setFormData({...formData, league: e.target.value.toUpperCase()})}
                  className="w-full bg-black/50 border border-gray-800 rounded-xl pl-4 pr-10 py-3 text-xs font-black focus:border-heist-green transition-all" 
                />
                {formData.league && (
                  <button type="button" onClick={() => setFormData({...formData, league: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500">KICK-OFF TIME</label>
              <input 
                type="datetime-local" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black focus:border-heist-green transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500">HOME TEAM</label>
              <input 
                placeholder="HOME TEAM" 
                value={formData.home} 
                onChange={e => setFormData({...formData, home: e.target.value.toUpperCase()})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black focus:border-heist-green transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500">AWAY TEAM</label>
              <input 
                placeholder="AWAY TEAM" 
                value={formData.away} 
                onChange={e => setFormData({...formData, away: e.target.value.toUpperCase()})}
                className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black focus:border-heist-green transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500">GOAL MARKET</label>
              <div className="flex gap-2">
                <input 
                  placeholder="E.G. OVER 1.5 GOALS" 
                  value={formData.market} 
                  onChange={e => setFormData({...formData, market: e.target.value.toUpperCase()})}
                  className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-xs font-black focus:border-heist-green transition-all flex-1" 
                />
                <button type="submit" className={`px-6 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${editingGameId ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-heist-green text-black hover:bg-green-500'}`}>
                  {editingGameId ? <Save size={14} /> : <PlusCircle size={14} />}
                  {editingGameId ? 'UPDATE' : 'ADD'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* VAULT FIXTURES LIST */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
             <h3 className="text-[10px] font-black text-gray-500 tracking-[0.2em]">ACTIVE FIXTURES ({localGames.length})</h3>
             {localGames.length > 0 && (
               <button 
                 onClick={handleClearAll}
                 className="text-[10px] font-black text-red-500 flex items-center gap-1 hover:text-red-400 transition-colors uppercase italic"
               >
                 <RotateCcw size={12} /> CLEAR ALL FOR NEW WEEK
               </button>
             )}
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {localGames.length === 0 ? (
              <div className="bg-heist-card border border-dashed border-gray-800 rounded-2xl p-20 text-center opacity-20 italic font-black text-xs">VAULT EMPTY. ADD FIXTURES.</div>
            ) : (
              localGames.map((game) => (
                <div key={game.id} className="bg-heist-card border border-gray-800 rounded-xl p-3 flex flex-col gap-3 hover:border-heist-green/50 transition-all duration-300 shadow-lg relative overflow-hidden">
                  
                  {/* HEADER ROW */}
                  <div className="flex items-center justify-between text-[9px] font-black text-gray-500 tracking-widest uppercase border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-heist-green">#{game.id}</span>
                        <span className="text-gray-400 truncate max-w-[100px]">{game.league}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} /> {formatCardDate(game.time)}
                      </div>
                  </div>

                  {/* TEAMS ROW - Full Width, Grid for centering VS */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full">
                      <h2 className="text-right text-sm sm:text-base font-black italic tracking-tighter text-white uppercase truncate leading-none pr-2">{game.homeTeam}</h2>
                      <span className="text-heist-green text-[9px] font-black bg-heist-green/5 px-1.5 py-0.5 rounded border border-heist-green/20">VS</span>
                      <h2 className="text-left text-sm sm:text-base font-black italic tracking-tighter text-white uppercase truncate leading-none pl-2">{game.awayTeam}</h2>
                  </div>

                  {/* FOOTER ROW - Controls */}
                  <div className="flex items-end justify-between gap-2 mt-1">
                      <div className="flex gap-2">
                        {/* EDIT */}
                        <button 
                          onClick={() => startEdit(game)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                          title="Edit Game"
                        >
                          <Edit2 size={14} />
                        </button>
                        {/* HOT TOGGLE */}
                        <button 
                          onClick={() => handleGameUpdate(game.id, { isHot: !game.isHot })}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${game.isHot ? 'bg-orange-500/20 text-orange-500 border border-orange-500/50' : 'bg-gray-800/50 text-gray-600 hover:text-orange-400 hover:bg-gray-800'}`}
                          title={game.isHot ? "Remove HOT tag" : "Mark as HOT"}
                        >
                          <Flame size={14} />
                        </button>
                      </div>

                      {/* CENTER INFO & STATUS */}
                      <div className="flex-1 flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                            <span>{game.market}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                            <span className="flex items-center gap-0.5"><Clock size={10} /> {formatCardTime(game.time)}</span>
                          </div>
                          
                          <div className="flex bg-black p-0.5 rounded-lg border border-gray-800">
                              {[GameResult.WIN, GameResult.PENDING, GameResult.LOSS].map(res => (
                                <button 
                                  key={res} 
                                  onClick={() => handleGameUpdate(game.id, { result: res })}
                                  className={`px-3 py-1 text-[8px] font-black rounded-md transition-all ${game.result === res ? (res === GameResult.WIN ? 'bg-heist-green text-black' : res === GameResult.LOSS ? 'bg-red-600 text-white' : 'bg-gray-700 text-white') : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                  {res}
                                </button>
                              ))}
                          </div>
                      </div>

                      {/* DELETE */}
                      <button 
                        onClick={() => handleDeleteGame(game.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-900/10 text-red-500/50 hover:text-red-500 hover:bg-red-900/20 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </section>

        {/* LEGAL DISCLAIMER */}
        <footer className="mt-12 p-10 border-t border-gray-800 text-center space-y-4 bg-black/20 rounded-3xl">
           <div className="flex items-center justify-center gap-2 text-red-500/50">
              <AlertCircle size={14} />
              <span className="text-[10px] font-black tracking-widest uppercase italic">LEGAL DISCLAIMER</span>
           </div>
           <p className="text-[10px] text-gray-600 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
             Goal Heist is an independent sports prediction and entertainment platform. We are not a licensed gambling provider. 
             All participation is subject to localized laws. We are not responsible for financial losses or unexpected match outcomes. 
             By accessing this vault, you acknowledge that predictions are inherently speculative. 
             Report any fraudulent behavior to the official admin channels immediately.
           </p>
        </footer>

      </main>

      {/* CENTERED NOTIFICATION POPUP */}
      {toast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`px-10 py-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 border-l-8 bg-heist-card text-white min-w-[320px] text-center transform animate-in zoom-in duration-300 ${toast.type === 'success' ? 'border-heist-green' : 'border-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="text-heist-green" size={56} /> : <ShieldAlert className="text-red-500" size={56} />}
            <span className="font-black text-lg tracking-widest uppercase italic leading-tight">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="px-8 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
