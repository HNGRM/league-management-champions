import { create } from "zustand";
import {
  SaveSlot,
  Team,
  ManagerProfile,
  PredefinedTeam,
  LeagueLanguage,
  CustomTeamInfo,
  DivisionTier,
  LeagueDivisions,
} from "@/types/game";
import { Player } from "@/types/player";
import { Coach, CoachRole } from "@/types/coach";
import { MailItem, INITIAL_MAILS } from "@/data/dummyMails";
import { createDefaultAvatarDna } from "@/types/avatar";
import { swapPlayers, swapCoaches, assignCoachRole } from "@/utils/rosterSwap";
import { autoAssignPlayerRoles } from "@/utils/playerAssignment";
import { autoAssignCoachRoles } from "@/utils/coachAssignment";
import { processWeeklyTraining } from "@/utils/trainingCalculator";

export type GameScreen = "TITLE" | "SLOT_SELECT" | "MANAGER_CREATE" | "TEAM_CREATE" | "DASHBOARD";

interface GameState {
  currentScreen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  setSlots: (slots: SaveSlot[]) => void;

  // 팀 슬롯 관리 (총 8개 슬롯)
  slots: SaveSlot[];
  selectedSlotId: number | null;
  setSelectedSlotId: (id: number | null) => void;

  // 선택된 리그 (리그 선택 단계)
  selectedLeague: LeagueLanguage | null;
  setSelectedLeague: (league: LeagueLanguage | null) => void;

  // 선택된 팀 (팀 선택 단계)
  selectedTeam: PredefinedTeam | null;
  setSelectedTeam: (team: PredefinedTeam | null) => void;

  // 사용자 커스텀 팀 정보 (한글 팀명 12자, 영문 팀명 20자, 영문 약칭 3자, 커스텀 로고)
  customTeamInfo: CustomTeamInfo;
  setCustomTeamInfo: (info: Partial<CustomTeamInfo>) => void;

  // 감독 프로필 생성 데이터 (초기 미선택 상태)
  managerProfile: ManagerProfile;
  setManagerProfile: (profile: Partial<ManagerProfile>) => void;
  resetCreationState: () => void;

  // 활성화된 팀
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;

  // 나의 팀 선수단 (기본 팀 선수 데이터와 별개로 영입/방출/교체 등을 자유롭게 수행하는 독립 저장 공간)
  myPlayers: Player[];
  setMyPlayers: (players: Player[]) => void;
  updateMyPlayer: (playerId: string, updater: Partial<Player> | ((prev: Player) => Player)) => void;
  swapMyPlayers: (playerIdA: string, playerIdB: string) => void;
  autoAssignMyPlayers: () => void;

  // 나의 팀 코치진 (기본 팀 코치 데이터와 별개로 독립 저장 공간)
  myCoaches: Coach[];
  setMyCoaches: (coaches: Coach[]) => void;
  updateMyCoach: (coachId: string, updater: Partial<Coach> | ((prev: Coach) => Coach)) => void;
  swapMyCoaches: (coachIdA: string, coachIdB: string) => void;
  assignMyCoachRole: (coachId: string, role: CoachRole) => void;
  autoAssignMyCoaches: () => void;

  // 디비전(A/B/C/D) 및 리그 순위 시스템
  leagueDivisions: LeagueDivisions | null;
  setLeagueDivisions: (divisions: LeagueDivisions | null) => void;
  currentDivision: DivisionTier;
  setCurrentDivision: (division: DivisionTier) => void;

  // 메일함 시스템
  mails: MailItem[];
  setMails: (mails: MailItem[]) => void;
  markMailAsRead: (mailId: string) => void;
  markAllMailsAsRead: () => void;
  updateMailAction: (mailId: string, state: "ACCEPTED" | "REJECTED" | "COMPLETED") => void;

  // 날짜 및 턴 진행
  currentYear: number;
  currentWeek: number;
  advanceTurn: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScreen: "TITLE",
  setScreen: (screen) => set({ currentScreen: screen }),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setSlots: (slots) => set({ slots }),

  slots: Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    isCreated: false,
    isLocked: index !== 0,
  })),
  selectedSlotId: null,
  setSelectedSlotId: (id) => set({ selectedSlotId: id }),

  // 선택된 리그 초기값 (리그 변경 시 선택된 팀 및 커스텀 팀 정보 초기화)
  selectedLeague: null,
  setSelectedLeague: (league) =>
    set((state) => {
      if (state.selectedLeague !== league) {
        return {
          selectedLeague: league,
          selectedTeam: null,
          customTeamInfo: {
            nameKo: "",
            nameEn: "",
            shortName: "",
            customLogoUrl: null,
          },
        };
      }
      return { selectedLeague: league };
    }),

  // 선택된 팀 초기값 및 커스텀 팀명 자동 초기화
  selectedTeam: null,
  setSelectedTeam: (team) =>
    set({
      selectedTeam: team,
      customTeamInfo: team
        ? {
            nameKo: team.nameKo,
            nameEn: team.nameEn,
            shortName: team.shortName,
            customLogoUrl: null,
          }
        : {
            nameKo: "",
            nameEn: "",
            shortName: "",
            customLogoUrl: null,
          },
    }),

  // 커스텀 팀 정보 (한글 12자, 영문 20자, 약칭 3자, 커스텀 로고)
  customTeamInfo: {
    nameKo: "",
    nameEn: "",
    shortName: "",
    customLogoUrl: null,
  },
  setCustomTeamInfo: (info) =>
    set((state) => ({
      customTeamInfo: { ...state.customTeamInfo, ...info },
    })),

  // 플레이어 감독 기본 프로필 (디폴트 커스텀 아바타 탑재)
  managerProfile: {
    name: "",
    nameKo: "",
    nameEn: "",
    portrait: "",
    faceDna: createDefaultAvatarDna(),
    age: 32,
    tactics: null,
    finance: null,
    playerManagement: null,
    languages: [],
  },
  setManagerProfile: (profile) =>
    set((state) => ({
      managerProfile: { ...state.managerProfile, ...profile },
    })),
  resetCreationState: () =>
    set({
      selectedLeague: null,
      selectedTeam: null,
      customTeamInfo: {
        nameKo: "",
        nameEn: "",
        shortName: "",
        customLogoUrl: null,
      },
      managerProfile: {
        name: "",
        nameKo: "",
        nameEn: "",
        portrait: "",
        faceDna: createDefaultAvatarDna(),
        tactics: null,
        finance: null,
        playerManagement: null,
        languages: [],
      },
      myPlayers: [],
      myCoaches: [],
      leagueDivisions: null,
      currentDivision: "D",
    }),

  currentTeam: null,
  setCurrentTeam: (team) => set({ currentTeam: team }),

  // 나의 팀 선수단 초기값 및 액션
  myPlayers: [],
  setMyPlayers: (players) => set({ myPlayers: players }),
  updateMyPlayer: (playerId, updater) =>
    set((state) => ({
      myPlayers: state.myPlayers.map((p) => {
        if (p.profile.playerId !== playerId) return p;
        if (typeof updater === "function") {
          return updater(p);
        }
        return { ...p, ...updater };
      }),
    })),
  swapMyPlayers: (playerIdA, playerIdB) =>
    set((state) => ({
      myPlayers: swapPlayers(state.myPlayers, playerIdA, playerIdB),
    })),
  autoAssignMyPlayers: () =>
    set((state) => ({
      myPlayers: autoAssignPlayerRoles(state.myPlayers),
    })),

  // 나의 팀 코치진 초기값 및 액션
  myCoaches: [],
  setMyCoaches: (coaches) => set({ myCoaches: coaches }),
  updateMyCoach: (coachId, updater) =>
    set((state) => ({
      myCoaches: state.myCoaches.map((c) => {
        if (c.profile.coachId !== coachId) return c;
        if (typeof updater === "function") {
          return updater(c);
        }
        return { ...c, ...updater };
      }),
    })),
  swapMyCoaches: (coachIdA, coachIdB) =>
    set((state) => ({
      myCoaches: swapCoaches(state.myCoaches, coachIdA, coachIdB),
    })),
  assignMyCoachRole: (coachId, role) =>
    set((state) => ({
      myCoaches: assignCoachRole(state.myCoaches, coachId, role),
    })),
  autoAssignMyCoaches: () =>
    set((state) => ({
      myCoaches: autoAssignCoachRoles(state.myCoaches),
    })),

  // 디비전 및 순위 데이터
  leagueDivisions: null,
  setLeagueDivisions: (divisions) => set({ leagueDivisions: divisions }),
  currentDivision: "D",
  setCurrentDivision: (division) => set({ currentDivision: division }),

  // 메일함 초기 데이터 및 액션
  mails: INITIAL_MAILS,
  setMails: (mails) => set({ mails }),
  markMailAsRead: (mailId) =>
    set((state) => ({
      mails: state.mails.map((m) =>
        m.id === mailId ? { ...m, isRead: true } : m
      ),
    })),
  markAllMailsAsRead: () =>
    set((state) => ({
      mails: state.mails.map((m) => ({ ...m, isRead: true })),
    })),
  updateMailAction: (mailId, actionState) =>
    set((state) => ({
      mails: state.mails.map((m) =>
        m.id === mailId ? { ...m, isRead: true, actionState } : m
      ),
    })),

  currentYear: 2026,
  currentWeek: 1,
  advanceTurn: () =>
    set((state) => {
      const updatedPlayers = processWeeklyTraining(
        state.myPlayers,
        state.myCoaches,
        1
      );
      return {
        currentWeek: state.currentWeek + 1,
        myPlayers: updatedPlayers,
      };
    }),
}));
