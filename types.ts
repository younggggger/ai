
export type Language = 'en' | 'zh';

export type LocalizedString = {
  en: string;
  zh: string;
};

export interface GameStats {
  cash: number;       // In thousands (k)
  team: number;       // 0-100 scale
  product: number;    // 0-100 scale
  traction: number;   // 0-100 scale
  stress: number;     // 0-100 scale (High is bad)
}

export interface FounderStats {
  tech: number;       // Coding/Engineering ability (0-10)
  vision: number;     // Product sense (0-10)
  charisma: number;   // Sales/Fundraising (0-10)
}

export interface Trait {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  effect?: Partial<GameStats>;
}

export interface FounderProfile {
  id: string; // mbti
  mbti: string;
  name: LocalizedString;
  description: LocalizedString;
  pros: LocalizedString; // Green text
  cons: LocalizedString; // Red text
  stats: FounderStats; // Base stats
  assignedBuff?: Trait;
  assignedDebuff?: Trait;
}

export interface AIChoice {
  id: string;
  text: string;
  description?: string;
  type?: 'safe' | 'risky' | 'wild';
}

export interface TurnData {
  month: number;
  title: string;
  description: string;
  statsChange?: Partial<GameStats>; // Change from previous turn
  outcomeText?: string; // What happened based on previous choice
  choices: AIChoice[];
  isGameOver: boolean;
  endingType?: 'bankruptcy' | 'burnout' | 'unicorn' | 'acquisition' | 'mediocrity';
}

export enum GameStatus {
  START,
  CHARACTER_CREATE,
  IDEA_PHASE,
  PLAYING,
  GAME_OVER
}

export interface Ending {
  title: string;
  description: string;
  color: string;
}
