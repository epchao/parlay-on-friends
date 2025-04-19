"use client";

import { createContext, useState } from "react";

type DataContextProps = {
  dataLoaded: boolean;
  setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  playerDetails: Record<string, any>[];
  setPlayerDetails: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
  userBets: Record<string, any>;
  setUserBets: React.Dispatch<React.SetStateAction<Record<string, any>>>;
};

type Props = { children: React.ReactNode };

export const DataContext = createContext<DataContextProps>({
  dataLoaded: false,
  setDataLoaded: () => {},
  playerDetails: [],
  setPlayerDetails: () => {},
  userBets: {},
  setUserBets: () => {},
});

export const DashboardWrapper = ({ children }: Props) => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [playerDetails, setPlayerDetails] = useState<Record<string, any>[]>([]);
  const [userBets, setUserBets] = useState<Record<string, any>>({});
  return (
    <DataContext.Provider
      value={{
        dataLoaded,
        setDataLoaded,
        playerDetails,
        setPlayerDetails,
        userBets,
        setUserBets,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
