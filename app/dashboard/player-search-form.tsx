"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PlayerSearchForm() {
  const [playerName, setPlayerName] = useState("");
  const [playerTag, setPlayerTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim() || !playerTag.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Navigate to the player-specific dashboard with URL-encoded names
    const encodedName = encodeURIComponent(playerName.trim());
    const encodedTag = encodeURIComponent(playerTag.trim());
    const playerSlug = `${encodedName}-${encodedTag}`;
    router.push(`/dashboard/player/${playerSlug}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="playerName" className="text-sm font-medium">
            Player Name
          </Label>
          <Input
            id="playerName"
            type="text"
            placeholder="Enter player name (e.g. meimei)"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="playerTag" className="text-sm font-medium">
            Player Tag
          </Label>
          <Input
            id="playerTag"
            type="text"
            placeholder="Enter tag (e.g. tea)"
            value={playerTag}
            onChange={(e) => setPlayerTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!playerName.trim() || !playerTag.trim() || isLoading}
        >
          {isLoading ? "Loading..." : "GO"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter a League of Legends player name and tag to track their games and place bets
        </p>
      </div>
    </div>
  );
}
