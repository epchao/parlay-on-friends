import React from "react";
import BetCard from "./bet-card";
import { MockBetData } from "./mock-bet-data";

type Props = {};

const BetCards = (props: Props) => {
  // TODO: update with real data with useContext
  return (
    <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
      {MockBetData.map((e, i) => (
        <BetCard
          key={i}
          playerName={e.playerName}
          stat={e.stat}
          type={e.type}
          playerImage={e.playerImage}
        />
      ))}
    </div>
  );
};

export default BetCards;
