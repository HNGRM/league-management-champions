"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Globe,
  Shield,
  Coins,
  Users,
  HelpCircle,
  RotateCcw,
  Plus,
  Dices,
  Palette,
  ThumbsUp,
  X,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { saveGameToCloud } from "@/lib/saveManager";
import {
  TacticalPhilosophy,
  FinancialPhilosophy,
  PlayerManagementPhilosophy,
  LeagueLanguage,
} from "@/types/game";
import { PREDEFINED_MANAGERS } from "@/data/managers";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import AvatarCustomizer from "@/components/avatar/AvatarCustomizer";
import {
  AvatarDna,
  createDefaultAvatarDna,
  createRandomAvatarDna,
} from "@/types/avatar";
import { getPlayersByTeamId } from "@/data/players";
import { getCoachesByTeamId } from "@/data/coaches";
import { createInitialLeagueDivisions } from "@/data/divisions";
import { initializePlayers } from "@/utils/playerGenerator";
import { initializeCoaches } from "@/utils/contractEconomics";
import { autoAssignPlayerRoles } from "@/utils/playerAssignment";
import { autoAssignCoachRoles } from "@/utils/coachAssignment";
import { Player } from "@/types/player";
import { Coach } from "@/types/coach";

// 언어 상세 설명 메타데이터
interface LanguageInfo {
  code: LeagueLanguage;
  name: string;
  fullName: string;
  koreanName: string;
  region: string;
  description: string;
}

const LEAGUE_LANGUAGES: LanguageInfo[] = [
  {
    code: "KCL",
    name: "KCL 언어",
    fullName: "Language of Korea Champions League",
    koreanName: "한국 챔피언스 리그 언어",
    region: "대한민국",
    description:
      "한국 챔피언스 리그(Korea Champions League)의 선수들이 주로 사용하는 공식 언어입니다. 정교한 라인전과 한타 중심의 디테일한 오더 교환이 가능하며, KCL 출신 에이스들과 완벽한 팀워크를 맞출 수 있습니다.",
  },
  {
    code: "CCL",
    name: "CCL 언어",
    fullName: "Language of China Champions League",
    koreanName: "중국 챔피언스 리그 언어",
    region: "중국",
    description:
      "중국 챔피언스 리그(China Champions League)의 선수들이 주로 사용하는 공식 언어입니다. 호전적인 교전 지향적 플레이와 빠른 합류전을 선호하는 CCL 출신 선수들과 긴밀하고 박진감 넘치는 소통이 가능합니다.",
  },
  {
    code: "ECL",
    name: "ECL 언어",
    fullName: "Language of EMEA Champions League",
    koreanName: "유럽-중동-아프리카 챔피언스 리그 언어",
    region: "유럽 / 중동 / 아프리카",
    description:
      "유럽-중동-아프리카 챔피언스 리그(EMEA Champions League)의 선수들이 주로 사용하는 공식 언어입니다. 창의적인 밴픽과 다국적 로스터 구성에 최적화되어 있으며 글로벌 메타 변화에 유연하게 대응합니다.",
  },
  {
    code: "ACL",
    name: "ACL 언어",
    fullName: "Language of America Champions League",
    koreanName: "아메리카 챔피언스 리그 언어",
    region: "북미 / 남미",
    description:
      "아메리카 챔피언스 리그(America Champions League)의 선수들이 주로 사용하는 공식 언어입니다. 활발한 의사소통과 자유로운 피드백 문화를 바탕으로 선수단의 멘탈 케어 및 안정적인 팀 분위기 형성에 유리합니다.",
  },
  {
    code: "PCL",
    name: "PCL 언어",
    fullName: "Language of Pacific Champions League",
    koreanName: "태평양 챔피언스 리그 언어",
    region: "대만·동남아·일본·오세아니아",
    description:
      "태평양 챔피언스 리그(Pacific Champions League)의 선수들이 주로 사용하는 공식 언어입니다. 아시아-태평양 전역의 숨겨진 유망주들을 발굴하고 육성하는 데 강력한 시너지를 발휘합니다.",
  },
];

export default function ManagerCreateScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const managerProfile = useGameStore((state) => state.managerProfile);
  const setManagerProfile = useGameStore((state) => state.setManagerProfile);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const selectedSlotId = useGameStore((state) => state.selectedSlotId);

  // 단계 관리 (0: 기본&초상화, 1: 운영성향, 2: 사용언어) - 총 3단계
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 선택한 팀의 전임 감독 정보 및 추천 언어 목록 (1~2개)
  const selectedTeamManager = selectedTeam
    ? PREDEFINED_MANAGERS.find((m) => m.teamName === selectedTeam.nameKo) || null
    : null;
  const recommendedLanguages: LeagueLanguage[] = selectedTeamManager?.languages || [];

  // 아바타 커스터마이저 모달 관리
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [tempAvatarDna, setTempAvatarDna] = useState<AvatarDna>(
    managerProfile.faceDna || createDefaultAvatarDna()
  );

  // 언어 탭에서 상세 설명을 보여줄 선택된 언어 (기본값: KCL)
  const [inspectedLanguage, setInspectedLanguage] = useState<LeagueLanguage>("KCL");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 각 단계별 유효성 검사 (Validation)
  // Step 0: 한글/영문 닉네임 + 커스텀 아바타 필수
  const isStep0Valid =
    (managerProfile.nameKo?.trim().length || 0) > 0 &&
    (managerProfile.nameEn?.trim().length || 0) > 0 &&
    managerProfile.faceDna != null;

  // Step 1: 전술관 / 지출관 / 선수관리 성향 3개 필수
  const isStep1Valid =
    managerProfile.tactics !== null &&
    managerProfile.finance !== null &&
    managerProfile.playerManagement !== null;

  // Step 2: 언어 정확히 2개 필수
  const isStep2Valid = managerProfile.languages.length === 2;

  // 현재 스텝의 활성화 여부
  const isCurrentStepValid =
    currentStep === 0 ? isStep0Valid : currentStep === 1 ? isStep1Valid : isStep2Valid;

  // 가로 스와이프 제스처 상태 (마우스 & 터치 공통)
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const goToNextStepByDrag = () => {
    if (currentStep === 0) {
      if (isStep0Valid) setCurrentStep(1);
      else showToast("감독 닉네임을 입력해 주세요.");
    } else if (currentStep === 1) {
      if (isStep1Valid) setCurrentStep(2);
      else showToast("운영 성향 3가지를 모두 선택해 주세요.");
    }
  };

  const goToPrevStepByDrag = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // PC 마우스 드래그 핸들러
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, button, select, textarea, label, .no-swipe")) return;

    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);

    const onWindowMouseMove = (moveEvent: MouseEvent) => {
      const diffX = moveEvent.clientX - dragStartX.current;
      const diffY = moveEvent.clientY - dragStartY.current;

      if (isHorizontalSwipe.current === null) {
        if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
          isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
        }
      }

      if (isHorizontalSwipe.current) {
        if ((currentStep === 0 && diffX > 0) || (currentStep === 2 && diffX < 0)) {
          setDragOffset(diffX * 0.2);
        } else {
          setDragOffset(diffX);
        }
      }
    };

    const onWindowMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      setIsDragging(false);

      const diffX = upEvent.clientX - dragStartX.current;
      const threshold = 55;

      if (isHorizontalSwipe.current) {
        if (diffX < -threshold) {
          goToNextStepByDrag();
        } else if (diffX > threshold) {
          goToPrevStepByDrag();
        }
      }

      setDragOffset(0);
      isHorizontalSwipe.current = null;
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  };

  // 터치 스와이프 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diffX = e.touches[0].clientX - dragStartX.current;
    const diffY = e.touches[0].clientY - dragStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipe.current) {
      if ((currentStep === 0 && diffX > 0) || (currentStep === 2 && diffX < 0)) {
        setDragOffset(diffX * 0.2);
      } else {
        setDragOffset(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 55;
    if (isHorizontalSwipe.current) {
      if (dragOffset < -threshold) {
        goToNextStepByDrag();
      } else if (dragOffset > threshold) {
        goToPrevStepByDrag();
      }
    }

    setDragOffset(0);
    isHorizontalSwipe.current = null;
  };

  // 상단 헤더 뒤로가기 버튼
  const handleHeaderBack = () => {
    if (currentStep === 0) {
      // 1단계에서 뒤로가기 -> 팀 생성/팀 정보 화면으로 복귀!
      setScreen("TEAM_CREATE");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // 하단 [다음 단계로] / [팀 생성 완료] 버튼
  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!managerProfile.nameKo?.trim()) {
        showToast("감독 한글 닉네임을 입력해 주세요.");
        return;
      }
      if (!managerProfile.nameEn?.trim()) {
        showToast("감독 영문 닉네임을 입력해 주세요.");
        return;
      }
      if (!managerProfile.faceDna) {
        showToast("감독 아바타를 설정해 주세요.");
        return;
      }
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      if (!managerProfile.tactics) {
        showToast("전술관을 선택해 주세요.");
        return;
      }
      if (!managerProfile.finance) {
        showToast("지출관을 선택해 주세요.");
        return;
      }
      if (!managerProfile.playerManagement) {
        showToast("선수관리를 선택해 주세요.");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (managerProfile.languages.length < 2) {
        showToast("사용 언어를 정확히 2개 선택해 주세요.");
        return;
      }

      // 최종 팀 창단 및 감독 취임 완료 처리
      const finalTeamNameKo = customTeamInfo.nameKo || selectedTeam?.nameKo || "새 팀";
      const finalShortName = customTeamInfo.shortName || selectedTeam?.shortName || "NEW";

      // 내가 고른 팀의 기본 선수들을 깊은 복사하여 '나의 팀 선수' 독립 저장 공간에 초기화 (Potential, PotentialDecay, StarQuality 동적 주입 및 라인별 최고 OVR 자동 배정)
      const defaultPlayers = selectedTeam ? getPlayersByTeamId(selectedTeam.id) : [];
      const initialMyPlayers: Player[] = autoAssignPlayerRoles(initializePlayers(defaultPlayers));

      // 내가 고른 팀의 기본 코치들을 깊은 복사하여 '나의 팀 코치' 독립 저장 공간에 초기화 (연봉, 계약기간, 시장가치 동적 주입 및 5대 전담 보직 자동 배정)
      const defaultCoaches = selectedTeam ? getCoachesByTeamId(selectedTeam.id) : [];
      const initialMyCoaches: Coach[] = autoAssignCoachRoles(initializeCoaches(defaultCoaches));

      // 4개 디비전 (A/B/C/D) 초기 순위표 생성 및 플레이어 팀 리그 D(4부) 배치
      const activeLeague = useGameStore.getState().selectedLeague || "KCL";
      const initialDivisions = createInitialLeagueDivisions(activeLeague, {
        id: selectedTeam?.id || "TEAM-01",
        nameKo: finalTeamNameKo,
        nameEn: customTeamInfo.nameEn || selectedTeam?.nameEn || "New Team",
        shortName: finalShortName,
        customLogoUrl: customTeamInfo.customLogoUrl,
      });

      const newTeamData = {
        id: selectedTeam?.id || "TEAM-01",
        name: finalTeamNameKo,
        shortName: finalShortName,
        foundedYear: 2026,
        balance: 500000000,
        fans: 15000,
        roster: initialMyPlayers,
        staff: [],
      };

      if (selectedSlotId) {
        useGameStore.setState((state) => ({
          slots: state.slots.map((s) =>
            s.id === selectedSlotId
              ? {
                  ...s,
                  isCreated: true,
                  team: newTeamData,
                  myPlayers: initialMyPlayers,
                  myCoaches: initialMyCoaches,
                  managerProfile: { ...state.managerProfile },
                  customTeamInfo: { ...state.customTeamInfo },
                  selectedLeague: state.selectedLeague,
                  selectedTeam: state.selectedTeam,
                  leagueDivisions: initialDivisions,
                  currentDivision: "D",
                  lastPlayedAt: "방금 전",
                }
              : s
          ),
          currentTeam: newTeamData,
          myPlayers: initialMyPlayers,
          myCoaches: initialMyCoaches,
          leagueDivisions: initialDivisions,
          currentDivision: "D",
        }));
      } else {
        useGameStore.setState({
          currentTeam: newTeamData,
          myPlayers: initialMyPlayers,
          myCoaches: initialMyCoaches,
          leagueDivisions: initialDivisions,
          currentDivision: "D",
        });
      }

      // 클라우드 세이브 저장
      const currentUser = useGameStore.getState().currentUser;
      if (currentUser?.id && selectedSlotId) {
        saveGameToCloud(
          currentUser.id,
          selectedSlotId,
          `${newTeamData.name} (1년차)`,
          1,
          1,
          newTeamData.name,
          {
            currentTeam: newTeamData,
            myPlayers: initialMyPlayers,
            myCoaches: initialMyCoaches,
            managerProfile: useGameStore.getState().managerProfile,
            customTeamInfo: useGameStore.getState().customTeamInfo,
            selectedLeague: useGameStore.getState().selectedLeague,
            selectedTeam: useGameStore.getState().selectedTeam,
            leagueDivisions: initialDivisions,
            currentDivision: "D",
            currentYear: 2027,
            currentWeek: 1,
          }
        );
      }

      // 팀 생성 완료 -> 1년차 1월 1주차 스토브리그로 스토어 확정 초기화 후 대시보드 진입
      useGameStore.setState({
        currentYear: 2027,
        currentWeek: 1,
        activeMatchIndex: 0,
        seasonSchedule: [],
      });

      setScreen("DASHBOARD");
    }
  };

  // 언어 검사 및 선택 핸들러
  const handleInspectLanguage = (code: LeagueLanguage) => {
    setInspectedLanguage(code);
  };

  const handleSelectCurrentLanguage = () => {
    const isSelected = managerProfile.languages.includes(inspectedLanguage);

    if (isSelected) {
      setManagerProfile({
        languages: managerProfile.languages.filter((l) => l !== inspectedLanguage),
      });
    } else {
      if (managerProfile.languages.length >= 2) {
        showToast("사용 언어는 최대 2개까지만 선택할 수 있습니다.");
        return;
      }
      setManagerProfile({
        languages: [...managerProfile.languages, inspectedLanguage],
      });
    }
  };

  const handleResetLanguages = () => {
    setManagerProfile({ languages: [] });
  };

  const tacticalOptions: TacticalPhilosophy[] = [
    "매우 공격적",
    "공격적",
    "수비적",
    "매우 수비적",
  ];

  const financialOptions: FinancialPhilosophy[] = [
    "매우 과감함",
    "과감함",
    "신중함",
    "매우 신중함",
  ];

  const managementOptions: PlayerManagementPhilosophy[] = [
    "매우 엄격함",
    "엄격함",
    "유연함",
    "매우 유연함",
  ];

  // 운영 성향 랜덤 선택 핸들러
  const handleRandomizePhilosophies = () => {
    const randomTactics =
      tacticalOptions[Math.floor(Math.random() * tacticalOptions.length)];
    const randomFinance =
      financialOptions[Math.floor(Math.random() * financialOptions.length)];
    const randomManagement =
      managementOptions[Math.floor(Math.random() * managementOptions.length)];

    setManagerProfile({
      tactics: randomTactics,
      finance: randomFinance,
      playerManagement: randomManagement,
    });
  };

  const currentInspectedInfo =
    LEAGUE_LANGUAGES.find((item) => item.code === inspectedLanguage) ||
    LEAGUE_LANGUAGES[0];

  return (
    <div className="relative z-10 flex-1 flex flex-col justify-between h-full animate-in fade-in duration-200 select-none">
      {/* 아바타 커스터마이저 모달 팝업 */}
      {showAvatarModal && (
        <div
          onClick={() => setShowAvatarModal(false)}
          className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[390px] h-[95%] sm:h-[92%] bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-3 sm:p-4 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40 shrink-0">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                감독 2D 벡터 아바타 커스텀
              </span>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar my-2">
              <AvatarCustomizer
                value={tempAvatarDna}
                onChange={setTempAvatarDna}
                teamId={selectedTeam?.id}
                league={selectedTeam?.league}
                teamName={customTeamInfo.nameKo || selectedTeam?.nameKo}
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-750 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setManagerProfile({
                    faceDna: tempAvatarDna,
                    portrait: "custom_avatar",
                  });
                  setShowAvatarModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                저장 및 적용하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/90 text-cyan-200 border border-cyan-500/50 text-xs py-2 px-4 rounded-full shadow-lg backdrop-blur-md animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

      {/* ================= 1. 상단 고정 헤더: 뒤로가기 & 타이틀 & 3단계 세그먼트 ================= */}
      <div className="shrink-0 p-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
            aria-label="이전 화면으로 이동"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold">
              MANAGER PROFILE
            </span>
            <h2 className="text-sm font-bold text-white tracking-wide">
              플레이어 감독 프로필 설정
            </h2>
          </div>
          <div className="w-9 h-9" />
        </div>

        {/* 3단계 진행 세그먼트 (0: 기본/초상화, 1: 운영성향, 2: 사용언어) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          {[
            { step: 0, title: "기본/초상화", valid: isStep0Valid },
            { step: 1, title: "운영 성향", valid: isStep1Valid },
            { step: 2, title: "사용 언어", valid: isStep2Valid },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = item.valid;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step === 0) setCurrentStep(0);
                  else if (item.step === 1 && isStep0Valid) setCurrentStep(1);
                  else if (item.step === 2 && isStep0Valid && isStep1Valid) setCurrentStep(2);
                  else {
                    if (!isStep0Valid) showToast("감독 닉네임과 아바타를 먼저 설정해 주세요.");
                    else if (!isStep1Valid) showToast("운영 성향 3가지를 모두 선택해 주세요.");
                  }
                }}
                className={`py-2 px-1 rounded-xl text-center transition-all duration-200 cursor-pointer touch-manipulation border ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-200 border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold"
                    : isCompleted
                    ? "bg-slate-900/60 text-slate-300 border-emerald-500/50 font-medium"
                    : "bg-transparent text-slate-500 border-transparent hover:text-slate-400"
                }`}
              >
                <span className="text-xs tracking-tight whitespace-nowrap block truncate">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 2. 중앙 컨텐츠 영역 (가로 스와이프 슬라이더 3단계) ================= */}
      <div
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleSliderMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full w-[300%] transition-transform duration-200 ease-out"
          style={{
            transform: `translateX(calc(-${currentStep * (100 / 3)}% + ${dragOffset / 3}px))`,
          }}
        >
          {/* ================= STEP 0: 기본 & 초상화 ================= */}
          <div className="w-1/3 h-full overflow-y-auto px-5 py-3 custom-scrollbar flex flex-col gap-4">
            {/* 닉네임 입력 박스 */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1.5 flex items-center justify-between">
                  <span>감독 닉네임 (한글)</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {managerProfile.nameKo?.length || 0}/8
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={managerProfile.nameKo || ""}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 8);
                    setManagerProfile({ nameKo: val, name: val });
                  }}
                  placeholder="한글 닉네임을 입력하세요 (최대 8자)"
                  className="w-full bg-slate-950/80 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyan-300 mb-1.5 flex items-center justify-between">
                  <span>감독 닉네임 (영문)</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {managerProfile.nameEn?.length || 0}/14
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={managerProfile.nameEn || ""}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 14);
                    setManagerProfile({ nameEn: val });
                  }}
                  placeholder="영문 닉네임을 입력하세요 (최대 14자)"
                  className="w-full bg-slate-950/80 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 transition-all font-medium font-mono"
                />
              </div>

              {/* 프리뷰 표기 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 mt-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    실제 게임 표기 형태
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/40">
                    영문 (한글)
                  </span>
                </div>
                <div className="py-2 px-3 rounded-lg bg-slate-900/90 border border-cyan-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold tracking-wide">
                    {managerProfile.nameEn?.trim() ? (
                      <span className="text-cyan-300 font-mono">
                        {managerProfile.nameEn.trim()}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">Name</span>
                    )}{" "}
                    <span className="text-slate-300">
                      (
                      {managerProfile.nameKo?.trim() ? (
                        <span className="text-white">{managerProfile.nameKo.trim()}</span>
                      ) : (
                        <span className="text-slate-500 font-medium">이름</span>
                      )}
                      )
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 감독 2D 벡터 아바타 설정 섹션 (공식 초상화 10종 제거 및 아바타 단일화) */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-sm flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  감독 2D 벡터 아바타
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  CUSTOM AVATAR
                </span>
              </div>

              {/* 중앙 아바타 프리뷰 및 버튼들 */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-blue-950/50 to-slate-900/80 border border-cyan-500/40 shadow-inner">
                {/* 대형 아바타 초상화 (클릭 시 아바타 커스텀 진입) */}
                <button
                  type="button"
                  onClick={() => {
                    setTempAvatarDna(managerProfile.faceDna || createDefaultAvatarDna());
                    setShowAvatarModal(true);
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl bg-slate-950 border-2 border-cyan-400/80 hover:border-cyan-300 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.55)] active:scale-95 transition-all relative group cursor-pointer"
                  title="아바타 커스터마이징 열기"
                >
                  <AvatarRenderer
                    dna={managerProfile.faceDna || createDefaultAvatarDna()}
                    teamId={selectedTeam?.id}
                    league={selectedTeam?.league}
                    size="100%"
                    className="w-full h-full group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* 호버 시 편집 힌트 아이콘 */}
                  <div className="absolute inset-0 bg-cyan-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/85 text-white flex items-center justify-center shadow-lg backdrop-blur-xs">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                {/* 아바타 설명 & 조작 액션 버튼 */}
                <div className="flex-1 flex flex-col justify-between h-full gap-2 min-w-0">
                  <div>
                    <span className="text-xs font-bold text-white tracking-tight block truncate">
                      나만의 전속 감독 아바타
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      얼굴형·헤어·눈매·안경·수염·체형을 직접 커스터마이징하세요.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTempAvatarDna(managerProfile.faceDna || createDefaultAvatarDna());
                        setShowAvatarModal(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>아바타 커스텀</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const randomDna = createRandomAvatarDna();
                        setManagerProfile({ faceDna: randomDna });
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:text-white font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="랜덤 아바타 생성"
                    >
                      <Dices className="w-3.5 h-3.5 text-cyan-400" />
                      <span>랜덤</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 팀 유니폼 연동 상태 안내 */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  {customTeamInfo.nameKo || selectedTeam?.nameKo
                    ? `${customTeamInfo.nameKo || selectedTeam?.nameKo} 유니폼 연동 중`
                    : "기본 유니폼"}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">
                  READY
                </span>
              </div>
            </div>
          </div>

          {/* ================= STEP 1: 운영 성향 (유니티 앵커 & 레이아웃 그룹 스타일) ================= */}
          <div className="w-1/3 h-full px-4 sm:px-5 py-2 sm:py-2.5 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex-1 flex flex-col gap-1.5 sm:gap-2.5 min-h-0">
              {/* 1. 전술관 세그먼트 컨트롤 */}
              <div className="flex-1 flex flex-col justify-between min-h-0 bg-slate-900/80 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5 shrink-0">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    전술관
                  </span>
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {managerProfile.tactics || "미선택"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/90 rounded-xl border border-slate-800 shrink-0">
                  {tacticalOptions.map((opt) => {
                    const isSelected = managerProfile.tactics === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setManagerProfile({ tactics: opt })}
                        className={`py-1.5 sm:py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer touch-manipulation text-center ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 min-h-[36px] sm:min-h-[44px] mt-1 sm:mt-2 px-2.5 sm:px-3 py-1 sm:py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center">
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-snug sm:leading-relaxed">
                    {managerProfile.tactics === "매우 공격적" &&
                      "라인전 주도권과 초반 킬 중심의 난타전 전략을 최우선합니다."}
                    {managerProfile.tactics === "공격적" &&
                      "적극적인 카운터 정글링과 오브젝트 교전을 유도합니다."}
                    {managerProfile.tactics === "수비적" &&
                      "안정적인 시야 장악과 후반 캐리 지향적 조합을 선호합니다."}
                    {managerProfile.tactics === "매우 수비적" &&
                      "실수를 최소화하고 극단적인 밸류 한타로 역전을 노립니다."}
                    {!managerProfile.tactics && "원하는 전술 기조를 선택해 주세요."}
                  </p>
                </div>
              </div>

              {/* 2. 지출관 세그먼트 컨트롤 */}
              <div className="flex-1 flex flex-col justify-between min-h-0 bg-slate-900/80 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5 shrink-0">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    지출관
                  </span>
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {managerProfile.finance || "미선택"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/90 rounded-xl border border-slate-800 shrink-0">
                  {financialOptions.map((opt) => {
                    const isSelected = managerProfile.finance === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setManagerProfile({ finance: opt })}
                        className={`py-1.5 sm:py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer touch-manipulation text-center ${
                          isSelected
                            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 min-h-[36px] sm:min-h-[44px] mt-1 sm:mt-2 px-2.5 sm:px-3 py-1 sm:py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center">
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-snug sm:leading-relaxed">
                    {managerProfile.finance === "매우 과감함" &&
                      "초특급 S급 스타 영입을 위해 막대한 예산도 아낌없이 베팅합니다."}
                    {managerProfile.finance === "과감함" &&
                      "핵심 전력 보강이 필요한 포지션에 과감한 투자를 단행합니다."}
                    {managerProfile.finance === "신중함" &&
                      "가성비 높은 유망주 발굴과 합리적인 연봉 체계를 유지합니다."}
                    {managerProfile.finance === "매우 신중함" &&
                      "철저한 흑자 경영과 팀 유소년 아카데미 육성에 집중합니다."}
                    {!managerProfile.finance && "팀 재정 운영 스타일을 선택해 주세요."}
                  </p>
                </div>
              </div>

              {/* 3. 선수관리 세그먼트 컨트롤 */}
              <div className="flex-1 flex flex-col justify-between min-h-0 bg-slate-900/80 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5 shrink-0">
                  <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    선수관리
                  </span>
                  <span className="text-xs font-bold text-amber-300 font-mono">
                    {managerProfile.playerManagement || "미선택"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/90 rounded-xl border border-slate-800 shrink-0">
                  {managementOptions.map((opt) => {
                    const isSelected = managerProfile.playerManagement === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setManagerProfile({ playerManagement: opt })}
                        className={`py-1.5 sm:py-2 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer touch-manipulation text-center ${
                          isSelected
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 min-h-[36px] sm:min-h-[44px] mt-1 sm:mt-2 px-2.5 sm:px-3 py-1 sm:py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center">
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-snug sm:leading-relaxed">
                    {managerProfile.playerManagement === "매우 엄격함" &&
                      "철저한 규율과 스케줄 준수, 강력한 통제를 강조합니다."}
                    {managerProfile.playerManagement === "엄격함" &&
                      "프로 의식과 팀 워크를 중시하며 일관된 원칙으로 지도합니다."}
                    {managerProfile.playerManagement === "유연함" &&
                      "선수 개인의 개성과 플레이 스타일을 존중하며 자율성을 부여합니다."}
                    {managerProfile.playerManagement === "매우 유연함" &&
                      "자유로운 소통과 창의성을 극대화하는 수평적 분위기를 조성합니다."}
                    {!managerProfile.playerManagement && "선수단 지도 스타일을 선택해 주세요."}
                  </p>
                </div>
              </div>
            </div>

            {/* 랜덤 주사위 버튼 */}
            <div className="shrink-0 pt-1.5 sm:pt-2">
              <button
                type="button"
                onClick={handleRandomizePhilosophies}
                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-blue-950/90 border border-indigo-500/40 text-indigo-200 font-bold text-[11px] sm:text-xs hover:border-indigo-400 hover:text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              >
                <Dices className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                <span>운영 성향 3가지 무작위 랜덤 설정</span>
              </button>
            </div>
          </div>

          {/* ================= STEP 2: 사용 언어 ================= */}
          <div className="w-1/3 h-full px-5 py-2.5 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 gap-2">
              <div className="flex items-center justify-between px-1 shrink-0">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  사용 언어 선택 (2개)
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                    managerProfile.languages.length === 2
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  선택됨: {managerProfile.languages.length} / 2
                </span>
              </div>

              {/* 대형 상세 설명 박스 */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
                <span className="absolute -right-2 -bottom-4 text-7xl font-black font-mono text-cyan-500/5 pointer-events-none select-none">
                  {currentInspectedInfo.code}
                </span>

                <div className="flex items-center gap-2.5 pb-2.5 mb-2 border-b border-cyan-900/50 overflow-hidden shrink-0">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                    {currentInspectedInfo.code}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-[13px] font-bold text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                      {currentInspectedInfo.fullName}
                    </h4>
                    <span className="text-[11px] text-cyan-300/90 font-medium tracking-tight mt-0.5">
                      {currentInspectedInfo.koreanName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5 shrink-0 flex-wrap gap-1">
                  <div className="text-xs text-cyan-400/90 font-medium flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    지역: {currentInspectedInfo.region}
                  </div>

                  {recommendedLanguages.includes(currentInspectedInfo.code) && selectedTeam && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                      <ThumbsUp className="w-2.5 h-2.5 fill-amber-400 stroke-none" />
                      <span>
                        {customTeamInfo.nameKo || selectedTeam.nameKo} 전임 감독(
                        {selectedTeamManager
                          ? `${selectedTeamManager.nicknameEn} (${selectedTeamManager.nicknameKo})`
                          : ""}
                        ) 추천
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentInspectedInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 5개 언어 버튼 & 2분할 액션 */}
            <div className="shrink-0 flex flex-col gap-2 pt-2.5">
              <div className="grid grid-cols-5 gap-1.5">
                {LEAGUE_LANGUAGES.map((lang) => {
                  const isSelected = managerProfile.languages.includes(lang.code);
                  const isInspected = inspectedLanguage === lang.code;
                  const isRecommended = recommendedLanguages.includes(lang.code);

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleInspectLanguage(lang.code)}
                      className={`relative py-3 sm:py-3.5 px-1 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer touch-manipulation min-h-[48px] ${
                        isInspected
                          ? "bg-slate-800/90 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] z-10"
                          : isSelected
                          ? "bg-cyan-950/40 border border-cyan-500/50"
                          : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* 추천 뱃지 */}
                      {isRecommended && (
                        <div
                          className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.6)] z-20 border border-amber-200"
                          title={`${customTeamInfo.nameKo || selectedTeam?.nameKo || "선택 팀"} 전임 감독 추천 언어`}
                        >
                          <ThumbsUp className="w-2.5 h-2.5 stroke-[2.5] fill-slate-950" />
                        </div>
                      )}

                      {/* 선택 완료 뱃지 */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow z-20">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      <span
                        className={`text-[11px] sm:text-xs font-bold font-mono tracking-tight text-center whitespace-nowrap ${
                          isInspected
                            ? "text-cyan-200"
                            : isSelected
                            ? "text-cyan-300"
                            : "text-slate-300"
                        }`}
                      >
                        {lang.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 2분할 버튼: [다시 선택하기] & [선택하기 / 선택 해제] */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleResetLanguages}
                  disabled={managerProfile.languages.length === 0}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 touch-manipulation border ${
                    managerProfile.languages.length > 0
                      ? "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white shadow-sm active:scale-[0.98] cursor-pointer"
                      : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 선택하기</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectCurrentLanguage}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-150 touch-manipulation border cursor-pointer active:scale-[0.98] ${
                    managerProfile.languages.includes(inspectedLanguage)
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                      : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.35)] hover:shadow-[0_0_16px_rgba(6,182,212,0.5)]"
                  }`}
                >
                  {managerProfile.languages.includes(inspectedLanguage) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-rose-300 stroke-[2.5]" />
                      <span>{inspectedLanguage} 언어 해제</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{inspectedLanguage} 언어 선택</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. 하단 고정 액션 버튼 바 ================= */}
      <div className="shrink-0 p-4 pt-2 border-t border-slate-800/60 bg-slate-950/40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleHeaderBack}
            className="py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1 touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className={`flex-1 py-3.5 px-5 rounded-xl font-bold text-xs tracking-wide transition-all duration-150 flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer ${
              isCurrentStepValid
                ? currentStep === 2
                  ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)] border border-emerald-300/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] active:scale-[0.98]"
                  : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-[0.98]"
                : "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed"
            }`}
          >
            <span>
              {currentStep === 0
                ? "운영 성향 설정으로"
                : currentStep === 1
                ? "사용 언어 선택으로"
                : "팀 생성 완료"}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
