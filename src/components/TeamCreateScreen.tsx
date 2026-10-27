"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  MapPin,
  Briefcase,
  Users,
  Coins,
  RotateCcw,
  Shield,
  Edit3,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useGameStore } from "@/store/useGameStore";
import { LeagueLanguage, PredefinedTeam } from "@/types/game";
import { PREDEFINED_TEAMS } from "@/data/teams";
import { PREDEFINED_MANAGERS } from "@/data/managers";
import { getPlayersByTeamId } from "@/data/players";
import { getPlayerTraitById } from "@/data/playerTraits";
import { getTeamLogo } from "@/data/teamLogos";
import { getLeagueLogo } from "@/data/leagueLogos";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";

const AGING_TYPE_LABEL: Record<string, string> = {
  Early: "조기만개형",
  Normal: "표준형",
  Late: "대기만성형",
};

const formatKoreanCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    const eok = amount / 100000000;
    const formatted = Number.isInteger(eok)
      ? eok.toString()
      : eok.toFixed(1).replace(/\.0$/, "");
    return `${formatted}억`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만`;
  }
  return `${amount.toLocaleString()}원`;
};

// 리그 선택 메타데이터
interface LeagueSelectTabInfo {
  code: LeagueLanguage;
  name: string;
  fullName: string;
  koreanName: string;
  region: string;
  description: string;
}

const LEAGUE_SELECT_TABS: LeagueSelectTabInfo[] = [
  {
    code: "KCL",
    name: "한국 리그",
    fullName: "Korea Champions League",
    koreanName: "한국 챔피언스 리그",
    region: "대한민국",
    description: "세계 최고의 피지컬과 정교한 한타 중심의 최강 리그",
  },
  {
    code: "CCL",
    name: "중국 리그",
    fullName: "China Champions League",
    koreanName: "중국 챔피언스 리그",
    region: "중국",
    description: "호전적인 교전 지향과 화끈한 속도전의 맹수들",
  },
  {
    code: "ECL",
    name: "유럽-중동-아프리카 리그",
    fullName: "EMEA Champions League",
    koreanName: "유럽-중동-아프리카 챔피언스 리그",
    region: "유럽 / 중동 / 아프리카",
    description: "창의적인 밴픽과 글로벌 메타를 선도하는 개척자",
  },
  {
    code: "ACL",
    name: "아메리카 리그",
    fullName: "America Champions League",
    koreanName: "아메리카 챔피언스 리그",
    region: "북미 / 남미",
    description: "풍부한 자본력과 자유로운 소통, 잠재력의 신세계",
  },
  {
    code: "PCL",
    name: "태평양 리그",
    fullName: "Pacific Champions League",
    koreanName: "태평양 챔피언스 리그",
    region: "태평양 (대만·동남아·일본·오세아니아)",
    description: "아시아-태평양의 다채로운 열정과 패기 넘치는 다크호스",
  },
];

export default function TeamCreateScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const resetCreationState = useGameStore((state) => state.resetCreationState);

  // 리그 및 팀 선택 상태
  const selectedLeague = useGameStore((state) => state.selectedLeague);
  const setSelectedLeague = useGameStore((state) => state.setSelectedLeague);
  const selectedTeam = useGameStore((state) => state.selectedTeam);
  const setSelectedTeam = useGameStore((state) => state.setSelectedTeam);

  // 커스텀 팀 정보 (한글 12자, 영문 20자, 약칭 3자)
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const setCustomTeamInfo = useGameStore((state) => state.setCustomTeamInfo);

  // 단계 관리 (0: 리그 선택, 1: 팀 선택, 2: 팀 정보) - 총 3단계
  // 이미 팀이 선택되어 돌아온 경우 2단계(팀 정보)에서 시작
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (selectedTeam) return 2;
    if (selectedLeague) return 1;
    return 0;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [inspectingTeam, setInspectingTeam] = useState<PredefinedTeam | null>(null);

  // 팀 상세 팝업에 표시할 해당 팀의 사전 정의 헤드코치 및 소속 선수단
  const inspectedManager = inspectingTeam
    ? PREDEFINED_MANAGERS.find((m) => m.teamName === inspectingTeam.nameKo) || null
    : null;
  const inspectedTeamPlayers = inspectingTeam
    ? getPlayersByTeamId(inspectingTeam.id)
    : [];
  const starterCount = inspectedTeamPlayers.filter(
    (p) => p.contractAndRole.rosterStatus === "Starter"
  ).length;
  const subCount = inspectedTeamPlayers.length - starterCount;

  // 팀 로고 파일 업로드 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 팀 로고 이미지 업로드 처리
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일(PNG, JPG, SVG, WEBP 등)만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomTeamInfo({ customLogoUrl: result });
    };
    reader.onerror = () => {
      showToast("이미지 파일을 불러오는 중 오류가 발생했습니다.");
    };
    reader.readAsDataURL(file);
  };

  // 팀 로고 기본값 복원 핸들러
  const handleResetLogo = () => {
    setCustomTeamInfo({ customLogoUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 리그 선택 핸들러 (리그 변경 시 선택된 팀 및 팀 정보 완전 초기화)
  const handleSelectLeague = (league: LeagueLanguage) => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
      setInspectingTeam(null);
      setSelectedTeam(null);
      setCustomTeamInfo({
        nameKo: "",
        nameEn: "",
        shortName: "",
        customLogoUrl: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 단계별 유효성 검사 (팀 선택이 없으면 팀 정보도 유효하지 않음)
  const isStep0Valid = selectedLeague !== null;
  const isStep1Valid = isStep0Valid && selectedTeam !== null;
  const isStep2Valid =
    isStep1Valid &&
    (customTeamInfo.nameKo?.trim().length || 0) > 0 &&
    (customTeamInfo.nameKo?.trim().length || 0) <= 12 &&
    (customTeamInfo.nameEn?.trim().length || 0) > 0 &&
    (customTeamInfo.nameEn?.trim().length || 0) <= 20 &&
    (customTeamInfo.shortName?.trim().length || 0) === 3;

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
      else showToast("플레이할 리그를 먼저 선택해 주세요.");
    } else if (currentStep === 1) {
      if (isStep1Valid) setCurrentStep(2);
      else showToast("플레이할 팀을 먼저 선택해 주세요.");
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

  // 팀 목록 PC 드래그 스크롤
  const teamScrollRef = useRef<HTMLDivElement>(null);
  const isTeamDraggingRef = useRef(false);
  const teamStartYRef = useRef(0);
  const teamScrollTopRef = useRef(0);
  const teamHasMovedRef = useRef(false);

  const handleTeamMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !teamScrollRef.current) return;
    isTeamDraggingRef.current = true;
    teamHasMovedRef.current = false;
    teamStartYRef.current = e.clientY;
    teamScrollTopRef.current = teamScrollRef.current.scrollTop;

    const onWindowMouseMove = (moveEvent: MouseEvent) => {
      if (!isTeamDraggingRef.current || !teamScrollRef.current) return;
      const diffY = moveEvent.clientY - teamStartYRef.current;
      if (Math.abs(diffY) > 5) {
        teamHasMovedRef.current = true;
      }
      teamScrollRef.current.scrollTop = teamScrollTopRef.current - diffY;
    };

    const onWindowMouseUp = () => {
      isTeamDraggingRef.current = false;
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      setTimeout(() => {
        teamHasMovedRef.current = false;
      }, 80);
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  };

  // 모바일 터치 스와이프 핸들러
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

  // 뒤로 가기 처리
  const handleHeaderBack = () => {
    if (currentStep === 0) {
      setShowExitModal(true);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // 하단 [다음 단계로] 버튼 핸들러
  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!isStep0Valid) {
        showToast("플레이할 리그를 먼저 선택해 주세요.");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!isStep1Valid) {
        showToast("플레이할 팀을 먼저 선택해 주세요.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!customTeamInfo.nameKo?.trim()) {
        showToast("한글 팀명을 입력해 주세요 (최대 12자).");
        return;
      }
      if (!customTeamInfo.nameEn?.trim()) {
        showToast("영문 팀명을 입력해 주세요 (최대 20자).");
        return;
      }
      if (!customTeamInfo.shortName?.trim() || customTeamInfo.shortName.trim().length !== 3) {
        showToast("영문 약칭 3글자를 입력해 주세요 (예: SME).");
        return;
      }

      // 팀 정보 설정 완료 -> 감독 프로필 생성 화면으로 전환!
      setScreen("MANAGER_CREATE");
    }
  };

  // 팀 정보 기본값 복원 핸들러
  const handleResetTeamInfo = () => {
    if (!selectedTeam) return;
    setCustomTeamInfo({
      nameKo: selectedTeam.nameKo,
      nameEn: selectedTeam.nameEn,
      shortName: selectedTeam.shortName,
      customLogoUrl: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 현재 선택된 리그의 30개 팀 목록
  const currentLeagueTeams = selectedLeague
    ? PREDEFINED_TEAMS.filter((t) => t.league === selectedLeague)
    : [];

  const currentLeagueTabInfo = LEAGUE_SELECT_TABS.find((t) => t.code === selectedLeague);

  return (
    <div className="relative z-10 flex-1 flex flex-col justify-between h-full animate-in fade-in duration-200 select-none">
      {/* 팀 생성 취소 확인 모달 팝업 */}
      {showExitModal && (
        <div
          onClick={() => setShowExitModal(false)}
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-150 cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowLeft className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                팀 생성을 그만두시겠습니까?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                팀 슬롯 선택 화면으로 나가며, 지금까지 설정한 내용이 모두 초기화됩니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                아니오
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false);
                  resetCreationState();
                  setScreen("SLOT_SELECT");
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:brightness-110 transition-all cursor-pointer"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팀 상세 정보 및 선택 확인 대형 팝업 모달 */}
      {inspectingTeam && (
        <div
          onClick={() => setInspectingTeam(null)}
          className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[390px] h-[92%] bg-slate-900/95 border border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
          >
            {/* 상단 헤더: 팀 기본 브랜딩 및 닫기 버튼 */}
            <div className="flex items-start justify-between pb-3 border-b border-cyan-900/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {(() => {
                  const logoUrl = getTeamLogo(inspectingTeam.id);
                  return logoUrl ? (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-white border-2 border-cyan-400/80 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.45)] shrink-0 overflow-hidden p-1.5">
                      <img
                        src={logoUrl}
                        alt={inspectingTeam.nameKo}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/80 text-cyan-200 font-mono font-black text-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.45)] shrink-0">
                      {inspectingTeam.shortName}
                    </div>
                  );
                })()}

                <div className="flex flex-col min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {inspectingTeam.nameKo}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono truncate">
                    {inspectingTeam.nameEn}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] border border-cyan-500/40">
                      {inspectingTeam.league}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[10px] border border-slate-700 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{inspectingTeam.city} ({inspectingTeam.country || inspectingTeam.region})</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingTeam(null)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-750 active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 본문 스크롤 영역: 팀 세부 정보 */}
            <div className="flex-1 overflow-y-auto custom-scrollbar my-3 pr-1 flex flex-col gap-3">
              {/* 섹션 1: 코칭스태프 구성 & 사령탑 (헤드코치) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    코칭스태프 및 사령탑 (감독)
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400/80 font-bold">HEAD COACH</span>
                </div>

                {inspectedManager ? (
                  <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex gap-3.5 items-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] shrink-0 flex items-center justify-center relative">
                      <AvatarRenderer
                        dna={inspectedManager.avatarDna}
                        teamId={inspectingTeam.id}
                        league={inspectingTeam.league}
                        size="100%"
                        className="w-full h-full"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm border border-cyan-400/60 text-[9px] font-mono font-bold text-cyan-300 shadow">
                        HC
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                          {inspectedManager.nicknameEn}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          ({inspectedManager.nicknameKo})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium flex-wrap">
                        <span>{inspectedManager.age}세</span>
                        <span className="text-slate-600">·</span>
                        <span>{inspectedManager.nationality}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-amber-300 font-semibold">명성 {inspectedManager.reputation}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">
                        통산 {inspectedManager.careerStats.wins}승 {inspectedManager.careerStats.losses}패 ({inspectedManager.careerStats.winRate}%)
                      </div>

                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700 font-medium">
                          {inspectedManager.tactics} 전술
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700 font-medium">
                          {inspectedManager.playerManagement}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700 font-medium">
                          {inspectedManager.preferredStyle}
                        </span>
                      </div>

                      <span className="text-[9px] text-cyan-400 font-medium mt-0.5">
                        ※ 플레이어가 이 팀을 선택하면 신임 감독으로 부임합니다
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 섹션 2: 선수단 로스터 (전체 소속 선수 목록) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    선수단 로스터 ({inspectedTeamPlayers.length}인)
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400/80 font-bold">
                    STARTER {starterCount} · SUB {subCount}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {inspectedTeamPlayers.map((player) => {
                    const isStarter =
                      player.contractAndRole.rosterStatus === "Starter";
                    const ovr = Math.round(
                      (player.stats.mechanics +
                        player.stats.decision +
                        player.stats.mental +
                        player.stats.execution +
                        player.stats.teamwork) /
                        5
                    );
                    const agingLabel =
                      AGING_TYPE_LABEL[player.talentAndGrowth.agingType] ||
                      "표준형";

                    return (
                      <div
                        key={player.profile.playerId}
                        className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex gap-3.5 items-center"
                      >
                        {/* 좌측 선수 2D 벡터 아바타 초상화 (감독 창과 동일한 크기) */}
                        <div
                          className={`w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 shrink-0 flex items-center justify-center relative ${
                            isStarter
                              ? "border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                              : "border-slate-700/80 shadow-md"
                          }`}
                        >
                          <AvatarRenderer
                            dna={player.profile.avatarConfig}
                            teamId={inspectingTeam.id}
                            league={inspectingTeam.league}
                            size="100%"
                            className="w-full h-full"
                          />
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-sm border border-cyan-400/60 text-[9px] font-mono font-bold text-cyan-300 shadow">
                            {player.contractAndRole.mainPos}
                          </div>
                          <div
                            className={`absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm border text-[9px] font-bold shadow ${
                              isStarter
                                ? "bg-cyan-950/90 border-cyan-400/60 text-cyan-200"
                                : "bg-slate-900/90 border-slate-600/60 text-slate-400"
                            }`}
                          >
                            {isStarter ? "주전" : "후보"}
                          </div>
                        </div>

                        {/* 우측 선수 상세 정보 */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                                {player.profile.nicknameEn}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                ({player.profile.nicknameKr})
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[9px] font-mono border border-slate-700/80 shrink-0">
                              주 {player.contractAndRole.mainPos} · 부{" "}
                              {player.contractAndRole.subPos}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium flex-wrap">
                            <span>{player.profile.age}세</span>
                            <span className="text-slate-600">·</span>
                            <span>
                              {player.profile.careerYears === 1
                                ? "신인(1년차)"
                                : `${player.profile.careerYears}년차`}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-amber-300 font-semibold">
                              종합 {ovr}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-cyan-300 font-semibold">
                              잠재 {player.talentAndGrowth.potential}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-wrap leading-tight">
                            <span>
                              피지컬{" "}
                              <b className="text-slate-200">
                                {player.stats.mechanics}
                              </b>
                            </span>
                            <span className="text-slate-700">·</span>
                            <span>
                              판단{" "}
                              <b className="text-slate-200">
                                {player.stats.decision}
                              </b>
                            </span>
                            <span className="text-slate-700">·</span>
                            <span>
                              정신{" "}
                              <b className="text-slate-200">
                                {player.stats.mental}
                              </b>
                            </span>
                            <span className="text-slate-700">·</span>
                            <span>
                              결정{" "}
                              <b className="text-slate-200">
                                {player.stats.execution}
                              </b>
                            </span>
                            <span className="text-slate-700">·</span>
                            <span>
                              팀워크{" "}
                              <b className="text-slate-200">
                                {player.stats.teamwork}
                              </b>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {Array.from(new Set(player.traitsAndMastery.traits)).map((traitId, idx) => {
                              const trait = getPlayerTraitById(traitId);
                              if (!trait) return null;
                              const badgeColor =
                                trait.type === "긍정형"
                                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                                  : trait.type === "부정형"
                                  ? "bg-rose-950/60 text-rose-300 border-rose-500/40"
                                  : "bg-amber-950/60 text-amber-300 border-amber-500/40";
                              return (
                                <span
                                  key={`${player.profile.playerId}-${traitId}-${idx}`}
                                  title={`${trait.nameKo} (${trait.nameEn}): ${trait.effect}`}
                                  className={`px-1.5 py-0.5 rounded text-[9px] border font-medium ${badgeColor}`}
                                >
                                  {trait.nameKo}
                                </span>
                              );
                            })}
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700 font-medium">
                              {agingLabel}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] border border-slate-700 font-medium">
                              스타성 {player.talentAndGrowth.starQuality}
                            </span>
                          </div>

                          <span className="text-[9px] text-cyan-400 font-mono font-medium mt-0.5">
                            연봉{" "}
                            {formatKoreanCurrency(
                              player.contractAndRole.salary
                            )}{" "}
                            · 계약 {player.contractAndRole.contractYears}년 ·
                            가치{" "}
                            {formatKoreanCurrency(
                              player.contractAndRole.marketValue
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 섹션 4: 팀 재정 및 운영 지표 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    팀 재정 및 운영 상태
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">FINANCES</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-slate-400">초기 예산</span>
                    <span className="text-xs font-bold text-amber-300 font-mono mt-0.5">리그 표준</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-slate-400">샐러리캡</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5">여유</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-slate-400">클럽 시설</span>
                    <span className="text-xs font-bold text-cyan-300 font-mono mt-0.5">GRADE B</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  ※ 정규 시즌 개막 후 스폰서십 계약 체결 및 홈경기 티켓/굿즈 판매로 재정이 변동됩니다.
                </p>
              </div>
            </div>

            {/* 하단 고정 버튼 바: [닫기] & [이 팀 선택하기] */}
            <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setInspectingTeam(null)}
                className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-750 hover:text-white active:scale-95 transition-all cursor-pointer touch-manipulation"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedTeam?.id === inspectingTeam.id) {
                    setSelectedTeam(null);
                    setInspectingTeam(null);
                  } else {
                    setSelectedTeam(inspectingTeam);
                    setInspectingTeam(null);
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 ${
                  selectedTeam?.id === inspectingTeam.id
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                    : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
                }`}
              >
                {selectedTeam?.id === inspectingTeam.id ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>팀 선택 해제</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>이 팀 선택하기</span>
                  </>
                )}
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
              TEAM CREATION
            </span>
            <h2 className="text-sm font-bold text-white tracking-wide">
              팀 선택 및 정보 설정
            </h2>
          </div>
          <div className="w-9 h-9" />
        </div>

        {/* 3단계 진행 세그먼트 (0: 리그 선택, 1: 팀 선택, 2: 팀 정보) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          {[
            { step: 0, title: "리그 선택", valid: isStep0Valid },
            { step: 1, title: "팀 선택", valid: isStep1Valid },
            { step: 2, title: "팀 정보", valid: isStep2Valid },
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
                    if (!isStep0Valid) showToast("리그를 먼저 선택해 주세요.");
                    else if (!isStep1Valid) showToast("팀을 먼저 선택해 주세요.");
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
          {/* ================= STEP 0: 리그 선택 (빈 공간 없이 5개 버튼으로 세로 꽉 채움) ================= */}
          <div className="w-1/3 h-full px-4 sm:px-5 py-2 sm:py-2.5 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 px-1 pb-1.5 sm:pb-2 shrink-0">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                플레이할 리그를 선택하세요
              </span>

              {/* 5개 리그 선택 탭 (반응형 앵커 & 레이아웃 그룹 스타일) */}
              <div className="flex-1 flex flex-col gap-1.5 sm:gap-2.5 min-h-0 pb-1">
                {LEAGUE_SELECT_TABS.map((league) => {
                  const isSelected = selectedLeague === league.code;
                  const leagueLogoUrl = getLeagueLogo(league.code);
                  return (
                    <button
                      key={league.code}
                      type="button"
                      onClick={() => handleSelectLeague(league.code)}
                      className={`flex-1 relative px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border text-left transition-all duration-150 cursor-pointer touch-manipulation flex items-center justify-between min-h-[50px] sm:min-h-[64px] ${
                        isSelected
                          ? "bg-gradient-to-r from-cyan-950/90 via-blue-950/70 to-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/50"
                          : "bg-slate-900/75 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.99]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        {leagueLogoUrl ? (
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden p-1 bg-white transition-all ${
                              isSelected
                                ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/60"
                                : "border-slate-700/80 shadow-md"
                            }`}
                          >
                            <img
                              src={leagueLogoUrl}
                              alt={league.fullName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-mono font-black text-sm sm:text-base shrink-0 border ${
                              isSelected
                                ? "bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            {league.code}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0 justify-center">
                          <span
                            className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                              isSelected ? "text-cyan-200" : "text-white"
                            }`}
                          >
                            {league.fullName}
                          </span>
                          <span className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate font-medium">
                            {league.koreanName}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate mt-0.5">
                            {league.region}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow shrink-0">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-slate-700/60 flex items-center justify-center text-slate-600 shrink-0">
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 pt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80">
              <span>선택된 리그:</span>
              <span className="text-cyan-300 font-bold">
                {currentLeagueTabInfo ? currentLeagueTabInfo.koreanName : "미선택"}
              </span>
            </div>
          </div>

          {/* ================= STEP 1: 팀 선택 ================= */}
          <div className="w-1/3 h-full px-5 py-2.5 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 gap-2">
              <div className="flex items-center justify-between px-1 shrink-0">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  팀을 선택하세요 ({currentLeagueTeams.length}개 팀)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  클릭 시 팀 정보 상세 확인
                </span>
              </div>

              {/* 팀 목록 스크롤 영역 */}
              <div
                ref={teamScrollRef}
                onMouseDown={handleTeamMouseDown}
                className="flex-1 overflow-y-auto custom-scrollbar pr-1 select-none"
              >
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pb-2">
                  {currentLeagueTeams.map((team) => {
                    const isSelected = selectedTeam?.id === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onClick={() => {
                          if (teamHasMovedRef.current) return;
                          setInspectingTeam(team);
                        }}
                        className={`relative pt-3 pb-2.5 px-2.5 rounded-2xl text-center border transition-all duration-150 cursor-pointer touch-manipulation flex flex-col items-center justify-center gap-2 overflow-hidden min-h-[148px] select-none ${
                          isSelected
                            ? "bg-gradient-to-b from-cyan-950/90 via-blue-950/80 to-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400/50"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850 active:scale-[0.98]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md pointer-events-none z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* 팀 로고 */}
                        {(() => {
                          const logoUrl = getTeamLogo(team.id);
                          return logoUrl ? (
                            <div
                              className={`w-[76px] h-[76px] sm:w-20 sm:h-20 rounded-2xl shrink-0 flex items-center justify-center border shadow-md transition-all pointer-events-none overflow-hidden bg-white p-1.5 ${
                                isSelected
                                  ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-1 ring-cyan-300"
                                  : "border-slate-700/80 shadow-black/40"
                              }`}
                            >
                              <img
                                src={logoUrl}
                                alt={team.nameKo}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-[76px] h-[76px] sm:w-20 sm:h-20 rounded-2xl shrink-0 flex items-center justify-center font-mono font-black text-base sm:text-lg border shadow-inner transition-all pointer-events-none ${
                                isSelected
                                  ? "bg-cyan-500/25 border-cyan-300 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                  : "bg-slate-950 border-slate-700/80 text-slate-400"
                              }`}
                            >
                              {team.shortName}
                            </div>
                          );
                        })()}

                        <h4
                          className={`text-xs sm:text-sm font-bold tracking-tight text-center leading-snug break-keep w-full pointer-events-none px-1 ${
                            isSelected ? "text-cyan-200" : "text-white"
                          }`}
                        >
                          {team.nameKo}
                        </h4>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-2 text-[11px] font-mono flex items-center justify-between border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 min-w-0">
                {selectedTeam && (() => {
                  const logoUrl = getTeamLogo(selectedTeam.id);
                  return logoUrl ? (
                    <div className="w-4 h-4 rounded bg-white border border-cyan-400/50 overflow-hidden flex items-center justify-center shrink-0 p-0.5">
                      <img src={logoUrl} alt={selectedTeam.nameKo} className="w-full h-full object-contain" />
                    </div>
                  ) : null;
                })()}
                <span className="text-slate-400 truncate">
                  {selectedTeam ? `선택: ${selectedTeam.nameKo}` : "팀을 선택해 주세요"}
                </span>
              </div>
              <span className="text-cyan-300 font-bold shrink-0">
                {selectedTeam ? "선택 완료" : "미선택"}
              </span>
            </div>
          </div>

          {/* ================= STEP 2: 팀 정보 & 팀 로고 커스텀 ================= */}
          <div className="w-1/3 h-full px-5 py-2.5 flex flex-col justify-between overflow-hidden">
            {/* 숨겨진 로고 파일 업로드 인풋 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            <div className="flex-1 flex flex-col min-h-0 gap-3 overflow-y-auto custom-scrollbar pr-1">
              <div className="flex items-center justify-between px-1 shrink-0">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  팀 기본 정보 커스텀
                </span>
                {selectedTeam && (
                  <button
                    type="button"
                    onClick={handleResetTeamInfo}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>기본값 복원</span>
                  </button>
                )}
              </div>

              {/* 선택된 팀 프리뷰 카드 (커스텀 로고 연동) */}
              {selectedTeam && (
                <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-lg shrink-0">
                  {(() => {
                    const activeLogoUrl = customTeamInfo.customLogoUrl || getTeamLogo(selectedTeam.id);
                    return activeLogoUrl ? (
                      <div className="relative w-16 h-16 rounded-2xl bg-white border border-cyan-400/80 p-1 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <img src={activeLogoUrl} alt={selectedTeam.nameKo} className="w-full h-full object-contain" />
                        {customTeamInfo.customLogoUrl && (
                          <div className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded bg-cyan-400 text-slate-950 font-mono font-bold text-[8px] shadow">
                            CUSTOM
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-300 shrink-0">
                        {customTeamInfo.shortName || selectedTeam.shortName}
                      </div>
                    );
                  })()}

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">
                      {selectedTeam.league} · {selectedTeam.city} ({selectedTeam.country || selectedTeam.region})
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate mt-0.5">
                      {customTeamInfo.nameKo || selectedTeam.nameKo}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono truncate">
                        {customTeamInfo.nameEn || selectedTeam.nameEn}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-black border border-cyan-500/30">
                        {customTeamInfo.shortName || selectedTeam.shortName}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 팀 로고 커스텀 업로드 섹션 */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>팀 로고 이미지 커스텀</span>
                  </label>
                  {customTeamInfo.customLogoUrl && (
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">
                      커스텀 로고 적용 중
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-950/30 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{customTeamInfo.customLogoUrl ? "로고 이미지 변경" : "로고 이미지 업로드"}</span>
                  </button>

                  {customTeamInfo.customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-400/60 text-slate-300 hover:text-rose-300 font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="기본 로고 복원"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>기본 복원</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 px-0.5 leading-normal">
                  ※ PNG, JPG, SVG 등 나만의 팀 엠블럼 이미지를 등록할 수 있습니다 (최대 5MB, 정사각형 권장).
                </p>
              </div>

              {/* 3가지 텍스트 입력 폼 */}
              <div className="flex flex-col gap-3">
                {/* 1. 한글 팀명 (최대 12자) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <span>한글 팀명</span>
                      <span className="text-[10px] text-cyan-400 font-normal">
                        (최대 12자)
                      </span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      {customTeamInfo.nameKo?.length || 0} / 12
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={12}
                    value={customTeamInfo.nameKo || ""}
                    onChange={(e) => setCustomTeamInfo({ nameKo: e.target.value })}
                    placeholder="예: 서울 엠페러스"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
                  />
                  <p className="text-[10px] text-slate-400 px-1 leading-normal">
                    ※ 국내 리그 경기 및 공식 브리핑 화면에 표기될 한글 팀명입니다.
                  </p>
                </div>

                {/* 2. 영문 팀명 (최대 20자) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <span>영문 팀명</span>
                      <span className="text-[10px] text-cyan-400 font-normal">
                        (최대 20자)
                      </span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      {customTeamInfo.nameEn?.length || 0} / 20
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={customTeamInfo.nameEn || ""}
                    onChange={(e) => setCustomTeamInfo({ nameEn: e.target.value })}
                    placeholder="예: Seoul Emperors"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 px-1 leading-normal">
                    ※ 국제 대회 및 글로벌 중계 시 표기될 공식 영문 팀명입니다.
                  </p>
                </div>

                {/* 3. 영문 약칭 (3글자) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <span>영문 약칭 (3글자)</span>
                      <span className="text-[10px] text-rose-400 font-normal">
                        (정확히 3자)
                      </span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      {customTeamInfo.shortName?.length || 0} / 3
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={3}
                    value={customTeamInfo.shortName || ""}
                    onChange={(e) =>
                      setCustomTeamInfo({ shortName: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })
                    }
                    placeholder="SME"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono font-black tracking-widest uppercase"
                  />
                  <p className="text-[10px] text-slate-400 px-1 leading-normal">
                    ※ 스코어보드, 대진표 및 게임 내 HUD에 노출될 3글자 영문 약칭입니다 (예: SME, T1, GEN).
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-2 text-[11px] font-mono flex items-center justify-between border-t border-slate-800/80">
              <span className="text-slate-400">팀 정보 설정:</span>
              <span className="text-cyan-300 font-bold">
                {isStep2Valid ? "입력 완료" : "입력 필요"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. 하단 고정 액션 버튼 바 ================= */}
      <div className="shrink-0 p-4 pt-2 border-t border-slate-800/60 bg-slate-950/40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1 touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className={`flex-1 py-3.5 px-5 rounded-xl font-bold text-xs tracking-wide transition-all duration-150 flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer ${
              isCurrentStepValid
                ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-[0.98]"
                : "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed"
            }`}
          >
            <span>
              {currentStep === 0
                ? "팀 선택으로"
                : currentStep === 1
                ? "팀 정보 설정으로"
                : "감독 프로필 생성으로"}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
