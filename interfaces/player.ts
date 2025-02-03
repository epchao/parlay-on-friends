export interface Player {
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
  avgKda: number;
  avgCs: number;
}
