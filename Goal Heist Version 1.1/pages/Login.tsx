
import React, { useState, useContext } from 'react';
import { Lock, MessageCircle, ShieldCheck, Eye, EyeOff, Mail, Loader2, Key, ChevronRight } from 'lucide-react';
import { GameContext } from '../contexts/AppContext';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface LoginPageProps {
  onLoginSuccess: (isAdmin: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { settings } = useContext(GameContext);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (!isSupabaseConfigured) {
        setError('Database configuration missing.');
        return;
      }

      setIsAuthenticating(true);
      try {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          setError(authError.message === 'Invalid login credentials' 
            ? 'Access Denied: Invalid Admin Credentials' 
            : authError.message);
        } else {
          onLoginSuccess(true);
        }
      } catch (err) {
        setError('Connection failed. Please check your network.');
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      // User Access Code Check
      if (code.trim().toUpperCase() === settings.accessCode.toUpperCase()) {
        onLoginSuccess(false);
      } else if (!code.trim()) {
        setError('Please enter an access code.');
      } else {
        setError('Access Denied: Invalid Vault Code');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-12">
      <div className={`w-full max-w-md p-1 rounded-2xl transition-all duration-500 bg-gradient-to-br ${isAdminMode ? 'from-red-600/50 to-red-900/20 shadow-[0_0_50px_rgba(220,38,38,0.1)]' : 'from-heist-green/50 to-gray-800 shadow-[0_0_50px_rgba(34,197,94,0.1)]'}`}>
        
        <div className="bg-heist-card rounded-[15px] p-8 relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="text-center mb-8 relative z-10">
            <div className="flex items-center justify-center mx-auto mb-6">
              {isAdminMode ? <ShieldCheck className="text-red-500 w-12 h-12" /> : <Key className="text-heist-green w-12 h-12" />}
            </div>
            <h2 className="font-display font-black text-4xl uppercase tracking-tighter italic">
              {isAdminMode ? 'System Auth' : 'Vault Access'}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">
              {isAdminMode ? 'Authorized Personnel Only' : 'Enter Access Code to Proceed'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {isAdminMode ? (
              <div className="space-y-3 animate-fade-in">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ADMIN EMAIL"
                    className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-4 font-sans text-xs tracking-widest text-white focus:outline-none focus:border-red-500 transition-all placeholder-gray-700"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="PASSWORD"
                    className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-12 py-4 font-sans text-xs tracking-widest text-white focus:outline-none focus:border-red-500 transition-all placeholder-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group animate-fade-in">
                <input
                  type={showPassword ? "text" : "password"}
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="CODE"
                  className="w-full bg-black border border-gray-800 rounded-xl px-4 py-5 text-center font-mono text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-heist-green transition-all placeholder-gray-800 uppercase shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 py-2 px-4 rounded-lg flex items-center gap-2 animate-bounce">
                <span className="text-red-500 text-[10px] font-black uppercase tracking-wider text-center w-full">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className={`w-full font-black text-xl py-5 rounded-xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl flex items-center justify-center gap-3 uppercase italic tracking-tighter ${
                isAdminMode 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                  : 'bg-heist-green hover:bg-green-500 text-black shadow-[0_10px_30px_-5px_rgba(34,197,94,0.4)]'
              }`}
            >
              {isAuthenticating ? <Loader2 className="animate-spin" size={24} /> : null}
              {isAdminMode ? (isAuthenticating ? 'Authorizing...' : 'Enter System') : 'Enter Vault'}
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-gray-800/50 flex flex-col items-center gap-4 relative z-10">
              {!isAdminMode && (
                <a 
                  href={`https://wa.me/2349133635465?text=${encodeURIComponent("Hello, I want to participate in Goal Heist. Can I get an access code?")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-heist-green transition-colors group"
                >
                  <MessageCircle size={14} />
                  <span className="group-hover:underline">Request Access Code</span>
                </a>
              )}

              <button
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  setCode('');
                  setEmail('');
                  setPassword('');
                  setError('');
                  setShowPassword(false);
                }}
                className={`text-[10px] font-black transition-colors mt-2 uppercase tracking-[0.2em] ${isAdminMode ? 'text-gray-500 hover:text-white' : 'text-gray-700 hover:text-gray-400'}`}
              >
                {isAdminMode ? '← Back to Entry' : 'Admin Management'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
