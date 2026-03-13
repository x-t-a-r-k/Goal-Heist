
import React from 'react';
import { Game, GameResult, GameStatus } from '../types';
import { Trophy, XCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface GameCardProps {
  game: Game;
  isSelected: boolean;
  isSacrifice: boolean;
  onSelect: () => void;
  onSacrifice: () => void; 
  viewMode: 'MARKET' | 'MY_HEIST';
  disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  game, 
  isSelected, 
  isSacrifice, 
  onSelect, 
  onSacrifice, 
  viewMode,
  disabled 
}) => {
  
  const getBorderColor = () => {
    if (isSacrifice) return 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]';
    if (isSelected) return 'border-heist-green shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    return 'border-heist-border hover:border-gray-500';
  };

  const getResultBadge = () => {
    if (game.result === GameResult.WIN) return <div className="text-heist-green flex items-center gap-1 text-[10px] font-black uppercase italic tracking-widest"><CheckCircle2 size={12} /> WON</div>;
    if (game.result === GameResult.LOSS) return <div className="text-red-500 flex items-center gap-1 text-[10px] font-black uppercase italic tracking-widest"><XCircle size={12} /> LOSS</div>;
    return <div className="text-gray-600 text-[10px] font-black uppercase tracking-widest">In Vault</div>;
  };

  const formatDisplayDate = (dateStr: string) => {
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
      return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${day}${suffix(day)} ${d.toLocaleDateString('en-GB', { month: 'short' })}`;
    } catch { return dateStr; }
  };

  const formatDisplayTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className={`relative bg-heist-card border rounded-3xl p-6 transition-all duration-500 ${getBorderColor()} ${disabled ? 'opacity-50 grayscale' : ''}`}>
      
      {isSacrifice && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-black font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-2xl z-10 italic">
          <AlertTriangle size={12} /> Sacrifice Pick
        </div>
      )}

      {game.isHot && (
        <div className="absolute -top-3 -left-3 bg-orange-600 text-white font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(234,88,12,0.6)] z-10 italic border border-orange-400">
          HOT 🔥
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
        <span className="truncate max-w-[130px]">{game.league}</span>
        <div className="flex items-center gap-2">
           {game.status === GameStatus.LIVE && (
             <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black animate-pulse">LIVE</span>
           )}
           <span>{formatDisplayDate(game.time)}</span>
        </div>
      </div>

      {/* Teams Section */}
      <div className="text-center mb-6 space-y-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <h4 className="flex-1 text-right text-lg font-black text-white italic tracking-tighter uppercase break-words leading-none">{game.homeTeam}</h4>
          
          {(game.status === GameStatus.LIVE || game.status === GameStatus.FINISHED) ? (
             <div className="bg-black/40 px-3 py-1 rounded-lg border border-white/10 min-w-[60px]">
                <span className="text-xl font-black text-heist-green tracking-widest">{game.score || '0-0'}</span>
             </div>
          ) : (
             <span className="text-[10px] text-heist-green font-black whitespace-nowrap px-2">VS</span>
          )}
          
          <h4 className="flex-1 text-left text-lg font-black text-white italic tracking-tighter uppercase break-words leading-none">{game.awayTeam}</h4>
        </div>
        
        <div className="pt-4 border-t border-white/5 space-y-1">
           <p className="text-[10px] font-black text-gray-400 tracking-[0.3em]">{game.market}</p>
           <div className="flex items-center justify-center gap-1 text-[9px] text-gray-600 font-bold uppercase">
             <Clock size={10} /> Kick-off: {formatDisplayTime(game.time)}
           </div>
           <div className="mt-3">
             {getResultBadge()}
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        {viewMode === 'MARKET' && (
          <button 
            onClick={onSelect}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase italic transition-all tracking-tighter ${isSelected ? 'bg-heist-green text-black shadow-lg shadow-green-900/40' : 'bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700'}`}
          >
            {isSelected ? 'REMOVE' : 'SELECT'}
          </button>
        )}

        {viewMode === 'MY_HEIST' && (
          <>
             <button 
                onClick={onSelect}
                className="flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase italic bg-red-950/10 text-red-500/60 hover:text-red-500 border border-red-900/10 hover:border-red-500/30 transition-all tracking-tighter"
              >
                REMOVE
              </button>
              <button 
                onClick={onSacrifice}
                className={`flex-1 py-3.5 rounded-2xl font-black text-[10px] uppercase italic transition-all flex justify-center items-center gap-1 tracking-tighter ${isSacrifice ? 'bg-yellow-500 text-black shadow-lg' : 'bg-gray-800 text-yellow-500/50 hover:text-yellow-500 border border-gray-700'}`}
              >
                 {isSacrifice ? 'SACRIFICED' : 'SACRIFICE'}
              </button>
          </>
        )}
      </div>

    </div>
  );
};

export default GameCard;
