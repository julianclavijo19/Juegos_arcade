import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useStats } from '../hooks/useStats';
import type { Stats, GameStats } from '../hooks/useStats';

interface StatsContextType {
  stats: Stats;
  updateGameStats: (
    game: keyof Omit<Stats, 'totalGamesPlayed' | 'totalScore' | 'totalTime' | 'unlockedThemes' | 'achievements' | 'rewards'>,
    updates: Partial<GameStats>
  ) => void;
  addAchievement: (achievement: string, game?: string) => void;
  unlockTheme: (theme: string) => void;
  resetStats: () => void;
  formatTime: (seconds: number) => string;
  addReward: (reward: string) => void;
  checkAndAwardRewards: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const statsHook = useStats();

  return (
    <StatsContext.Provider value={statsHook}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStatsContext = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStatsContext must be used within StatsProvider');
  }
  return context;
};

