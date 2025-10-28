import { useState, useEffect } from 'react';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  highScore: number;
  totalScore: number;
  totalTime: number; // en segundos
  achievements: string[];
}

export interface Stats {
  tetris: GameStats;
  snake: GameStats;
  pong: GameStats;
  tictactoe: GameStats;
  spaceinvaders: GameStats;
  connectfour: GameStats;
  chess: GameStats;
  parchis: GameStats;
  uno: GameStats;
  totalGamesPlayed: number;
  totalScore: number;
  totalTime: number;
  unlockedThemes: string[];
  achievements: string[];
  rewards: string[];
}

const defaultGameStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  highScore: 0,
  totalScore: 0,
  totalTime: 0,
  achievements: [],
};

const defaultStats: Stats = {
  tetris: { ...defaultGameStats },
  snake: { ...defaultGameStats },
  pong: { ...defaultGameStats },
  tictactoe: { ...defaultGameStats },
  spaceinvaders: { ...defaultGameStats },
  connectfour: { ...defaultGameStats },
  chess: { ...defaultGameStats },
  parchis: { ...defaultGameStats },
  uno: { ...defaultGameStats },
  totalGamesPlayed: 0,
  totalScore: 0,
  totalTime: 0,
  unlockedThemes: ['neon'],
  achievements: [],
  rewards: [],
};

export const useStats = () => {
  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('arcade-stats');
    return saved ? JSON.parse(saved) : defaultStats;
  });

  useEffect(() => {
    localStorage.setItem('arcade-stats', JSON.stringify(stats));
  }, [stats]);

  const updateGameStats = (
    game: keyof Omit<Stats, 'totalGamesPlayed' | 'totalScore' | 'totalTime' | 'unlockedThemes' | 'achievements'>,
    updates: Partial<GameStats>
  ) => {
    setStats((prev) => {
      const newGameStats = { ...prev[game], ...updates };
      return {
        ...prev,
        [game]: newGameStats,
        totalGamesPlayed: prev.totalGamesPlayed + (updates.gamesPlayed || 0),
        totalScore: prev.totalScore + (updates.totalScore || 0),
        totalTime: prev.totalTime + (updates.totalTime || 0),
      };
    });
  };

  const addAchievement = (achievement: string, game?: string) => {
    setStats((prev) => {
      const newAchievements = [...prev.achievements];
      if (!newAchievements.includes(achievement)) {
        newAchievements.push(achievement);
      }

      if (game) {
        const gameKey = game as keyof Omit<Stats, 'totalGamesPlayed' | 'totalScore' | 'totalTime' | 'unlockedThemes' | 'achievements' | 'rewards'>;
        const gameStats = prev[gameKey];
        if (typeof gameStats === 'object' && 'achievements' in gameStats) {
          const gameAchievements = [...gameStats.achievements];
          if (!gameAchievements.includes(achievement)) {
            gameAchievements.push(achievement);
          }
          return {
            ...prev,
            achievements: newAchievements,
            [gameKey]: {
              ...gameStats,
              achievements: gameAchievements,
            },
          };
        }
      }

      return {
        ...prev,
        achievements: newAchievements,
      };
    });
  };

  const unlockTheme = (theme: string) => {
    setStats((prev) => {
      const themes = [...prev.unlockedThemes];
      if (!themes.includes(theme)) {
        themes.push(theme);
      }
      return { ...prev, unlockedThemes: themes };
    });
  };

  const resetStats = () => {
    setStats(defaultStats);
    localStorage.removeItem('arcade-stats');
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const addReward = (reward: string) => {
    setStats((prev) => {
      const newRewards = [...prev.rewards];
      if (!newRewards.includes(reward)) {
        newRewards.push(reward);
      }
      return { ...prev, rewards: newRewards };
    });
  };

  // Check and award rewards based on stats
  const checkAndAwardRewards = () => {
    // Total games milestone rewards
    if (stats.totalGamesPlayed >= 10 && !stats.rewards.includes('10_games')) {
      addReward('10_games');
      unlockTheme('cyberpunk');
    }
    if (stats.totalGamesPlayed >= 50 && !stats.rewards.includes('50_games')) {
      addReward('50_games');
      unlockTheme('retro');
    }
    if (stats.totalGamesPlayed >= 100 && !stats.rewards.includes('100_games')) {
      addReward('100_games');
      unlockTheme('matrix');
    }
    
    // Score milestone rewards
    if (stats.totalScore >= 1000 && !stats.rewards.includes('1000_points')) {
      addReward('1000_points');
    }
    if (stats.totalScore >= 10000 && !stats.rewards.includes('10000_points')) {
      addReward('10000_points');
      unlockTheme('galaxy');
    }
    
    // Time played rewards
    if (stats.totalTime >= 3600 && !stats.rewards.includes('1_hour')) {
      addReward('1_hour');
    }
    if (stats.totalTime >= 36000 && !stats.rewards.includes('10_hours')) {
      addReward('10_hours');
      unlockTheme('midnight');
    }
    
    // Achievement-based rewards
    if (stats.achievements.length >= 10 && !stats.rewards.includes('10_achievements')) {
      addReward('10_achievements');
      unlockTheme('sunset');
    }
    if (stats.achievements.length >= 25 && !stats.rewards.includes('25_achievements')) {
      addReward('25_achievements');
      unlockTheme('ocean');
    }
    
    // Game-specific rewards
    const allGames: Array<keyof Omit<Stats, 'totalGamesPlayed' | 'totalScore' | 'totalTime' | 'unlockedThemes' | 'achievements' | 'rewards'>> = [
      'tetris', 'snake', 'pong', 'tictactoe', 'spaceinvaders', 'connectfour', 'chess', 'parchis', 'uno'
    ];
    
    const gamesWithWins = allGames.filter(game => stats[game].gamesWon > 0).length;
    if (gamesWithWins >= 5 && !stats.rewards.includes('5_games_won')) {
      addReward('5_games_won');
      unlockTheme('rainbow');
    }
    if (gamesWithWins === 9 && !stats.rewards.includes('all_games_won')) {
      addReward('all_games_won');
      unlockTheme('champion');
    }
  };

  return {
    stats,
    updateGameStats,
    addAchievement,
    unlockTheme,
    resetStats,
    formatTime,
    addReward,
    checkAndAwardRewards,
  };
};

