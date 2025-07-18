"use client";

import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { Bet } from "@/interfaces/bet";
import { DataContext } from "./dashboard-wrapper";

const BetCard: React.FC<Bet> = ({ playerName, stat, type, playerImage }) => {
  const { dataLoaded, setUserBets, resetBet } = useContext(DataContext);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (resetBet) {
      setSelected("");
    }
  }, [resetBet]);

  const handleBetSelection = (betType: "LESS" | "MORE") => {
    const betKey = type.toLowerCase() as 'kills' | 'deaths' | 'cs' | 'assists';
    if (selected === "") {
      setSelected(betType);
      setUserBets((prevBets) => ({
        ...prevBets,
        [betKey]: betType
      }));
    } else if (selected === betType) {
      setSelected("");
      setUserBets((prevBets) => ({
        ...prevBets,
        [betKey]: 'NONE'
      }));
    } else {
      setSelected(betType);
      setUserBets((prevBets) => ({
        ...prevBets,
        [betKey]: betType
      }));
    }
  };

  return (
    dataLoaded && (
      <div className="relative p-10 bg-gray-700 text-white rounded shadow-md w-58 h-80 flex flex-col align-center justify-center flex-grow-0">
        {/* Player info */}
        <Image
          src={playerImage}
          alt={playerName}
          width={128}
          height={128}
          className="rounded-full mb-4 mx-auto"
        />
        <h2 className="text-xl font-bold flex justify-center item-center text-center text-nowrap mb-2">
          {playerName}
        </h2>

        {/* Bet type and amount */}
        <div className="flex w-38 h-10 rounded shadow-md overflow-under mb-4">
          {/* Bet type */}
          <div className="flex-1 bg-gray-800 flex items-center justify-center">
            <p className="text-center text-sm font-bold break-words w-14">
              {type}
            </p>
          </div>
          {/* Bet Stat */}
          <div className="flex-1 bg-gray-600 flex items-center justify-center">
            <p className="text-md font-bold ">{stat}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="absolute bottom-0 left-0 w-full h-12 flex">
          <button
            className={`flex-1 bg-gray-900 text-white ${selected === "LESS" ? "bg-red-700" : ""} 
            tracking-tighter font-bold hover: transition-colors duration-500 ease-in-out`}
            onClick={() => {
              handleBetSelection("LESS");
            }}
          >
            Less
          </button>
          <button
            className={`flex-1 bg-gray-900 text-white ${selected === "MORE" ? "bg-green-700" : ""}
                    tracking-tighter font-bold hover: transition-colors duration-500 ease-in-out`}
            onClick={() => {
              handleBetSelection("MORE");
            }}
          >
            More
          </button>
        </div>
      </div>
    )
  );
};

export default BetCard;
