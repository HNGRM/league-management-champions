"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MatchSchedule,
  SEASON_PHASE_METAS,
  getSeasonPhase,
  getWeekDetailedEvents,
} from "@/types/schedule";
import { TeamStanding } from "@/types/game";
import { Player } from "@/types/player";
import { getChampionById } from "@/data/champions";
import {
  Shield,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Swords,
  Plane,
  Home,
  Users,
  Dumbbell,
  X,
} from "lucide-react";

interface ScheduleMatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeek: number;
  currentWeek: number;
  activeMatchIndex: number;
  weekMatches: MatchSchedule[];
  playerTeam: {
    id: string;
    name: string;
    shortName: string;
    logoUrl?: string | null;
  };
  divisionTeams: TeamStanding[];
  divisionTier?: string;
  facilityArenaLevel: number;
  facilityArenaName: string;
  players: Player[];
  filterMode: "MY_TEAM" | "ALL";
  onPlayMatch: () => boolean;
}

export default function ScheduleMatchDetailModal({
  isOpen,
  onClose,
  selectedWeek,
  currentWeek,
  activeMatchIndex,
  weekMatches,
  playerTeam,
  divisionTeams,
  divisionTier = "D",
  facilityArenaLevel,
  facilityArenaName,
  players,
  filterMode,
  onPlayMatch,
}: ScheduleMatchDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const phase = getSeasonPhase(selectedWeek);
  const phaseMeta = SEASON_PHASE_METAS[phase];

  // 세부 이벤트 (월말 결산일, 미디어 데이, 메타 밸런스 패치, 연간 시상식)
  const detailedEvents = getWeekDetailedEvents(selectedWeek);

  // 팀 정보 조회 유틸
  const getTeamInfo = (teamId: string) => {
    if (teamId === playerTeam.id) {
      const standing = divisionTeams.find((t) => t.isPlayer);
      return {
        id: playerTeam.id,
        name: playerTeam.name,
        shortName: playerTeam.shortName,
        logoUrl: playerTeam.logoUrl || null,
        rank: standing?.rank ?? 1,
        isPlayer: true,
      };
    }
    const found = divisionTeams.find((t) => t.teamId === teamId);
    return {
      id: teamId,
      name: found?.teamName || "상대팀",
      shortName: found?.shortName || "OPP",
      logoUrl: found?.logoUrl || null,
      rank: found?.rank ?? 2,
      isPlayer: false,
    };
  };

  // 플레이어 경기 목록 (1~2경기)
  const playerMatches = weekMatches.filter((m) => m.isPlayerMatch);
  const isCurrentWeek = selectedWeek === currentWeek;
  const allCurrentMatchesDone =
    isCurrentWeek && activeMatchIndex >= playerMatches.length;

  // 예상 관중 수 계산
  const baseCapacity = [0, 1400, 2800, 5600, 11000, 22000][facilityArenaLevel] || 1400;
  const estimatedAttendance = Math.round(baseCapacity * 0.92);

  // 로스터 체력 및 훈련 체크리스트
  const lowStaminaPlayers = players.filter(
    (p) => (p.conditionAndForm?.stamina ?? 100) <= 20
  );
  const restingPlayers = players.filter(
    (p) => p.trainingAssignment?.trainingType === "REST"
  );
  const trainingPlayers = players.filter(
    (p) =>
      p.trainingAssignment?.trainingType &&
      p.trainingAssignment.trainingType !== "REST"
  );
  const unassignedPlayers = players.filter(
    (p) => !p.trainingAssignment?.trainingType
  );

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[420px] max-h-[86vh] bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left">
        {/* ================= 모달 상단 헤더 ================= */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
              W{selectedWeek}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-black text-white tracking-wide truncate">
                  {selectedWeek}주차 세부 정보
                </h3>
                <span
                  className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border ${phaseMeta.badgeClass}`}
                >
                  {phaseMeta.icon} {phaseMeta.nameKr}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {playerMatches.length > 0
                  ? `총 ${playerMatches.length}경기 일정`
                  : "공식 세부 일정 안내"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= 모달 본문 (스크롤) ================= */}
        <div className="p-3.5 overflow-y-auto custom-scrollbar flex flex-col gap-3">
          {/* 1. 매치 상세 카드 (1~2경기 각각 분리 표시) */}
          {playerMatches.length > 0 ? (
            <div className="flex flex-col gap-3">
              {playerMatches.map((match, idx) => {
                const homeTeam = getTeamInfo(match.homeTeamId);
                const awayTeam = getTeamInfo(match.awayTeamId);
                const opponentTeam = match.isHome ? awayTeam : homeTeam;
                const isCompleted = match.status === "COMPLETED" && match.result;

                let isPlayerWin = false;
                if (isCompleted && match.result) {
                  isPlayerWin = match.isHome
                    ? match.result.homeScore > match.result.awayScore
                    : match.result.awayScore > match.result.homeScore;
                }

                const isCurrentActiveMatch =
                  isCurrentWeek && activeMatchIndex === idx && !isCompleted;

                return (
                  <div
                    key={match.id}
                    className={`bg-slate-950/70 border rounded-xl p-3 flex flex-col gap-2.5 transition-all ${
                      isCurrentActiveMatch
                        ? "border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                        : "border-slate-800"
                    }`}
                  >
                    {/* 매치 헤더 */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-cyan-400 font-mono text-[11px]">
                          {playerMatches.length > 1
                            ? `[${idx + 1}차전]`
                            : "[공식 매치]"}
                        </span>
                        <span className="text-white text-[11px]">
                          {match.eventName || "정규 리그전"}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[9px] border border-slate-700">
                          {match.format}
                        </span>
                      </div>

                      <div>
                        {isCompleted ? (
                          <span className="text-[10px] text-slate-400 font-mono">
                            종료됨
                          </span>
                        ) : isCurrentActiveMatch ? (
                          <span className="text-[10px] text-cyan-400 font-bold font-mono">
                            진행 가능
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {idx < activeMatchIndex ? "종료됨" : "대기 중"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 홈 vs 원정 그래픽 */}
                    <div className="grid grid-cols-9 items-center py-1">
                      {/* 홈 팀 */}
                      <div className="col-span-4 flex flex-col items-center gap-1 text-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shadow-xs relative">
                          {homeTeam.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={homeTeam.logoUrl}
                              alt={homeTeam.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Shield className="w-5 h-5 text-slate-500" />
                          )}
                          {homeTeam.isPlayer && (
                            <span className="absolute -top-1 -right-0.5 px-1 py-0.2 rounded bg-cyan-500 text-slate-950 font-black text-[7px]">
                              MY
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white truncate block max-w-[100px]">
                            {homeTeam.name}
                          </span>
                          <span className="text-[9px] text-cyan-400 font-mono">
                            [홈팀] {homeTeam.rank}위
                          </span>
                        </div>
                      </div>

                      {/* VS 및 스코어 */}
                      <div className="col-span-1 flex flex-col items-center justify-center">
                        {isCompleted && match.result ? (
                          <div className="flex flex-col items-center font-mono">
                            <span className="text-sm font-black text-amber-300">
                              {match.result.homeScore} : {match.result.awayScore}
                            </span>
                            <span
                              className={`text-[8px] font-bold px-1 rounded ${
                                isPlayerWin
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              {isPlayerWin ? "승리" : "패배"}
                            </span>
                          </div>
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-[10px] text-amber-400">
                            VS
                          </span>
                        )}
                      </div>

                      {/* 원정 팀 */}
                      <div className="col-span-4 flex flex-col items-center gap-1 text-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden shadow-xs relative">
                          {awayTeam.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={awayTeam.logoUrl}
                              alt={awayTeam.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Shield className="w-5 h-5 text-slate-500" />
                          )}
                          {awayTeam.isPlayer && (
                            <span className="absolute -top-1 -right-0.5 px-1 py-0.2 rounded bg-cyan-500 text-slate-950 font-black text-[7px]">
                              MY
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-white truncate block max-w-[100px]">
                            {awayTeam.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            [원정] {awayTeam.rank}위
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 장소 안내 */}
                    <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {match.isHome ? (
                          <>
                            <Home className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300 font-bold">
                              우리 팀 홈경기
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400 truncate max-w-[150px]">
                              홈 경기장 Lv.{facilityArenaLevel} ({facilityArenaName})
                            </span>
                          </>
                        ) : (
                          <>
                            <Plane className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="text-blue-300 font-bold">원정 경기</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400 truncate max-w-[150px]">
                              {opponentTeam.name} 홈 경기장 방문
                            </span>
                          </>
                        )}
                      </div>

                      {match.isHome && (
                        <span className="text-emerald-400 font-mono shrink-0 font-bold">
                          관중: {estimatedAttendance.toLocaleString()}명
                        </span>
                      )}
                    </div>

                    {/* 상대 팀 경계 챔피언 TOP 3 */}
                    <div className="pt-1.5 border-t border-slate-800/60 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-300 flex items-center gap-1">
                          <Swords className="w-3 h-3 text-rose-400" />
                          {opponentTeam.name} 핵심 경계 챔피언 TOP 3
                        </span>
                        <span className="text-[9px] text-rose-400 font-mono">
                          밴픽 주의
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {(match.cautionChampions || ["001", "002", "003"]).map(
                          (champId, cIdx) => {
                            const champ = getChampionById(champId);
                            const tagColor =
                              cIdx === 0
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                : cIdx === 1
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/40";
                            const tagText =
                              cIdx === 0 ? "1순위" : cIdx === 1 ? "주력픽" : "조커픽";

                            return (
                              <div
                                key={champId}
                                className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 min-w-0"
                              >
                                <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                                  {champ?.images?.portrait ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={champ.images.portrait}
                                      alt={champ.nameKr}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500">
                                      {champId}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={`px-1 py-0.2 rounded text-[8px] font-bold border block w-fit leading-none mb-0.5 ${tagColor}`}
                                  >
                                    {tagText}
                                  </span>
                                  <span className="text-[10px] font-bold text-white truncate block leading-tight">
                                    {champ?.nameKr || champId}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* 경기 진행 버튼 (현재 주차의 활성 매치인 경우) */}
                    {isCurrentActiveMatch && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={onPlayMatch}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-lg active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Swords className="w-4 h-4" />
                          <span>
                            {playerMatches.length > 1
                              ? `${idx + 1}차전 경기 시작 (${match.format})`
                              : `공식 경기 시작 (${match.format})`}
                          </span>
                        </button>
                        <p className="text-[9px] text-slate-400 text-center mt-1">
                          경기 완료 후 출전 주전 선수의 체력이 -10% 차감되며,
                          대시보드에서 로스터를 재정비할 수 있습니다.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 모든 경기 종료 안내 */}
              {isCurrentWeek && allCurrentMatchesDone && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    이번 주 모든 경기가 완료되었습니다. 선수단 탭에서 로스터 및 피로도를 정비할 수 있습니다.
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* 경기가 없는 비경기 주간 안내 */
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
                🏖️
              </span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs font-black text-white">
                  공식 경기 없는 주간
                </h4>
                <p className="text-[11px] text-slate-300 leading-tight">
                  이번 주는 공식 경기 일정이 없습니다. 선수단 체력 집중 관리 및
                  훈련 스탯 성장에 집중하세요.
                </p>
              </div>
            </div>
          )}

          {/* 2. 해당 주차 추가 세부 이벤트 안내 (아이콘 리스트: 결산일, 미디어데이, 메타패치, 시상식) */}
          {detailedEvents.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📌</span>
                  <span>{selectedWeek}주차 주요 세부 일정 안내</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  총 {detailedEvents.length}개 이벤트
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {detailedEvents.map((evt, eIdx) => (
                  <div
                    key={eIdx}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs"
                  >
                    <span className="text-lg shrink-0 mt-0.5">{evt.icon}</span>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-[11px]">
                          {evt.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${evt.badgeClass}`}
                        >
                          공식 일정
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. 선수단 출전 & 훈련 체크리스트 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>선수단 출전 & 훈련 체크리스트</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                총 {players.length}명 관리 중
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {/* 체력 상태 점검 */}
              <div
                className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                  lowStaminaPlayers.length > 0
                    ? "bg-rose-950/30 border-rose-500/50 text-rose-200"
                    : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {lowStaminaPlayers.length > 0 ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-rose-300 text-[11px]">
                          체력 고갈 경고 ({lowStaminaPlayers.length}명 위험)
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 text-[11px]">
                          선수단 체력 양호 (전원 20% 초과)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {lowStaminaPlayers.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[10px] text-rose-300/90 leading-tight">
                      체력 20% 이하 선수는 경기력 급락 및 부상 위험이 높습니다.
                      '휴식' 배정 또는 로테이션을 권장합니다.
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {lowStaminaPlayers.map((p) => (
                        <span
                          key={p.profile.playerId}
                          className="px-1.5 py-0.2 rounded bg-rose-900/60 border border-rose-500/60 text-white text-[9px] font-bold"
                        >
                          {p.profile.nicknameKr || p.profile.nicknameEn} (
                          {p.contractAndRole.mainPos}) :{" "}
                          {p.conditionAndForm?.stamina ?? 0}%
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-emerald-300/80 leading-tight">
                    모든 선수가 안전 체력 구간을 유지하고 있어 경기 출전 및
                    훈련에 문제없습니다.
                  </p>
                )}
              </div>

              {/* 훈련 배정 상태 점검 */}
              <div className="p-2.5 rounded-xl border bg-slate-900/90 border-slate-700/80 text-slate-300 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <Dumbbell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[11px]">주간 훈련 배정 현황</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400">
                    훈련 {trainingPlayers.length}명 / 휴식{" "}
                    {restingPlayers.length}명
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  {unassignedPlayers.length > 0 ? (
                    <span className="text-amber-400">
                      ⚠️ 훈련 미배정 선수 {unassignedPlayers.length}명 발생!
                      [훈련] 탭에서 지정하세요.
                    </span>
                  ) : (
                    "전체 선수단의 주간 훈련 종목 및 휴식 설정이 정상 완료되었습니다."
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 4. 리그 전체 경기 보기 모드일 때 추가되는 해당 주차 전체 대진표 */}
          {filterMode === "ALL" && weekMatches.length > 1 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  리그 {divisionTier} {selectedWeek}주차 전체 대진표 (
                  {weekMatches.length}경기)
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  Bo3 / Bo5
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-0.5">
                {weekMatches.map((m, mIdx) => {
                  const hTeam = getTeamInfo(m.homeTeamId);
                  const aTeam = getTeamInfo(m.awayTeamId);

                  return (
                    <div
                      key={m.id || mIdx}
                      className="p-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-white text-[11px] truncate max-w-[90px]">
                        {hTeam.name}
                      </span>
                      <div className="font-mono font-bold text-[10px] text-amber-300">
                        {m.status === "COMPLETED" && m.result
                          ? `${m.result.homeScore} : ${m.result.awayScore}`
                          : "VS"}
                      </div>
                      <span className="font-bold text-white text-[11px] truncate max-w-[90px] text-right">
                        {aTeam.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= 모달 하단 닫기 ================= */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 font-bold text-xs transition-all cursor-pointer shadow-sm text-center"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
