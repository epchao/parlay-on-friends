"use client";

import React, { createContext, useState } from "react";

type UserBets = {
  kills: 'MORE' | 'LESS' | 'NONE';
  deaths: 'MORE' | 'LESS' | 'NONE';
  cs: 'MORE' | 'LESS' | 'NONE';
  assists: 'MORE' | 'LESS' | 'NONE';
};

type DataContextProps = {
  dataLoaded: boolean;
  setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  playerDetails: Record<string, any>[];
  setPlayerDetails: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  userBets: UserBets;
  setUserBets: React.Dispatch<React.SetStateAction<UserBets>>;
  resetBet: boolean;
  setResetBet: React.Dispatch<React.SetStateAction<boolean>>;
};

type Props = { children: React.ReactNode };

export const DataContext = createContext<DataContextProps>({
  dataLoaded: false,
  setDataLoaded: () => {},
  playerDetails: [],
  setPlayerDetails: () => {},
  userBets: { kills: 'NONE', deaths: 'NONE', cs: 'NONE', assists: 'NONE' },
  setUserBets: () => {},
  resetBet: false,
  setResetBet: () => {},
});

export const DashboardWrapper = ({ children }: Props) => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [playerDetails, setPlayerDetails] = useState<Record<string, any>[]>([]);
  const [userBets, setUserBets] = useState<UserBets>({ 
    kills: 'NONE', 
    deaths: 'NONE', 
    cs: 'NONE', 
    assists: 'NONE' 
  });
  const [resetBet, setResetBet] = useState<boolean>(false);
  return (
    <DataContext.Provider
      value={{
        dataLoaded,
        setDataLoaded,
        playerDetails,
        setPlayerDetails,
        userBets,
        setUserBets,
        resetBet,
        setResetBet,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
