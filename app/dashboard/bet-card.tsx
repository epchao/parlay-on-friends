"use client";

import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { Bet } from "@/interfaces/bet";
import { DataContext } from "./dashboard-wrapper";
import { calculateGameSeconds } from "../api/live-games/calculateGameSeconds";

const BetCard: React.FC<Bet> = ({ playerName, stat, type, playerImage }) => {
  const { dataLoaded, setUserBets, userBets, gameTime } =
    useContext(DataContext);
  const [selected, setSelected] = useState("");
  const gameSeconds = calculateGameSeconds(gameTime);

  // Update selected state based on userBets from context
  useEffect(() => {
    const betKey = type.toLowerCase() as "kills" | "deaths" | "cs" | "assists";
    const currentSelection = userBets[betKey];
    if (currentSelection && currentSelection !== "NONE") {
      setSelected(currentSelection);
    } else {
      setSelected("");
    }
  }, [userBets, type]);

  const handleBetSelection = (betType: "LESS" | "MORE") => {
    // Don't allow selection if betting window has closed
    if (gameSeconds >= 300) return; // 300 seconds = 5 minutes

    const betKey = type.toLowerCase() as "kills" | "deaths" | "cs" | "assists";
    if (selected === "") {
      setSelected(betType);
      setUserBets((prevBets) => ({
        ...prevBets,
        [betKey]: betType,
      }));
    } else if (selected === betType) {
      setSelected("");
      setUserBets((prevBets) => ({
        ...prevBets,
        [betKey]: "NONE",
      }));
    } else {
      setSelected(betType);
      setUserBets((prevBets) => ({
        ...prevBets,
        [betKey]: betType,
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
            className={`flex-1 text-white tracking-tighter font-bold transition-colors duration-500 ease-in-out ${
              gameSeconds >= 300
                ? "bg-gray-600 cursor-not-allowed"
                : `bg-gray-900 ${selected === "LESS" ? "bg-red-700" : ""} hover:bg-red-600`
            }`}
            onClick={() => {
              handleBetSelection("LESS");
            }}
            disabled={gameSeconds >= 300}
            title={gameSeconds >= 300 ? "Betting closed after 5 minutes" : ""}
          >
            Less
          </button>
          <button
            className={`flex-1 text-white tracking-tighter font-bold transition-colors duration-500 ease-in-out ${
              gameSeconds >= 300
                ? "bg-gray-600 cursor-not-allowed"
                : `bg-gray-900 ${selected === "MORE" ? "bg-green-700" : ""} hover:bg-green-600`
            }`}
            onClick={() => {
              handleBetSelection("MORE");
            }}
            disabled={gameSeconds >= 300}
            title={gameSeconds >= 300 ? "Betting closed after 5 minutes" : ""}
          >
            More
          </button>
        </div>
      </div>
    )
  );
};

export default BetCard;
