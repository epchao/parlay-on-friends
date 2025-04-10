import { Constants, LolApi, RiotApi } from "twisted";

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export const checkGame = async (puuid: string) => {
  try {
    const details = await lolApi.SpectatorV5.activeGame(
      puuid,
      Constants.Regions.AMERICA_NORTH
    );

    // Check not RANKED
    // 420 = solo duo
    // 440 = flex
    if (
      details.response.gameQueueConfigId !== 420 &&
      details.response.gameQueueConfigId !== 440
    ) {
      console.log("false");
      return false;
    }
  } catch (error: any) {
    // Catch 404 error (player not in a game)
    if (error.status === 404) {
      console.log("false");
      return false;
    }
    // Other errors
    console.error("Error fetching game data");
    console.log("false");
    return false;
  }
  console.log("true");
  return true;
};
