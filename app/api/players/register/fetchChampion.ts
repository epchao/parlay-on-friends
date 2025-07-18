import { createDdragon } from "@lolmath/ddragon";

// Cache for champion data to avoid repeated API calls
let championCache: {
  [key: string]: { championName: string; championImageName: string };
} = {};
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Pre-warm the cache with all champion data
export async function preloadChampionData(): Promise<void> {
  const now = Date.now();

  // Only preload if cache is empty or expired
  if (
    Object.keys(championCache).length === 0 ||
    now - cacheTimestamp >= CACHE_DURATION
  ) {
    try {
      // Fetch the latest version directly from Riot's API
      const versionsResponse = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json"
      );
      const versions = await versionsResponse.json();
      const latestVersion = versions[0]; // First element is the latest version

      const dd = createDdragon({ version: latestVersion });
      const response = await fetch(dd.data.champions());
      const data = await response.json();
      const champions = data.data;

      // Rebuild the entire cache
      championCache = {};
      for (const champion in champions) {
        const champData = champions[champion];
        championCache[champData.key] = {
          championName: champData.name,
          championImageName: champData.id,
        };
      }
      cacheTimestamp = now;
      console.log(
        `Champion cache preloaded with ${Object.keys(championCache).length} champions`
      );
    } catch (error) {
      console.error("Error preloading champion data:", error);
    }
  }
}

export async function fetchChampion(
  championId: number | undefined
): Promise<{ championName: string; championImageName: string } | undefined> {
  if (!championId) return undefined;

  const championKey = championId.toString();
  const now = Date.now();

  // Check if we have cached data and it's still fresh
  if (championCache[championKey] && now - cacheTimestamp < CACHE_DURATION) {
    return championCache[championKey];
  }

  // If cache is empty or expired, fetch fresh data
  if (
    Object.keys(championCache).length === 0 ||
    now - cacheTimestamp >= CACHE_DURATION
  ) {
    await preloadChampionData();
  }

  return championCache[championKey];
}
