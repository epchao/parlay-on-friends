"use client";

import React, { createContext, useState } from "react";

type DataContextProps = {
  dataLoaded: boolean;
  setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  playerDetails: Record<string, any>[];
  setPlayerDetails: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  userBets: Record<string, any>;
  setUserBets: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
  resetBet: boolean;
  setResetBet: React.Dispatch<React.SetStateAction<boolean>>;
};

type Props = { children: React.ReactNode };

export const DataContext = createContext<DataContextProps>({
  dataLoaded: false,
  setDataLoaded: () => {},
  playerDetails: [],
  setPlayerDetails: () => {},
  userBets: {},
  setUserBets: () => {},
  resetBet: false,
  setResetBet: () => {},
});

export const DashboardWrapper = ({ children }: Props) => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [playerDetails, setPlayerDetails] = useState<Record<string, any>[]>([]);
  const [userBets, setUserBets] = useState<Record<string, string>[]>([]);
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
