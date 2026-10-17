import React from 'react';
import { useTrade, PageId } from '../context/TradeContext';
import { LayoutDashboard, TrendingUp, Layers, Briefcase, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentPage, navigateTo, user, theme } = useTrade();

  if (!user && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register')) {
    return null;
  }

  const navItems: { id: PageId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Explore', icon: LayoutDashboard },
    { id: 'markets', label: 'Stocks', icon: TrendingUp },
    { id: 'mutual-funds', label: 'Mutual Funds', icon: Layers },
    { id: 'portfolio', label: 'Holdings', icon: Briefcase },
    { id: 'profile', label: 'You', icon: User }
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-2 py-1.5 flex items-center justify-around transition-colors ${
        theme === 'dark'
          ? 'bg-[#0e1219]/95 border-slate-800/90 text-slate-400'
          : 'bg-white/95 border-slate-200/90 text-slate-500 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id || (item.id === 'markets' && currentPage === 'stock-details');
        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            onClick={() => navigateTo(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-[#00d09c] font-bold scale-105'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className={`text-[10px] mt-1 ${isActive ? 'font-black text-[#00d09c]' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
