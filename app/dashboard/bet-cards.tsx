"use client";
import React, { useContext } from "react";
import { DataContext } from "./dashboard-wrapper";
import BetCard from "./bet-card";
import { MockBetData } from "./mock-bet-data";
import { Player } from "@/interfaces/player";

type Props = {};

const BetCards = (props: Props) => {
  const { playerDetails } = useContext(DataContext);
  const currentPlayer: Player = playerDetails[0] as Player;
  const averages: Record<string, number> = playerDetails[1] as Record<
    string,
    number
  >;

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {Object.entries(averages).map(([type, stat], i) => (
          <BetCard
            key={i}
            playerName={currentPlayer.name}
            stat={`${stat.toFixed(0)}`}
            type={
              type === "cs"
                ? "CS"
                : type.charAt(0).toUpperCase() + type.slice(1)
            }
            playerImage={currentPlayer.icon!}
          />
        ))}
      </div>
    </div>
  );
};

export default BetCards;
