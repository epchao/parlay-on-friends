"use client";

import React, { createContext, useState } from "react";

type UserBets = {
  kills: 'MORE' | 'LESS' | 'NONE';
  deaths: 'MORE' | 'LESS' | 'NONE';
  cs: 'MORE' | 'LESS' | 'NONE';
  assists: 'MORE' | 'LESS' | 'NONE';
  amount?: number;
};

type DataContextProps = {
  dataLoaded: boolean;
  setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  playerDetails: Record<string, any>[];
  setPlayerDetails: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  userBets: UserBets;
  setUserBets: React.Dispatch<React.SetStateAction<UserBets>>;
  originalBets: UserBets;
  gameTime: number;
  setGameTime: React.Dispatch<React.SetStateAction<number>>;
  loadExistingBets: (userId: string, playerId: string) => Promise<void>;
  clearBet: (userId: string, playerId: string) => Promise<void>;
};

type Props = { children: React.ReactNode };

export const DataContext = createContext<DataContextProps>({
  dataLoaded: false,
  setDataLoaded: () => {},
  playerDetails: [],
  setPlayerDetails: () => {},
  userBets: { kills: 'NONE', deaths: 'NONE', cs: 'NONE', assists: 'NONE' },
  setUserBets: () => {},
  originalBets: { kills: 'NONE', deaths: 'NONE', cs: 'NONE', assists: 'NONE' },
  gameTime: 0,
  setGameTime: () => {},
  loadExistingBets: async () => {},
  clearBet: async () => {},
});

export const DashboardWrapper = ({ children }: Props) => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [playerDetails, setPlayerDetails] = useState<Record<string, any>[]>([]);
  const [gameTime, setGameTime] = useState<number>(0);
  const [userBets, setUserBets] = useState<UserBets>({ 
    kills: 'NONE', 
    deaths: 'NONE', 
    cs: 'NONE', 
    assists: 'NONE' 
  });
  const [originalBets, setOriginalBets] = useState<UserBets>({ 
    kills: 'NONE', 
    deaths: 'NONE', 
    cs: 'NONE', 
    assists: 'NONE' 
  });

  const loadExistingBets = async (userId: string, playerId: string) => {
    try {
      const response = await fetch("/api/bets/get-current", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          player_id: playerId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const betsData = {
          kills: data.kills || 'NONE',
          deaths: data.deaths || 'NONE',
          cs: data.cs || 'NONE',
          assists: data.assists || 'NONE',
          amount: data.amount || undefined
        };
        setUserBets(betsData);
        setOriginalBets(betsData); // Store the original state for comparison
      }
    } catch (error) {
      console.error("Failed to load existing bets:", error);
    }
  };

  const clearBet = async (userId: string, playerId: string) => {
    try {
      const response = await fetch("/api/bets/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          player_id: playerId,
        }),
      });

      if (response.ok) {
        // Reset both current and original bets to empty state
        const emptyBets = {
          kills: 'NONE' as const,
          deaths: 'NONE' as const,
          cs: 'NONE' as const,
          assists: 'NONE' as const
        };
        setUserBets(emptyBets);
        setOriginalBets(emptyBets);
      } else {
        console.error("Failed to delete bet");
      }
    } catch (error) {
      console.error("Failed to clear bet:", error);
    }
  };
  return (
    <DataContext.Provider
      value={{
        dataLoaded,
        setDataLoaded,
        playerDetails,
        setPlayerDetails,
        userBets,
        setUserBets,
        originalBets,
        gameTime,
        setGameTime,
        loadExistingBets,
        clearBet,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
