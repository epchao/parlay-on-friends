"use client";
import { ChangeEvent, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DataContext } from "./dashboard-wrapper";
import Toast from "../../components/toast";
import { calculateGameSeconds } from "../api/live-games/calculateGameSeconds";

export default function SubmitBet() {
  const {
    dataLoaded,
    userBets,
    setUserBets,
    playerDetails,
    loadExistingBets,
    clearBet,
    originalBets,
    gameTime,
  } = useContext(DataContext);

  const gameSeconds = calculateGameSeconds(gameTime);
  const gameMaxBettingTime = 300;

  // Get playerId from context (playerDetails[0] is the current player)
  const playerId = playerDetails[0]?.puuid;

  // Calculate multiplier based on number of selections that are not 'NONE'
  const selections = [
    userBets.kills,
    userBets.deaths,
    userBets.cs,
    userBets.assists,
  ].filter((bet) => bet && bet !== "NONE");
  const multipler = selections.length > 0 ? selections.length + 1 : 0;

  const [betAmt, setAmt] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // Connect to db
  const supabase = createClient();

  // Update bet amount when userBets changes (when existing bet is loaded)
  useEffect(() => {
    if (userBets.amount && userBets.amount > 0) {
      setAmt(userBets.amount);
    }
  }, [userBets.amount]);

  // Check if current selections/amount are different from the saved bet
  const hasChanges = () => {
    // Must have at least one selection and a valid amount
    if (multipler === 0 || betAmt <= 0) {
      return false;
    }

    if (!originalBets.amount) {
      // No existing bet, so this would be a new bet
      return true;
    }

    // Compare current state with original saved state
    const selectionsChanged =
      userBets.kills !== originalBets.kills ||
      userBets.deaths !== originalBets.deaths ||
      userBets.cs !== originalBets.cs ||
      userBets.assists !== originalBets.assists;

    const amountChanged = betAmt !== originalBets.amount;

    return selectionsChanged || amountChanged;
  };

  // Check if betting is still allowed (within 5 minutes)
  const isBettingAllowed = () => {
    return gameSeconds < gameMaxBettingTime; // 300 seconds = 5 minutes
  };
  const updateInput = (event: ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (!isNaN(val)) {
      setAmt(val);
    }
  };

  // User presses submit button
  const submitHandler = async () => {
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

    if (betAmt < 1 || multipler < 1) {
      return;
    }

    // Send submit request
    try {
      const response = await fetch("/api/bets/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          player_id: playerId,
          kills: userBets.kills,
          deaths: userBets.deaths,
          cs: userBets.cs,
          assists: userBets.assists,
          amount: betAmt,
        }),
      });

      if (!response.ok) {
        console.error("Bet failed to submit");
        return;
      }

      const data = await response.json();
      console.log("Submitted to DB", data);

      // Set appropriate toast message based on whether it was an update or new bet
      const isUpdate = data.isUpdate;
      setToastMessage(
        isUpdate
          ? "Your bet has been successfuly updated!"
          : "Your bet has been successfully placed!"
      );

      // Reload existing bets to reflect the updated selections
      await loadExistingBets(user.id, playerId);

      setShowToast(true);
    } catch (error) {
      console.error("Unexpected error", error);
    }
  };

  // Handler for clearing the bet
  const clearHandler = async () => {
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

    try {
      await clearBet(user.id, playerId);
      setAmt(0);
      setToastMessage("Your bet has been cleared!");
      setShowToast(true);
    } catch (error) {
      console.error("Failed to clear bet:", error);
    }
  };

  return (
    dataLoaded && (
      <div>
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          type="success"
        >
          {toastMessage}
        </Toast>
        <div className="bg-gray-700 p-6 rounded-2xl max-w-[20rem] sm:max-w-sm shadow-lg space-y-4">
          <div>
            <p className="text-lg text-white font-semibold">
              Current Multiplier:{" "}
              <span className="text-green-400">
                {multipler > 0 ? multipler + "x" : "None"}
              </span>
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
                <span className="text-white">To win:</span> $
                {betAmt && betAmt * multipler}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`font-semibold px-6 py-2 rounded-lg transition-colors flex-1 ${
                  hasChanges() && multipler > 0 && isBettingAllowed()
                    ? "bg-gray-900 hover:bg-green-700 active:bg-green-800 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                onClick={submitHandler}
                disabled={
                  !hasChanges() || multipler === 0 || !isBettingAllowed()
                }
                title={
                  !isBettingAllowed()
                    ? "Betting closed after 5 minutes of game time"
                    : ""
                }
              >
                {!isBettingAllowed()
                  ? "Betting Closed"
                  : userBets.amount
                    ? "Update Entry"
                    : "Place Entry"}
              </button>
              {userBets.amount && isBettingAllowed() && (
                <button
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  onClick={clearHandler}
                  title={
                    !isBettingAllowed()
                      ? "Betting closed after 5 minutes of game time"
                      : ""
                  }
                >
                  Clear Bet
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
