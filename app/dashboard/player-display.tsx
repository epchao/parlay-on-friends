"use client";

import { Player } from "@/interfaces/player";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { calculateGameTime } from "../api/get-current-game-info/calculateGametime";
import { DataContext } from "./dashboard-wrapper";

interface PlayerDisplayProps {
  name: string;
  tag: string;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ name, tag }) => {
  // States for game data
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [allies, setAllies] = useState<Player[]>([]);
  const [allyColor, setAllyColor] = useState("");
  const [enemies, setEnemies] = useState<Player[]>([]);
  const [time, setTime] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dataLoaded, setDataLoaded } = useContext(DataContext);

  // Function to create JSX for teams
  const mapTeam = (team: Player[], isCurrentInTeam: boolean) => {
    let updatedTeam = [...team];

    if (currentPlayer && isCurrentInTeam) {
      updatedTeam = [currentPlayer, ...team];
    }

    return updatedTeam.map((player: Player, index) => (
      <tr key={index}>
        <td className="w-1/5 px-1 py-2">{player.name}</td>
        <td className="w-1/5 px-1 py-2 ">{player.champion}</td>
        <td className="w-1/5 px-1 py-2 ">{player.avgKda?.toFixed(2)}</td>
        <td className="w-1/5 px-1 py-2 ">{player.avgCs?.toFixed(2)}</td>
        <td className="w-1/5 px-1 py-2 ">{player.soloDuoRank}</td>
      </tr>
    ));
  };

  const initialFetchDone = useRef(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (initialFetchDone.current || dataLoaded) return;

      try {
        const response = await fetch(
          `/api/get-current-game-info?riotId=${name}&tag=${tag}`
        );
        if (!response.ok) throw new Error("Player not found or API error");

        const data = await response.json();

        if (data.error === "Player not in game") {
          setError("This player is currently not in game.");
          return;
        } else if (
          data.error === "Player not currently playing a ranked match"
        ) {
          setError("This player is not playing a ranked match.");
          return;
        } else if (data.error === "Player not found") {
          setError("This player does not exist");
          return;
        }

        setCurrentPlayer(data.currentPlayer);
        setTime(data.gameTime);
        setAllyColor(data.allyColor);
        setAllies(data.allies);
        setEnemies(data.enemies);
        setDataLoaded(true);
        setError(null);
        initialFetchDone.current = true;
      } catch (err) {
        console.error("Error fetching player data", err);
        setError("Error fetching player data");
      } finally {
        setLoading(false);
      }
    };
    // Try to fetch game data from player
    fetchPlayer();
    // Retry every 2 minutes
    const retryInterval = setInterval(fetchPlayer, 120000);
    return () => clearInterval(retryInterval);
  }, [dataLoaded]);

  // Wait until everything is loaded then check game is ongoing every 5 minutes
  useEffect(() => {
    if (!dataLoaded || !currentPlayer) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/game/${currentPlayer.puuid}`);
        if (!response.ok) throw new Error("Failed to check game status");

        const { gameOngoing } = await response.json();

        if (!gameOngoing) {
          setCurrentPlayer(null);
          setTime(0);
          setAllyColor("");
          setAllies([]);
          setEnemies([]);
          setDataLoaded(false);
          setError(null);
          initialFetchDone.current = false;
        }
      } catch (err) {
        console.error("Error checking game status", err);
      }
    }, 360000);

    return () => clearInterval(interval);
  }, [dataLoaded]);

  // Set interval to tick up every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    // Clear interval when component unmounts
    return () => clearInterval(timerInterval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!currentPlayer) return <div>No player data found</div>;

  return (
    <>
      {/* Main Container */}
      <main className="bg-gray-700 min-w-[90dvw] grid grid-cols-1 grid-rows-12 rounded-lg text-xs mx-6 lg:grid-cols-12 lg:text-sm xl:text-base">
        {/* Player info container */}
        <section className="bg-gray-800 m-3 row-s n-4 rounded-xl flex flex-col justify-evenly lg:col-span-4 lg:row-span-12 2xl:justify-center 2xl:gap-16">
          {/* Player icon */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6 sm:mb-4 lg:mb-6 xl:mb-8">
              <Image
                src={currentPlayer.icon!}
                alt="icon"
                width={256}
                height={256}
                className="size-16 rounded-full lg:size-24"
              />
              <p className="absolute top-[80%] left-1/2 transform -translate-x-1/2 bg-gray-600/80 px-2 py-1 rounded-xl lg:top-[85%] text-xs">
                {currentPlayer.level}
              </p>
            </div>
            <p className="text-base lg:text-2xl xl:text-4xl">
              {currentPlayer.name} #{currentPlayer.tag}
            </p>
          </div>
          {/* Player ranks */}
          <div className="flex justify-evenly text-center mb-4 lg:mb-0 lg:flex-col lg:p-6 lg:items-center lg:gap-8 2xl:flex-row">
            <div className="flex flex-col items-center bg-gray-600 rounded-xl px-6 py-4 sm:px-10 sm:py-6 md:px-12 lg:size-48 lg:items-between 2xl:min-w-[10dvw] 2xl:p-0 2xl:justify-evenly">
              <p>Solo/Duo</p>
              {currentPlayer.soloDuoRankImage && (
                <Image
                  src={currentPlayer.soloDuoRankImage!}
                  alt="Rank"
                  width={256}
                  height={256}
                  className="size-20 lg:size-24"
                />
              )}
              {/* Placeholder until we get an unranked image */}
              {!currentPlayer.soloDuoRankImage && (
                <div className="size-20 lg:size-24"></div>
              )}
              <p>{currentPlayer.soloDuoRank}</p>
            </div>
            <div className="flex flex-col items-center bg-gray-600 rounded-xl px-6 py-4 sm:px-10 sm:py-6 md:px-12 lg:size-48 lg:items-between 2xl:min-w-[10dvw] 2xl:p-0 2xl:justify-evenly">
              <p>Flex</p>
              <div>
                {currentPlayer.flexRankImage && (
                  <Image
                    src={currentPlayer.flexRankImage!}
                    alt="Rank"
                    width={256}
                    height={256}
                    className="size-20 lg:size-24"
                  />
                )}
                {/* Placeholder until we get an unranked image */}
                {!currentPlayer.flexRankImage && (
                  <div className="size-20 lg:size-24"></div>
                )}
                <p>{currentPlayer.flexRank}</p>
              </div>
            </div>
          </div>
        </section>
        {/* Champ Image + Game Meta Data Container */}
        <section className="bg-gray-800 mx-3 mb-3 row-span-8 rounded-xl text-center lg:col-span-8 lg:row-span-12 lg:m-3">
          {/* Champ Image */}
          <div className="p-2">
            <Image
              src={currentPlayer.championImage!}
              alt="Champion"
              width={256}
              height={256}
              className="size-20 m-auto lg:size-24"
            />
          </div>
          {/* Game data */}
          <div className="">
            {/* Time */}
            <p className="bg-gray-600 py-2 font-bold">
              Game Time: {calculateGameTime(time)}
            </p>
            {/* Blue Team Table */}
            <div>
              <p className="bg-blue-600 py-2 font-bold">Blue Team</p>
              <table className="w-full">
                <thead className="border-b border-blue-600">
                  <tr className="">
                    <th className="w-1/5 p-1 ">Player</th>
                    <th className="w-1/5 p-1 ">Champion</th>
                    <th className="w-1/5 p-1 ">Avg KDA</th>
                    <th className="w-1/5 p-1 ">Avg CS</th>
                    <th className="w-1/5 p-1 ">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {allyColor === "blue"
                    ? mapTeam(allies, true)
                    : mapTeam(enemies, false)}
                </tbody>
              </table>
            </div>
            {/* Red Team Table */}
            <div>
              <p className="bg-red-600 py-2 font-bold">Red Team</p>
              <table className="w-full">
                <thead className="border-b border-red-600">
                  <tr>
                    <th className="w-1/5 p-1">Player</th>
                    <th className="w-1/5 p-1">Champion</th>
                    <th className="w-1/5 p-1">Avg KDA</th>
                    <th className="w-1/5 p-1">Avg CS</th>
                    <th className="w-1/5 p-1">Rank</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {allyColor === "red"
                    ? mapTeam(allies, true)
                    : mapTeam(enemies, false)}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PlayerDisplay;
