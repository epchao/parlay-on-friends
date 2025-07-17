export interface Player {
  puuid: string;
  name: string;
  tag: string;
  icon?: string;
  level: number;
  soloDuoRank: string;
  soloDuoRankImage?: string;
  flexRank: string;
  flexRankImage?: string;
  champion: string;
  championImage?: string;
  avgKills?: number;
  avgDeaths?: number;
  avgAssists?: number;
  avgCs?: number;
}
