"use client";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleDollarSign,
  Hourglass,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// Main Component
export default function BetHistory() {
  return (
    <div className="relative h-full">
      <ActionButton />
    </div>
  );
}

// Helper Components

// Button to open table
function ActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [newBetCount, setNewBetCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("bets-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bets" },
        () => setNewBetCount((prev) => prev + 1)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bets" },
        (payload) => {
          const wasUnprocessed = payload.old.processed_at === null;
          const isNowProcessed = payload.new.processed_at !== null;
          if (wasUnprocessed && isNowProcessed) {
            setNewBetCount((prev) => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "bets" },
        () => setNewBetCount((prev) => (prev > 0 ? prev - 1 : 0)) // Never go below 0
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed z-30 bottom-6 right-6 sm:bottom-12 sm:right-12 bg-slate-700 p-2 rounded-full">
      <BetPopup open={isOpen} onClose={() => setIsOpen(false)} />
      <div className="relative">
        <CircleDollarSign
          className="hover:cursor-pointer"
          onClick={() => {
            setIsOpen((prev) => {
              if (!prev) setNewBetCount(0);
              return !prev;
            });
          }}
          size={36}
        />
        {newBetCount > 0 && (
          <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {newBetCount}
          </div>
        )}
      </div>
    </div>
  );
}

// Table popup
function BetPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const getBetData = async () => {
      const response = await fetch("/api/bets");
      const data = await response.json();
      setBets(data.bets);
      setLoading(false);
    };

    getBetData();

    const channel = supabase
      .channel("bets-popup-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets" },
        getBetData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open]);

  if (!open || bets === null) return null;

  function getStatColor(selection: string, final: number, average: number) {
    console.log(selection, average, final);
    if (final == null || average == null || selection === "NONE")
      return "text-yellow-400"; // In progress

    const won =
      (selection === "MORE" && final > average) ||
      (selection === "LESS" && final < average);

    return won ? "text-green-400" : "text-red-400";
  }

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-20 right-8 sm:bottom-28 sm:right-14 bg-slate-700 p-4 rounded-xl"
      >
        <h2 className="text-lg font-bold mb-2">Your Bets</h2>
        {loading ? (
          <p>Loading bets</p>
        ) : bets.length === 0 ? (
          <p>You haven't made any bets yet!</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">ID</th>
                  <th className="border px-2 py-1">Placed At</th>
                  <th className="border px-2 py-1">Player</th>
                  <th className="border px-2 py-1">Bet Amount</th>
                  <th className="border px-2 py-1">Win Potential</th>
                  <th className="border px-2 py-1">Kills</th>
                  <th className="border px-2 py-1">Deaths</th>
                  <th className="border px-2 py-1">Assists</th>
                  <th className="border px-2 py-1">CS</th>
                  <th className="border px-2 py-1">Winnings</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id} className="text-center">
                    <td className="px-4 py-2">{bet.live_game_id}</td>
                    <td className="px-4 py-2">
                      {new Date(bet.created_at + "Z").toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {bet.processed_at ? (
                        `${bet.player.riot_id}#${bet.player.tag}`
                      ) : (
                        <Link
                          className="text-blue-500"
                          href={`/dashboard/player/${bet.player.riot_id}-${bet.player.tag}`}
                        >
                          {bet.player.riot_id}#{bet.player.tag}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-2">{bet.amount}</td>
                    <td className="px-4 py-2">{bet.potential_winnings}</td>
                    <td
                      className={`px-4 py-2 ${getStatColor(bet.kills, bet.live_game.final_kills, bet.player.weighted_avg_kills)}`}
                    >
                      {bet.kills !== "NONE" ? (
                        bet.kills === "MORE" ? (
                          <ArrowUp />
                        ) : (
                          <ArrowDown />
                        )
                      ) : (
                        <Minus />
                      )}
                    </td>
                    <td
                      className={`px-4 py-2 ${getStatColor(bet.deaths, bet.live_game.final_deaths, bet.player.weighted_avg_deaths)}`}
                    >
                      {bet.deaths !== "NONE" ? (
                        bet.deaths === "MORE" ? (
                          <ArrowUp />
                        ) : (
                          <ArrowDown />
                        )
                      ) : (
                        <Minus />
                      )}
                    </td>
                    <td
                      className={`px-4 py-2 ${getStatColor(bet.assists, bet.live_game.final_assists, bet.player.weighted_avg_assists)}`}
                    >
                      {bet.assists !== "NONE" ? (
                        bet.assists === "MORE" ? (
                          <ArrowUp />
                        ) : (
                          <ArrowDown />
                        )
                      ) : (
                        <Minus />
                      )}
                    </td>
                    <td
                      className={`px-4 py-2 ${getStatColor(bet.cs, bet.live_game.final_cs, bet.player.weighted_avg_cs)}`}
                    >
                      {bet.cs !== "NONE" ? (
                        bet.cs === "MORE" ? (
                          <ArrowUp />
                        ) : (
                          <ArrowDown />
                        )
                      ) : (
                        <Minus />
                      )}
                    </td>
                    <td>
                      {bet.processed_amount_won
                        ? bet.processed_amount_won > 0
                          ? bet.processed_amount_won
                          : 0
                        : "In Progress"}
                    </td>
                    <td className="px-4 py-2">
                      {bet.processed_at ? <Check /> : <Hourglass />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
