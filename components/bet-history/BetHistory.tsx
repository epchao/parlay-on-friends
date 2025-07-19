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
  return (
    <div className="fixed z-50 bottom-12 right-12 bg-slate-700 p-2 rounded-full">
      <BetPopup open={isOpen} onClose={() => setIsOpen(false)} />
      <CircleDollarSign
        className="hover:cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
        size={36}
      />
    </div>
  );
}

// Table popup
function BetPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [bets, setBets] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;

    const getBetData = async () => {
      const response = await fetch("/api/bets");
      const data = await response.json();
      setBets(data.bets);
    };

    getBetData();
  }, [open]);

  if (!open || bets === null) return null;

  return (
    <div onClick={onClose} className="fixed inset-0">
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-28 right-12 bg-slate-700 p-4 max-h-[70vh] w-[90vw] max-w-5xl rounded-xl"
      >
        <h2 className="text-lg font-bold mb-2">Your Bets</h2>

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
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
                <tr key={bet.id}>
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
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
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
                        ? bet.procecsed_amount_won
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
      </div>
    </div>
  );
}
