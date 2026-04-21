import React, { createContext, useContext, useState, useEffect } from 'react';
import { games } from '../config/gamesData';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [activeGameId, setActiveGameId] = useState(games[0].id);
  
  const activeGame = games.find(g => g.id === activeGameId) || games[0];

  useEffect(() => {
    // Inyectar variables CSS al root base cuando la config cambie
    const root = document.documentElement;
    Object.entries(activeGame.theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [activeGameId]);

  const switchGame = (gameId) => {
    setActiveGameId(gameId);
  };

  return (
    <GameContext.Provider value={{ gameInfo: activeGame, switchGame, availableGames: games }}>
      {children}
    </GameContext.Provider>
  );
};
