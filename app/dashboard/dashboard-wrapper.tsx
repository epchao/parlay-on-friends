"use client";

import { createContext, useState } from "react";

type DataContextProps = {
  dataLoaded: boolean;
  setDataLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};

type Props = { children: React.ReactNode };

export const DataContext = createContext<DataContextProps>({
  dataLoaded: false,
  setDataLoaded: () => false,
});

export const DashboardWrapper = ({ children }: Props) => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  return (
    <DataContext.Provider value={{ dataLoaded, setDataLoaded }}>
      {children}
    </DataContext.Provider>
  );
};
