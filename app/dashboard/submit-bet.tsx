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

  const submitHandler = async () => {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("User not allowed to place bet");
      return;
    }

    const submission = await fetch("/api/bets/submit", {
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
    const response = await submission.json();
    console.log(response);
  };

  return (
    <div className="bg-emerald-900 p-[1.5rem] rounded-lg max-w-[375px]">
      <div>
        <p>Balance: ${balance}</p>
      </div>
      <div className="text-black">
        <div className="flex gap-[.5rem]">
          <input
            className="rounded-md pl-[1rem]"
            type="text"
            placeholder="Enter Amount"
            value={betAmt === 0 ? "" : betAmt}
            onChange={updateInput}
            min="1"
          />
          <div className="bg-emerald-600 w-[2rem] flex justify-center items-center rounded-md">
            <p>2x</p>
          </div>
          <div className="bg-green-500 max-w-[80px] h-[50px] p-1 rounded-md">
            <p className="truncate">
              <span className="truncate block overflow-hidden whitespace-nowrap">
                ${betAmt && betAmt * 2}
              </span>{" "}
              Dollas 🤑
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-[.5rem]">
          <button
            className="bg-green-500 hover:bg-green-600 active:bg-green-700 p-1 px-[2.5rem] rounded-md"
            onClick={submitHandler}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
