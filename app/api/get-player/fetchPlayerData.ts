import { RiotApi, LolApi, Constants } from "twisted";
import { CurrentGameParticipantDTO } from "twisted/dist/models-dto";
import { Player } from "../../../interfaces/player";
import { fetchChampion } from "./fetchChampion";
import { createClient } from "@/utils/supabase/server";

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function fetchPlayerData(riotId: string, tag: string) {
  try {
    const account = await riotApi.Account.getByRiotId(
      riotId as string,
      tag as string,
      Constants.RegionGroups.AMERICAS
    );

    if (!account.response.puuid) {
      return { error: "Player not found", status: 404 };
    }

    // Get account ID and game info
    const PUUID = account.response.puuid;
    const summoner = await lolApi.Summoner.getByPUUID(
      PUUID,
      Constants.Regions.AMERICA_NORTH
    );
    const game = await lolApi.SpectatorV5.activeGame(
      PUUID,
      Constants.Regions.AMERICA_NORTH
    );

    // Players in the game
    const participants = game.response
      .participants as CurrentGameParticipantDTO[];

    // Get current player from game
    const player = participants.find(
      (participant) => participant.puuid === PUUID
    );

    // Get champion info
    const championID = player?.championId;
    const championData = await fetchChampion(championID);

    let championName = "Unknown";
    let championImageName = "Lee Sin";

    if (championData) {
      championName = championData.championName;
      championImageName = championData.championImageName;
    }

    // Get ranked info
    const accountID = summoner.response.id;
    const rankedData = await lolApi.League.bySummoner(
      accountID,
      Constants.Regions.AMERICA_NORTH
    );

    let soloDuoRank = "Unranked";
    let soloDuoRankImage = "";
    let flexRank = "Unranked";
    let flexRankImage = "";

    rankedData.response.forEach((queue) => {
      if (queue.queueType === "RANKED_SOLO_5x5") {
        soloDuoRank = `${queue.tier} ${queue.rank}`;
        soloDuoRankImage = `https://opgg-static.akamaized.net/images/medals_new/${queue.tier.toLowerCase()}.png`;
      } else if (queue.queueType === "RANKED_FLEX_SR") {
        flexRank = `${queue.tier} ${queue.rank}`;
        flexRankImage = `https://opgg-static.akamaized.net/images/medals_new/${queue.tier.toLowerCase()}.png`;
      }
    });

    if (soloDuoRankImage === "")
      soloDuoRankImage =
        "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png/revision/latest?cb=20231007211937";
    if (flexRankImage === "")
      flexRankImage =
        "https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png/revision/latest?cb=20231007211937";

    // @TODO: Replace avgKDA, avgCS with Match History averages or from database.
    const playerData: Player = {
      puuid: PUUID,
      name: riotId as string,
      tag: tag as string,
      icon: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/profileicon/${summoner.response.profileIconId}.png`,
      level: summoner.response.summonerLevel,
      soloDuoRank,
      soloDuoRankImage,
      flexRank,
      flexRankImage,
      champion: championName,
      championImage: `https://ddragon.leagueoflegends.com/cdn/15.7.1/img/champion/${championImageName}.png`,
      avgKda: 3.5, // Placeholder
      avgCs: 200, // Placeholder
    };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", PUUID);

    if (error) {
      return Response.json({ error: "Failed to add player" }, { status: 500 });
    }

    if (data?.length === 0) {
      await supabase
        .from("players")
        .insert({ id: PUUID, riot_id: riotId, tag });
    }

    return playerData;
  } catch (error) {
    console.error("Error fetching player data:", error);
    return { error: "Internal Server Error", status: 500 };
  }
}
