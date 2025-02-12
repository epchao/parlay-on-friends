"use client";

import { Player } from "@/interfaces/player";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  const [time, setTime] = useState("00:00");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to create JSX for teams
  const mapTeam = (team: Player[], isCurrentInTeam: boolean) => {
    let updatedTeam = [...team];

    if (currentPlayer && isCurrentInTeam) {
      updatedTeam = [currentPlayer, ...team];
    }

    return updatedTeam.map((player: Player, index) => (
      <tr key={index}>
        <td>{player.name}</td>
        <td>{player.champion}</td>
        <td>{player.avgKda.toFixed(2)}</td>
        <td>{player.avgCs.toFixed(2)}</td>
        <td>{player.soloDuoRank}</td>
      </tr>
    ));
  };

  useEffect(() => {
    // @TODO: Ensure that if the current player isn't in game, then nothing will load.
    const fetchPlayer = async () => {
      try {
        const response = await fetch(
          `/api/get-current-game-info?riotId=${name}&tag=${tag}`
        );
        if (!response.ok) {
          throw new Error("Player not found or API error");
        }
        const data = await response.json();
        console.log(data);

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
      } catch (err) {
        setError("Error fetching player data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [name, tag]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!currentPlayer) return <div>No player data found</div>;

  // @TODO: Ensure that if current player has no rank, then we should just display no rank as right
  // now it tries to look for an empty image name, which is invalid.
  return (
    <>
      {/* Main Container */}
      <main className="flex flex-col items-center gap-2 p-2 bg-green-500 h-auto w-[95dvw] rounded-3xl lg:flex-row lg:p-8 lg:gap-8">
        {/* Player info container */}
        <section className="flex flex-col items-center bg-neutral-400 h-auto w-full rounded-3xl sm:flex-row sm:justify-evenly lg:flex-col lg:h-[40rem] lg:w-2/6">
          {/* Player icon */}
          <div className="flex items-center gap-2 p-4 lg:p-0 lg:pt-8">
            <Image
              src={currentPlayer.icon!}
              alt="icon"
              width={300}
              height={300}
              className="size-20 rounded-lg"
            />
            <div className="flex flex-col">
              <p>
                {currentPlayer.name} #{currentPlayer.tag}
              </p>
              <p className="text-xs">Level {currentPlayer.level}</p>
            </div>
          </div>
          {/* Player ranks */}
          <div className="flex h-full w-full py-4 justify-evenly items-center lg:flex-col lg:w-full text-center lg:justify-evenly">
            <div className="text-xs sm:text-sm flex flex-col items-center lg:text-base lg:w-full">
              <p className="lg:bg-gray-800 lg:w-full lg:p-4">Solo/Duo</p>
              <div className="lg:flex lg:flex-col lg:justify-center">
                {currentPlayer.soloDuoRankImage && (
                  <Image
                    src={currentPlayer.soloDuoRankImage!}
                    alt="Rank"
                    width={128}
                    height={128}
                    className="m-4 size-16 lg:size-24"
                  />
                )}
                <p>{currentPlayer.soloDuoRank}</p>
              </div>
            </div>
            <div className="bg-white h-28 w-[1px] lg:hidden"></div>
            <div className="text-xs sm:text-sm flex flex-col items-center lg:text-base lg:w-full">
              <p className="lg:bg-gray-800 lg:w-full lg:p-4">Flex</p>
              <div className="lg:flex lg:flex-col lg:justify-center">
                {currentPlayer.flexRankImage && (
                  <Image
                    src={currentPlayer.flexRankImage!}
                    alt="Rank"
                    width={128}
                    height={128}
                    className="m-4 size-16 lg:size-24"
                  />
                )}
                <p>{currentPlayer.flexRank}</p>
              </div>
            </div>
          </div>
        </section>
        {/* Champ Image + Game Meta Data Container */}
        <section className="bg-neutral-400 rounded-3xl h-auto w-[100%] lg:h-[40rem] lg:w-4/6 lg:flex lg:flex-col">
          {/* Champ Image */}
          <div className="flex-1 h-24 lg:h-48 p-2">
            <Image
              src={currentPlayer.championImage!}
              alt="Champion"
              width={120}
              height={120}
              className="object-contain size-full rounded-t-3xl"
            />
          </div>
          {/* Game data */}
          <div className="flex-1 flex flex-col text-center text-xs lg:auto">
            {/* Time */}
            <div className="bg-black p-1 sm:text-sm lg:text-base">
              <p>Game Time : {time}</p>
            </div>
            {/* Blue Team Table */}
            <div className="bg-blue-400 p-1 sm:text-sm lg:text-base">
              <p>Blue Team</p>
            </div>
            <table className="flex-1 table-fixed w-full text-[0.6rem] sm:text-sm lg:text-base">
              <thead className="bg-gray-800">
                <tr>
                  <th>Player</th>
                  <th>Champion</th>
                  <th>Avg KDA</th>
                  <th>Avg CS/min</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Populate table */}
                {allyColor === "blue"
                  ? mapTeam(allies, true)
                  : mapTeam(enemies, false)}
              </tbody>
            </table>
            {/* Red Team Table */}
            <div className="bg-red-400 p-1 mt-1 text-xs sm:text-sm lg:text-base">
              <p>Red Team</p>
            </div>
            <table className="flex-1 table-fixed w-full text-[0.6rem] sm:text-sm lg:text-base">
              <thead className="bg-gray-800">
                <tr>
                  <th>Player</th>
                  <th>Champion</th>
                  <th>Avg KDA</th>
                  <th>Avg CS/min</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Populate table */}
                {allyColor === "red"
                  ? mapTeam(allies, true)
                  : mapTeam(enemies, false)}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
};

export default PlayerDisplay;
