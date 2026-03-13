
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { GameContext } from '../contexts/AppContext';
import GameCard from '../components/GameCard';
import { GameResult, GameStatus } from '../types';
import { Download, Share, Timer, Loader2, AlertCircle, CheckCircle2, ShieldAlert, ArrowUp, ChevronLeft, ChevronRight, ArrowRight, ArrowUpDown } from 'lucide-react';

const HeistPage: React.FC = () => {
  const { games, userSelection, updateSelection, settings } = useContext(GameContext);
  const [activeTab, setActiveTab] = useState<'MARKET' | 'MY_HEIST'>('MARKET');
  const [hasDownloadedReceipt, setHasDownloadedReceipt] = useState(false);

  const isReady = useMemo(() => userSelection.selectedGameIds.length === settings.requiredPicks && userSelection.sacrificeGameIds.length === settings.sacrificeCount, [userSelection, settings]);

  useEffect(() => {
    if (!isReady) {
        setHasDownloadedReceipt(false);
    }
  }, [isReady]);
  const [filterLeague, setFilterLeague] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [isDownloadingList, setIsDownloadingList] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollLeagues = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 200;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
        const validTimes = games.map(g => new Date(g.time).getTime()).filter(t => !isNaN(t));
        if (validTimes.length === 0) return '';
        const earliestTime = Math.min(...validTimes);
        const difference = earliestTime - new Date().getTime();
        if (difference <= 0) return 'LIVE';
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s`;
    };
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [games]);

  const showPickToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const leagues = useMemo(() => {
    if (games.length === 0) return [];
    return ['ALL', ...Array.from(new Set(games.map(g => g.league)))];
  }, [games]);

  const processedGames = useMemo(() => {
    let result = [...games];
    if (filterLeague !== 'ALL') result = result.filter(g => g.league === filterLeague);
    
    result.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return sortOrder === 'ASC' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [games, filterLeague, sortOrder]);

  const toggleSelection = (gameId: string) => {
    const isSelected = userSelection.selectedGameIds.includes(gameId);
    let newIds = [...userSelection.selectedGameIds];
    let newSacrificeIds = [...userSelection.sacrificeGameIds];
    if (isSelected) {
      newIds = newIds.filter(id => id !== gameId);
      newSacrificeIds = newSacrificeIds.filter(id => id !== gameId);
    } else {
      if (newIds.length >= settings.requiredPicks) {
        showPickToast(`Heist Full! Max ${settings.requiredPicks} picks allowed.`, 'error');
        return;
      }
      newIds.push(gameId);
    }
    updateSelection({ ...userSelection, selectedGameIds: newIds, sacrificeGameIds: newSacrificeIds });
  };

  const toggleSacrifice = (gameId: string) => {
     let newSacrificeIds = [...userSelection.sacrificeGameIds];
     if (newSacrificeIds.includes(gameId)) {
         newSacrificeIds = newSacrificeIds.filter(id => id !== gameId);
     } else {
         if (newSacrificeIds.length >= settings.sacrificeCount) {
             showPickToast(`Maximum ${settings.sacrificeCount} sacrifices allowed.`, 'error');
             return;
         }
         newSacrificeIds.push(gameId);
     }
     updateSelection({ ...userSelection, sacrificeGameIds: newSacrificeIds });
  };

  const handleDownloadSnapshot = async () => {
    if (typeof window !== 'undefined' && window.html2canvas) {
      setIsGenerating(true);
      const element = document.getElementById('snapshot-container');
      if (element) {
        element.style.display = 'block';
        await new Promise(r => setTimeout(r, 400));
        try {
          const canvas = await window.html2canvas(element, { backgroundColor: '#0f0f0f', scale: 2 });
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `Goal_Heist_Slip.png`;
          link.click();
          setHasDownloadedReceipt(true);
          showPickToast("Slip Downloaded Successfully!");
        } finally {
          element.style.display = 'none';
          setIsGenerating(false);
        }
      }
    }
  };

  const handleDownloadMarketList = async () => {
    if (typeof window !== 'undefined' && window.html2canvas) {
      setIsDownloadingList(true);
      const element = document.getElementById('market-list-container');
      if (element) {
        element.style.display = 'block';
        await new Promise(r => setTimeout(r, 500));
        try {
          const canvas = await window.html2canvas(element, { backgroundColor: '#0a0a0a', scale: 2 });
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `Goal_Heist_Market_List.png`;
          link.click();
          showPickToast("Market List Downloaded!");
        } catch (e) {
            console.error(e);
            showPickToast("Download failed", "error");
        } finally {
          element.style.display = 'none';
          setIsDownloadingList(false);
        }
      }
    }
  };

  const formatDateWithDay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const selectedGames = useMemo(() => {
    const gameMap = new Map(games.map(g => [g.id, g]));
    return [...userSelection.selectedGameIds]
      .reverse()
      .map(id => gameMap.get(id))
      .filter((g): g is typeof games[0] => !!g);
  }, [games, userSelection.selectedGameIds]);

  return (
    <div className="pt-16 pb-40 min-h-screen bg-heist-dark">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-heist-green/5 via-transparent to-transparent opacity-40"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
      </div>

      {/* CENTERED NOTIFICATION POPUP */}
      {toast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-in fade-in zoom-in duration-300">
          <div className={`px-8 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border-l-4 bg-heist-card text-white min-w-[280px] text-center ${toast.type === 'success' ? 'border-heist-green' : 'border-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="text-heist-green" size={28} /> : <ShieldAlert className="text-red-500" size={28} />}
            <span className="font-black text-sm tracking-widest uppercase italic">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-heist-dark/95 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
           <div className="flex flex-col gap-1.5 flex-1">
                {timeLeft && (
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-black uppercase tracking-widest">
                      <Timer size={12} /> {timeLeft}
                    </div>
                )}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${activeTab === 'MARKET' ? 'bg-heist-green' : 'bg-yellow-500'}`} style={{ width: `${activeTab === 'MARKET' ? (userSelection.selectedGameIds.length / settings.requiredPicks) * 100 : (userSelection.sacrificeGameIds.length / settings.sacrificeCount) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-black whitespace-nowrap ${activeTab === 'MARKET' ? 'text-heist-green' : 'text-yellow-500'}`}>
                    {activeTab === 'MARKET' ? `${userSelection.selectedGameIds.length} / ${settings.requiredPicks}` : `${userSelection.sacrificeGameIds.length} / ${settings.sacrificeCount}`}
                  </span>
                </div>
           </div>
           
           <div className="flex bg-gray-900 rounded-lg p-1 border border-white/5">
                <button onClick={() => setActiveTab('MARKET')} className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${activeTab === 'MARKET' ? 'bg-heist-green text-black' : 'text-gray-500 hover:text-gray-300'}`}>MARKET</button>
                <button onClick={() => setActiveTab('MY_HEIST')} className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${activeTab === 'MY_HEIST' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-gray-300'}`}>PICKS</button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* OBJECTIVE BANNER */}
        <div className="mb-8 bg-heist-card border border-heist-green/20 rounded-xl p-4 flex items-center gap-4 shadow-lg shadow-heist-green/5">
            <div className="w-10 h-10 rounded-full bg-heist-green/10 flex items-center justify-center text-heist-green font-black border border-heist-green/20 flex-shrink-0">
                {activeTab === 'MARKET' ? '1' : '2'}
            </div>
            <div>
                <h3 className="text-xs font-black text-heist-green uppercase tracking-widest mb-1">
                    {activeTab === 'MARKET' ? 'PHASE 1: HEIST' : 'PHASE 2: SACRIFICE'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                    {activeTab === 'MARKET' 
                        ? `Select exactly ${settings.requiredPicks} matches to add to your Picks Tab.` 
                        : `Sacrifice ${settings.sacrificeCount} matches you’re most unsure about to secure your final slip.`}
                </p>
            </div>
        </div>

        {activeTab === 'MARKET' && (
          <div className="flex items-center gap-2 mb-8">
            <div className="relative flex-1 group min-w-0">
              <button 
                onClick={() => scrollLeagues('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-heist-dark/80 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div 
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto pb-2 w-full touch-pan-x scrollbar-hide scroll-smooth"
              >
                  {leagues.map(league => (
                    <button
                      key={league}
                      onClick={() => setFilterLeague(league)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${filterLeague === league ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                    >
                      {league}
                    </button>
                  ))}
              </div>

              <button 
                onClick={() => scrollLeagues('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-heist-dark/80 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-heist-green hover:bg-gray-700 transition-all"
              title={sortOrder === 'ASC' ? "Earliest First" : "Latest First"}
            >
              <ArrowUpDown size={16} />
            </button>

            <button
              onClick={handleDownloadMarketList}
              disabled={isDownloadingList}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-all"
              title="Download Market List"
            >
              {isDownloadingList ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(activeTab === 'MARKET' ? processedGames : selectedGames).map(game => (
            <GameCard 
              key={game.id}
              game={game}
              isSelected={userSelection.selectedGameIds.includes(game.id)}
              isSacrifice={userSelection.sacrificeGameIds.includes(game.id)}
              onSelect={() => toggleSelection(game.id)}
              onSacrifice={() => toggleSacrifice(game.id)}
              viewMode={activeTab}
            />
          ))}
        </div>

        {activeTab === 'MARKET' && userSelection.selectedGameIds.length === settings.requiredPicks && (
           <div className="fixed bottom-8 left-0 w-full z-[50] pointer-events-none animate-in slide-in-from-bottom duration-300" style={{ WebkitTransform: 'translateZ(0)' }}>
             <div className="max-w-7xl mx-auto flex justify-center">
                <button 
                  onClick={() => setActiveTab('MY_HEIST')}
                  className="pointer-events-auto w-full sm:w-auto px-12 py-4 bg-heist-green text-black font-black rounded-xl text-sm flex items-center justify-center gap-2 uppercase italic hover:scale-105 transition-transform shadow-xl shadow-green-900/20"
                >
                  PROCEED TO PHASE 2 <ArrowRight size={20} />
                </button>
             </div>
           </div>
        )}

        {activeTab === 'MY_HEIST' && (
           <div className="fixed bottom-4 sm:bottom-8 left-0 w-full px-4 z-[50] pointer-events-none animate-in slide-in-from-bottom duration-300" style={{ WebkitTransform: 'translateZ(0)' }}>
             <div className="max-w-7xl mx-auto flex flex-row items-center justify-center gap-3 pointer-events-auto">
                {!hasDownloadedReceipt ? (
                    <button 
                      disabled={!isReady || isGenerating}
                      onClick={handleDownloadSnapshot}
                      className={`w-full sm:w-auto px-12 py-4 font-black rounded-xl text-sm flex items-center justify-center gap-2 uppercase italic transition-all ${!isReady ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-heist-green text-black hover:scale-105 shadow-xl shadow-green-900/20'}`}
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                      Get Official Heist Slip
                    </button>
                ) : (
                    <>
                        <button 
                          disabled={isGenerating}
                          onClick={handleDownloadSnapshot}
                          className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-12 py-4 font-black rounded-xl text-[10px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 uppercase italic transition-all bg-gray-800 text-white hover:bg-gray-700 border border-white/10"
                        >
                          {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                          Redownload Slip
                        </button>
                        <button onClick={() => window.open(`https://wa.me/2349133635465?text=${encodeURIComponent(`🔒 HEIST READY\n\nI have my slip ready for Goal Heist. Please confirm my entry.`)}`, '_blank')} className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-12 py-4 bg-green-600 text-white font-black rounded-xl text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 uppercase italic shadow-xl hover:scale-105 transition-transform">
                          <Share size={24} /> Submit
                        </button>
                    </>
                )}
             </div>
           </div>
        )}

        <footer className="mt-20 py-12 border-t border-white/5 text-center space-y-4">
           <div className="flex items-center justify-center gap-2 text-red-500/50">
              <AlertCircle size={14} />
              <span className="text-[10px] font-black tracking-widest uppercase italic">Legal Disclaimer</span>
           </div>
           <p className="text-[10px] text-gray-600 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
             Goal Heist is an independent sports prediction and entertainment platform. We are not a licensed gambling provider. 
             All participation is subject to localized laws. We are not responsible for financial losses or unexpected event outcomes. 
             By accessing this vault, you acknowledge that predictions are inherently speculative. 
             Report any fraudulent behavior to the official admin channels immediately.
           </p>
        </footer>

        {showScrollTop && (
            <button 
            onClick={scrollToTop}
            className="fixed bottom-24 right-4 z-50 bg-heist-green text-black p-3 rounded-full shadow-lg hover:scale-110 transition-all"
            style={{ WebkitTransform: 'translateZ(0)' }}
            >
            <ArrowUp size={24} />
            </button>
        )}
      </div>

      {/* Market List Template */}
      <div className="fixed top-0 left-[-9999px] pointer-events-none select-none">
        <div id="market-list-container" style={{ width: '800px', backgroundColor: '#050505', color: 'white', minHeight: '1000px', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div className="p-10 bg-[#111]">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-black italic tracking-tighter text-heist-green mb-2">GOAL HEIST</h2>
                        <h1 className="text-6xl font-bold italic tracking-tighter text-white mb-2">EVENT LIST</h1>
                        <div className="flex items-center gap-3 text-heist-green font-mono text-lg font-bold tracking-widest uppercase">
                            <span>FULL MARKET ROSTER</span>
                            <span className="text-slate-600">•</span>
                            <span>{processedGames.length} GAMES</span>
                        </div>
                    </div>
                    <div className="text-right text-slate-400 font-mono text-sm font-bold uppercase tracking-wider">
                        <p>{settings.eventName || 'EVENT #01'}</p>
                        <p>{(() => {
                            const d = new Date();
                            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                        })()}</p>
                    </div>
                </div>
            </div>

            {/* Dashed Divider */}
            <div className="w-full border-b-4 border-dashed border-slate-800/50"></div>

            {/* List */}
            <div className="p-10 space-y-4 bg-[#050505]">
                {processedGames.map((g, i) => {
                    let statusColor = '';
                    let statusText = '';
                    let barColor = 'border-slate-800';
                    let textColor = '';
                    let cardBg = 'bg-white/5';

                    if (g.result === GameResult.WIN) {
                        statusColor = 'bg-green-500';
                        statusText = 'WON';
                        barColor = 'border-green-500';
                        textColor = 'text-black';
                        cardBg = 'bg-green-500/10';
                    } else if (g.result === GameResult.LOSS) {
                        statusColor = 'bg-red-500';
                        statusText = 'LOST';
                        barColor = 'border-red-500';
                        textColor = 'text-white';
                        cardBg = 'bg-red-500/10';
                    }

                    return (
                        <div key={g.id} className={`${cardBg} p-5 flex items-center gap-6 border-l-[6px] ${barColor}`}>
                            <div className="text-3xl font-mono font-bold text-slate-500 w-16 text-center opacity-50">
                                {(i + 1).toString().padStart(2, '0')}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-3 mb-1">
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                                        {g.homeTeam} <span className="text-slate-600 text-lg mx-1">VS</span> {g.awayTeam}
                                    </h3>
                                </div>
                                <div className="text-sm font-mono text-slate-500 flex items-center gap-2 uppercase tracking-wide">
                                    <span>{(() => {
                                        const d = new Date(g.time);
                                        return `${d.toLocaleDateString('en-US', { weekday: 'short' })}, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                                    })()}</span>
                                    <span className="text-slate-700">•</span>
                                    <span>Market: {g.market}</span>
                                </div>
                            </div>
                            <div>
                                {statusText && (
                                    <span className={`px-4 py-1.5 rounded text-sm font-bold uppercase tracking-wider ${statusColor} ${textColor}`}>
                                        {statusText}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <div className="w-full border-t-2 border-dashed border-[#333]"></div>
                <div className="px-10 py-8 bg-[#050505] flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-1">GOAL HEIST</p>
                        <h2 className="text-xl font-bold text-white uppercase tracking-wide">OFFICIAL RESULT SLIP</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-[#555] mb-1">Generated by</p>
                        <h2 className="text-xl font-bold text-[#999]">BetBuddy System</h2>
                    </div>
                </div>
                {/* Barcode Strip Effect */}
                <div className="h-16 w-full bg-[repeating-linear-gradient(90deg,#888,#888_1px,transparent_1px,transparent_3px,#888_3px,#888_5px,transparent_5px,transparent_6px,#888_6px,#888_9px,transparent_9px,transparent_11px)] opacity-50"></div>
            </div>
        </div>
      </div>

      {/* Snapshot Template */}
      <div className="fixed top-0 left-[-9999px] pointer-events-none select-none">
        <div id="snapshot-container" className="relative" style={{ width: '600px', backgroundColor: '#0a0a0a', color: 'white' }}>
            {/* Watermark Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='rgba(255,255,255,0.025)' stroke-width='0.75' fill='none' stroke-linecap='round' stroke-linejoin='round' transform='scale(2)'%3E%3Cg transform='translate(2, 2) scale(0.6)'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 8l3 3l-1 4h-4l-1-4z'/%3E%3Cpath d='M12 8V2M15 11l5-3M14 15l4 5M10 15l-4 5M9 11L4 8'/%3E%3C/g%3E%3Cg transform='translate(35, 5) rotate(15) scale(0.6)'%3E%3Cpath d='M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z'/%3E%3C/g%3E%3Cg transform='translate(5, 35) rotate(-15) scale(0.6)'%3E%3Cpath d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6'/%3E%3Cpath d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18'/%3E%3Cpath d='M4 22h16'/%3E%3Cpath d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'/%3E%3Cpath d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'/%3E%3Cpath d='M18 2H6v7a6 6 0 0 0 12 0V2Z'/%3E%3C/g%3E%3Cg transform='translate(35, 35) rotate(10) scale(0.6)'%3E%3Cpath d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z'/%3E%3Cline x1='4' x2='4' y1='22' y2='15'/%3E%3C/g%3E%3Cg transform='translate(20, 20) rotate(-5) scale(0.6)'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Cpath d='M3 9h18M3 15h18M9 3v18M15 3v18'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
            }}></div>
            <div className="bg-heist-green text-black p-8 relative">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter mb-2">GOAL HEIST</h1>
                        <p className="mt-2 text-sm font-bold uppercase tracking-widest font-mono opacity-90">
                            OFFICIAL SELECTION • {selectedGames.length} PICKS
                        </p>
                    </div>
                    <div className="text-right font-mono font-bold text-sm leading-snug opacity-90">
                        <p className="uppercase">{settings.eventName || 'WEEKEND EVENT #12'}</p>
                        <p>{(() => {
                            const d = new Date();
                            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                        })()}</p>
                    </div>
                </div>
                {/* Dashed Divider */}
                <div className="absolute bottom-0 left-0 w-full border-b-4 border-dashed border-black/30"></div>
            </div>
            <div className="p-10 space-y-3 bg-[#0a0a0a]">
                {[...selectedGames]
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map((g, i) => {
                        let statusText = 'PENDING';
                        let statusColor = 'text-gray-500';
                        
                        if (g.result === GameResult.WIN) {
                            statusText = 'WON';
                            statusColor = 'text-heist-green';
                        } else if (g.result === GameResult.LOSS) {
                            statusText = 'LOST';
                            statusColor = 'text-red-500';
                        }

                        return (
                            <div key={g.id} className={`p-4 border-l-4 flex justify-between items-center ${userSelection.sacrificeGameIds.includes(g.id) ? 'bg-yellow-900/10 border-yellow-500' : 'bg-gray-900/40 border-gray-700'}`}>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600 font-mono font-bold text-lg opacity-50">{(i + 1).toString().padStart(2, '0')}</span>
                                        <p className="font-black text-lg uppercase italic text-white">{g.homeTeam} <span className="text-gray-600 text-sm mx-1">VS</span> {g.awayTeam}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase pl-9">{formatDateWithDay(g.time)} • Market: {g.market}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {userSelection.sacrificeGameIds.includes(g.id) && <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">SACRIFICE</span>}
                                    <span className={`text-sm font-black uppercase ${statusColor}`}>{statusText}</span>
                                </div>
                            </div>
                        );
                })}
                <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Official Goal Heist Entry Sheet</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HeistPage;
