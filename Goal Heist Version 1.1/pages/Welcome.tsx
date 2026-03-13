
import React from 'react';
import { 
  Trophy, 
  Users, 
  Flame,
  Send,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface WelcomePageProps {
  onStart: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col w-full bg-[#0f0f0f] uppercase">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Cinematic Tactical Background */}
        <div className="absolute inset-0 z-0">
            {/* Rich Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent z-10"></div>
            <img 
                src="https://lh3.googleusercontent.com/d/1Hdy5ERNin6ybqYUPUO0aOuJsZhJGKpa8" 
                alt="Penalty Action Scene" 
                className="w-full h-full object-cover opacity-80 scale-100 animate-[pulse_10s_infinite_alternate]"
            />
            {/* Tactical Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent z-10"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center mt-16">
             {/* Tactical Badge - Sponsored by BetBuddy */}
             <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-heist-green/10 border border-heist-green/40 backdrop-blur-xl mb-12 animate-fade-in-up">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-heist-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-heist-green"></span>
                </span>
                <span className="text-[12px] font-black tracking-[0.4em] text-heist-green uppercase italic">SPONSORED BY BETBUDDY SYSTEM</span>
             </div>

             {/* Mission Title */}
             <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-white uppercase tracking-tighter leading-[0.85] mb-8 drop-shadow-[0_0_80px_rgba(34,197,94,0.3)]">
                PULL THE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-heist-green via-green-400 to-green-900 italic">PERFECT HEIST</span>
             </h1>

             {/* Intelligence Subtitle - Simplified & Straightforward */}
             <p className="mt-4 max-w-5xl text-xl text-gray-400 md:text-4xl font-black leading-[1.1] tracking-tighter px-4 uppercase italic">
                THE ANALYSIS IS DONE. <br className="hidden md:block"/>
                NOW MAKE YOUR BEST SELECTION. <br className="hidden md:block"/>
                <span className="text-heist-green">NO GUESSWORK.</span> JUST EXECUTE AND WIN.
             </p>

             {/* Tactical CTA */}
             <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <button 
                  onClick={onStart}
                  className="bg-heist-green hover:bg-green-600 text-black text-2xl font-black py-6 px-20 rounded-3xl shadow-[0_15px_50px_-15px_rgba(34,197,94,0.7)] transform hover:-translate-y-3 transition-all duration-300 flex items-center justify-center gap-4 group italic tracking-tighter"
                >
                    JOIN THE HEIST
                </button>
             </div>

             {/* Stats Intelligence */}
             <div className="mt-24 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-20 w-full max-w-5xl opacity-90">
                <div className="flex flex-col items-center group cursor-default">
                    <span className="text-2xl font-display font-black text-white group-hover:text-heist-green transition-colors">3X</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mt-2 font-black">EVENT PAYOUT</span>
                </div>
                <div className="flex flex-col items-center group cursor-default">
                    <span className="text-2xl font-display font-black text-white group-hover:text-heist-green transition-colors">88%</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mt-2 font-black">ACCURACY</span>
                </div>
                <div className="flex flex-col items-center group cursor-default">
                    <span className="text-2xl font-display font-black text-white group-hover:text-heist-green transition-colors">450+</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mt-2 font-black">USERS</span>
                </div>
                <div className="flex flex-col items-center group cursor-default">
                    <span className="text-2xl font-display font-black text-white group-hover:text-heist-green transition-colors">WEEKENDS</span>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-gray-500 mt-2 font-black">EVENT DURATION</span>
                </div>
             </div>
        </div>
      </section>

      {/* MISSION BRIEFING */}
      <section className="relative py-32 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-6">HEIST BRIEFING</h2>
                <p className="text-gray-500 text-sm font-bold tracking-[0.4em]">WE ANALYZE THE MARKET. YOU EXTRACT THE PROFIT.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Step 1 */}
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-[40px] p-12 transition-all duration-500 hover:border-heist-green/40">
                    <div className="absolute -top-5 -left-5 w-12 h-12 bg-[#0a0a0a] border border-white/20 rounded-2xl flex items-center justify-center text-sm font-black text-gray-500">01</div>
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform">
                        <ShieldCheck className="text-blue-500 w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 italic">GAIN ACCESS</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-bold tracking-wider">
                        Enter your weekend access code to view the well curated fixtures.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-[40px] p-12 transition-all duration-500 hover:border-heist-green/40">
                    <div className="absolute -top-5 -left-5 w-12 h-12 bg-[#0a0a0a] border border-white/20 rounded-2xl flex items-center justify-center text-sm font-black text-gray-500">02</div>
                    <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform">
                        <Zap className="text-purple-500 w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 italic">BUILD YOUR HEIST</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-bold tracking-wider">
                      Review the well analyzed "Goal-Market" fixtures and pick the ones you believe stand strongest.
                    </p>
                </div>

                {/* Step 3 - Highlighted */}
                <div className="group relative bg-heist-green/5 hover:bg-heist-green/10 border border-heist-green/30 rounded-[40px] p-12 transition-all duration-500 hover:border-heist-green shadow-[0_0_60px_-20px_rgba(34,197,94,0.3)]">
                    <div className="absolute -top-5 -left-5 w-12 h-12 bg-[#0a0a0a] border border-heist-green/60 rounded-2xl flex items-center justify-center text-sm font-black text-heist-green">03</div>
                    <div className="w-20 h-20 bg-heist-green/20 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                        <Flame className="text-heist-green w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 italic">THE SACRIFICIAL PICK</h3>
                    <p className="text-[11px] text-gray-200 leading-relaxed font-bold italic tracking-wide">
                      Let’s be realistic — not all your picks will survive. Identify the ones most at risk and designate it as your Sacrifice. If it loses, it won’t count against you.
                    </p>
                </div>

                {/* Step 4 */}
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-[40px] p-12 transition-all duration-500 hover:border-heist-green/40">
                    <div className="absolute -top-5 -left-5 w-12 h-12 bg-[#0a0a0a] border border-white/20 rounded-2xl flex items-center justify-center text-sm font-black text-gray-500">04</div>
                    <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform">
                        <Send className="text-green-500 w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 italic">THE GET-AWAY DRIVE</h3>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-bold tracking-wider">
                        Download your Heist slip and submit via WhatsApp to secure participation and claim your heist prize.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-32 relative overflow-hidden bg-[#0f0f0f]">
        <div className="absolute inset-0 bg-heist-green/5">
            <img src="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&q=80&w=2000" alt="Tactical Grid" className="w-full h-full object-cover opacity-15 grayscale mix-blend-overlay" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-[50px] p-16 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl sm:text-5xl font-black text-white mb-6 italic tracking-tighter whitespace-nowrap">IT'S ABOUT TIME!</h3>
                    <p className="text-gray-500 text-sm font-bold tracking-[0.4em] mb-10">THE VAULT IS OPEN FOR THIS WEEKEND'S HEIST.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-3 text-[11px] text-gray-300 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 font-black tracking-widest">
                            <Trophy size={20} className="text-heist-green" />
                            LOOT: <span className="font-black text-white">3X RETURN</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-300 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 font-black tracking-widest">
                            <Users size={20} className="text-heist-green" />
                            SLOTS: <span className="font-black text-white">LIMITED TO 100 PARTICIPANTS</span>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                    <button 
                        onClick={onStart}
                        className="bg-heist-green text-black hover:bg-green-600 text-xl font-black py-4 px-10 rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap italic tracking-tighter"
                    >
                        START HEIST
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="p-16 border-t border-gray-800 text-center space-y-6 bg-[#0a0a0a]">
           <div className="flex items-center justify-center gap-3 text-red-500/50">
              <AlertCircle size={18} />
              <span className="text-[12px] font-black tracking-[0.5em] uppercase italic">LEGAL DISCLAIMER</span>
           </div>
           <p className="text-[12px] text-gray-600 font-bold max-w-5xl mx-auto leading-loose uppercase tracking-widest">
             Goal Heist is an independent selection platform promoting the BetBuddy AI System. We are not a licensed gambling provider. 
             Fixtures provided is for selection purposes only. All participation is subject to localized laws. We are not responsible for financial losses or unexpected match outcomes. 
             Report any fraudulent behavior to the official admin channels immediately.
           </p>
      </footer>
    </div>
  );
};

export default WelcomePage;
