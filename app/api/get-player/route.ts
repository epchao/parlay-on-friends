import { NextResponse } from 'next/server';
import { RiotApi, LolApi, Constants } from 'twisted';
import { Player } from '../../../interfaces/player';

const riotApi = new RiotApi({ key: process.env.RIOT_KEY_SECRET });
const lolApi = new LolApi({ key: process.env.RIOT_KEY_SECRET });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get("riotId");
  const tag = searchParams.get("tag");

  if (!riotId || !tag) {
    return NextResponse.json({ error: 'Missing riotId or tag' }, { status: 400 });
  }

  try {
    const account = await riotApi.Account.getByRiotId(riotId as string, tag as string, Constants.RegionGroups.AMERICAS);
    if (!account.response.puuid) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    const summoner = await lolApi.Summoner.getByPUUID(account.response.puuid, Constants.Regions.AMERICA_NORTH);
    const rankedData = await lolApi.League.bySummoner(summoner.response.id, Constants.Regions.AMERICA_NORTH);

    let soloDuoRank = 'Unranked';
    let soloDuoRankImage = '';
    let flexRank = 'Unranked';
    let flexRankImage = '';

    rankedData.response.forEach((queue) => {
      if (queue.queueType === 'RANKED_SOLO_5x5') {
        soloDuoRank = `${queue.tier} ${queue.rank}`;
        soloDuoRankImage = `https://opgg-static.akamaized.net/images/medals_new/${queue.tier.toLowerCase()}.png`;
      } else if (queue.queueType === 'RANKED_FLEX_SR') {
        flexRank = `${queue.tier} ${queue.rank}`;
        flexRankImage = `https://opgg-static.akamaized.net/images/medals_new/${queue.tier.toLowerCase()}.png`;
      }
    });

    // @TODO: Replace champion, championImage with current game information.
    // @TODO: Replace avgKDA, avgCS with Match History averages or from database.
    const playerData: Player = {
      name: riotId as string,
      tag: tag as string,
      icon: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.response.profileIconId}.png`,
      level: summoner.response.summonerLevel,
      soloDuoRank,
      soloDuoRankImage,
      flexRank,
      flexRankImage,
      champion: 'Lee Sin',
      championImage: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png',
      avgKda: 3.5, // Placeholder
      avgCs: 200, // Placeholder
    };

    return NextResponse.json(playerData);
  } catch (error) {
    console.error("Error fetching player data:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
