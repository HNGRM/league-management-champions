// Predefined Managers Data for League Management: Champions
// Synchronized with managers.json & master_managers_db.md

import {
  TacticalPhilosophy,
  FinancialPhilosophy,
  PlayerManagementPhilosophy,
  LeagueLanguage,
} from "@/types/game";
import { AvatarDna } from "@/types/avatar";
import managersData from "./managers.json";

export type PreferredBattleStyle = "정석방식" | "돌진방식" | "견제방식" | "유동적";
export type InterviewStyle = "도발형" | "원칙주의형" | "겸손형";

export interface PredefinedManager {
  id: string;
  teamName: string;
  nationality: string;
  nicknameEn: string;
  nicknameKo: string;
  age: number;
  reputation: number; // 0 ~ 100
  careerStats: {
    matches: number;
    wins: number;
    losses: number;
    winRate: number; // %
  };
  trophies: {
    leagueTitles: number;
    internationalTitles: number;
  };
  languages: LeagueLanguage[];
  tactics: TacticalPhilosophy;
  finance: FinancialPhilosophy;
  playerManagement: PlayerManagementPhilosophy;
  preferredStyle: PreferredBattleStyle;
  interviewStyle: InterviewStyle;
  isPlayer: boolean;
  avatarDna: AvatarDna;
}

export const PREDEFINED_MANAGERS: PredefinedManager[] = managersData as PredefinedManager[];
export default PREDEFINED_MANAGERS;
