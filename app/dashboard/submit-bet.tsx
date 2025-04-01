"use client";
import { ChangeEvent, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// TODO
// Pass down card bets down to this component
// Update component visually to use dynamic data
// Use actual data for request body

interface SubmitBetProps {
  balance: number;
}

export default function SubmitBet({ balance }: SubmitBetProps) {
  const [betAmt, setAmt] = useState(0);
  const updateInput = (event: ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (!isNaN(val)) {
      setAmt(val);
    }
  };

  // User presses submit button
  const submitHandler = async () => {
    // Connect to db
    const supabase = createClient();

    // Get user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // No user
    if (error || !user) {
      console.error("User not found");
      return;
    }

    // Send submit request
    try {
      const response = await fetch("/api/bets/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Filler data
        body: JSON.stringify({
          user_id: user.id,
          player_id: 1,
          stat: "ASSISTS",
          over: false,
          amount: 100,
          multiplier: 2.5,
        }),
      });
      const data = await response.json();

      if (!data.ok) {
        console.error("Bet failed to submit", data.error);
        return;
      }

      console.log(data);
    } catch (error) {
      console.error("Unexpected error", error);
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-2xl max-w-[20rem] sm:max-w-sm shadow-lg space-y-4">
      <div>
        <p className="text-lg text-white font-semibold">
          Balance: <span className="text-green-400">${balance}</span>
        </p>
      </div>

      <div>
        <p className="text-lg text-white font-semibold">
          Current Multiplier: <span className="text-green-400">2x</span>
        </p>
      </div>

      <div className="text-white space-y-4">
        <div className="flex gap-2 items-center">
          <input
            className="rounded-md px-4 py-2 bg-gray-800 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-1/2"
            type="number"
            placeholder="Entry"
            value={betAmt === 0 ? "" : betAmt}
            onChange={updateInput}
            min="1"
          />

          <div className="bg-gray-800 rounded-md px-4 py-2 text-green-400 font-medium w-1/2">
            <span className="text-white">To win:</span> ${betAmt && betAmt * 2}
          </div>
        </div>

        <div className="flex">
          <button
            className="bg-gray-900 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex-1"
            onClick={submitHandler}
          >
            Place Entry
          </button>
        </div>
      </div>
    </div>
  );
}
