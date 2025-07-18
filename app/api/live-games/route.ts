import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createDdragon, withWebp } from "@lolmath/ddragon";

const dd = createDdragon(withWebp());

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get("riotId");
  const tag = searchParams.get("tag");

  if (!riotId || !tag) {
    return NextResponse.json(
      { error: "Missing riotId or tag" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    // Get player from cache with weighted averages
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, riot_id, tag, summoner_level, profile_icon_id, rank_data, weighted_avg_kills, weighted_avg_deaths, weighted_avg_assists, weighted_avg_cs')
      .eq('riot_id', riotId)
      .eq('tag', tag)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found in system. Please add them first.' }, { status: 404 });
    }

    // Use stored weighted averages (calculated during registration)
    const averages = {
      kills: player.weighted_avg_kills || 0,
      deaths: player.weighted_avg_deaths || 0,
      assists: player.weighted_avg_assists || 0,
      cs: player.weighted_avg_cs || 0
    };

    // Check for active game and get stored game data
    const { data: liveGame, error: liveGameError } = await supabase
      .from('live_games')
      .select('*')
      .eq('player_id', player.id)
      .eq('status', 'in_progress')
      .single();

    if (liveGameError || !liveGame) {
      return NextResponse.json({ error: 'Player not currently in game' }, { status: 404 });
    }

    // Check if it's a ranked game (420 = Solo/Duo, 440 = Flex)
    if (liveGame.game_data?.gameQueueConfigId && 
        ![420, 440].includes(liveGame.game_data.gameQueueConfigId)) {
      return NextResponse.json({
        error: "Player not currently playing a ranked match",
      }, { status: 400 });
    }

    // If we have stored game_data, use it. Otherwise fallback to basic data
    if (liveGame.game_data) {
      const gameData = liveGame.game_data;
      
      return NextResponse.json({
        currentPlayer: gameData.currentPlayer,
        currentPlayerAverages: averages,
        gameTime: liveGame.game_start_time,
        allies: gameData.allies || [],
        enemies: gameData.enemies || [],
        allyColor: gameData.allyColor || 'blue',
        enemyColor: (gameData.allyColor || 'blue') === 'blue' ? 'red' : 'blue',
        inGame: true,
        liveGameId: liveGame.id
      });
    } else {
      // Fallback to basic data structure compatible with player-display
      // Use actual player data from the database when available
      const rankData = player.rank_data || [];
      const soloRank = Array.isArray(rankData) ? rankData.find(r => r.queueType === 'RANKED_SOLO_5x5') : null;
      const flexRank = Array.isArray(rankData) ? rankData.find(r => r.queueType === 'RANKED_FLEX_SR') : null;

      return NextResponse.json({
        currentPlayer: {
          puuid: player.id,
          name: player.riot_id,
          tag: player.tag,
          level: player.summoner_level || 30,
          icon: player.profile_icon_id ? 
            dd.images.profileicon(player.profile_icon_id.toString()) + '.webp' :
            dd.images.profileicon("29") + '.webp',
          champion: '',
          championImage: '',
          soloDuoRank: soloRank ? `${soloRank.tier} ${soloRank.rank}` : 'Unranked',
          flexRank: flexRank ? `${flexRank.tier} ${flexRank.rank}` : 'Unranked',
          soloDuoRankImage: soloRank ? 
            `https://opgg-static.akamaized.net/images/medals_new/${soloRank.tier.toLowerCase()}.png` : 
            'https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png',
          flexRankImage: flexRank ? 
            `https://opgg-static.akamaized.net/images/medals_new/${flexRank.tier.toLowerCase()}.png` : 
            'https://static.wikia.nocookie.net/leagueoflegends/images/1/13/Season_2023_-_Unranked.png'
        },
        currentPlayerAverages: averages,
        gameTime: liveGame.game_start_time,
        allies: [],
        enemies: [],
        allyColor: 'blue',
        enemyColor: 'red',
        inGame: true,
        liveGameId: liveGame.id
      });
    }

  } catch (error) {
    console.error('Error fetching cached game info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
