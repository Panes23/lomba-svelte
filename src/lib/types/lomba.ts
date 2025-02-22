export interface Lomba {
  id: string;
  market_id: string;
  tanggal: string;
  prize_pool: number;
  result: number | null;
  guess_type: string;
  max_winner: number;
  created_at: string;
  updated_at: string;
  markets: {
    name: string;
    buka: string;
    tutup: string;
    image: string;
  }[]
} 