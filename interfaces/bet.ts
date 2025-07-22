export interface Bet {
  playerName: string;
  type: string;
  stat: string;
  playerImage: string;
}

export interface BetSubmission {
  user_id: string;
  player_id: string;
  live_game_id?: string;
  amount: number;
  kills: 'MORE' | 'LESS' | 'NONE';
  deaths: 'MORE' | 'LESS' | 'NONE';
  cs: 'MORE' | 'LESS' | 'NONE';
  assists: 'MORE' | 'LESS' | 'NONE';
  multiplier: number;
  potential_winnings: number;
}
