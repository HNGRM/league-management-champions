"use client";

import React from "react";
import {
  MatchSchedule,
  SeasonPhase,
  SEASON_PHASE_METAS,
} from "@/types/schedule";
import { TeamStanding } from "@/types/game";
import { Player } from "@/types/player";
import { getChampionById } from "@/data/champions";
import {
  Shield,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Swords,
  Plane,
  Home,
  Sparkles,
  Users,
  Dumbbell,
} from "lucide-react";

interface ScheduleMatchDetailPanelProps {
  selectedWeek: number;
  weekMatches: MatchSchedule[];
  playerMatch?: MatchSchedule;
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
}

export default function ScheduleMatchDetailPanel({
  selectedWeek,
  weekMatches,
  playerMatch,
  playerTeam,
  divisionTeams,
  divisionTier = "D",
  facilityArenaLevel,
  facilityArenaName,
  players,
  filterMode,
}: ScheduleMatchDetailPanelProps) {
  const match = playerMatch || weekMatches[0];
  const phase = match?.phase || "SPRING_SEASON";
  const phaseMeta = SEASON_PHASE_METAS[phase];

  // 상대 팀 및 홈/원정 정보 조회
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

  const isMatchWeek =
    match && (match.matchType === "REGULAR" || match.matchType === "PLAYOFF" || match.matchType === "PROMOTION");

  const homeTeam = isMatchWeek ? getTeamInfo(match.homeTeamId) : null;
  const awayTeam = isMatchWeek ? getTeamInfo(match.awayTeamId) : null;
  const opponentTeam = match?.isHome ? awayTeam : homeTeam;

  // 예상 관중 수 계산
  const baseCapacity = [0, 1400, 2800, 5600, 11000, 22000][facilityArenaLevel] || 1400;
  const estimatedAttendance = Math.round(baseCapacity * 0.92);

  // 로스터 체력 위험 선수 (체력 20% 이하)
  const lowStaminaPlayers = players.filter((p) => (p.conditionAndForm?.stamina ?? 100) <= 20);
  const restingPlayers = players.filter(
    (p) => p.trainingAssignment?.trainingType === "REST"
  );
  const trainingPlayers = players.filter(
    (p) =>
      p.trainingAssignment?.trainingType &&
      p.trainingAssignment.trainingType !== "REST"
  );
  const unassignedPlayers = players.filter((p) => !p.trainingAssignment?.trainingType);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl backdrop-blur-sm">
      {/* 1. 상단 섹션 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
            W{selectedWeek}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">
                {match ? `${match.month}월 ${match.monthWeek}주차 상세 정보` : `${selectedWeek}주차 상세 정보`}
              </h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${phaseMeta.badgeClass}`}>
                {phaseMeta.icon} {phaseMeta.nameKr}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isMatchWeek ? `${match.format} 공식 매치업 프리뷰` : match?.eventName || "주간 공식 일정"}
            </p>
          </div>
        </div>

        {/* 매치 상태 배지 */}
        {match && (
          <div className="flex items-center gap-2">
            {match.status === "COMPLETED" && match.result ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                경기 완료 ({match.result.homeScore} : {match.result.awayScore})
              </span>
            ) : isMatchWeek ? (
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {match.format} 예정 매치
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                공식 이벤트 주간
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. 메인 콘텐츠: 매치 주간 vs 이벤트/휴식 주간 */}
      {isMatchWeek && homeTeam && awayTeam ? (
        <div className="flex flex-col gap-3">
          {/* (1) 매치 프리뷰 대진 그래픽 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
            {/* 홈 vs 원정 그래픽 */}
            <div className="grid grid-cols-9 items-center py-2">
              {/* 홈 팀 */}
              <div className="col-span-4 flex flex-col items-center gap-2 text-center">
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-slate-700/80 p-2 flex items-center justify-center shadow-md overflow-hidden">
                    {homeTeam.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  {homeTeam.isPlayer && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] shadow">
                      MY
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {homeTeam.rank}위
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px]">
                      {homeTeam.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">[홈팀]</span>
                </div>
              </div>

              {/* VS 배지 및 스코어 */}
              <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                {match.status === "COMPLETED" && match.result ? (
                  <div className="flex flex-col items-center">
                    <div className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider">
                      {match.result.homeScore} : {match.result.awayScore}
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      종료
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-amber-400 shadow-inner">
                      VS
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{match.format}</span>
                  </div>
                )}
              </div>

              {/* 원정 팀 */}
              <div className="col-span-4 flex flex-col items-center gap-2 text-center">
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-slate-700/80 p-2 flex items-center justify-center shadow-md overflow-hidden">
                    {awayTeam.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  {awayTeam.isPlayer && (
                    <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] shadow">
                      MY
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px]">
                      {awayTeam.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {awayTeam.rank}위
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">[원정팀]</span>
                </div>
              </div>
            </div>

            {/* 장소 및 경기장 안내 배너 */}
            <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs px-2">
              <div className="flex items-center gap-2 text-slate-300">
                {match.isHome ? (
                  <>
                    <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <Home className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-medium text-emerald-200">우리 팀 홈경기</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 text-[11px]">
                      경기장: 홈 경기장 Lv.{facilityArenaLevel} ({facilityArenaName})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="p-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      <Plane className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-medium text-blue-200">원정 경기</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 text-[11px]">
                      {opponentTeam?.name || "상대팀"} 홈 경기장 방문
                    </span>
                  </>
                )}
              </div>

              {match.isHome && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold shrink-0">
                  예상 관중: {estimatedAttendance.toLocaleString()}명
                </span>
              )}
            </div>
          </div>

          {/* (2) 상대 팀 핵심 경계 챔피언 TOP 3 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-slate-200">
                  {opponentTeam?.name} 핵심 경계 챔피언 TOP 3
                </h4>
              </div>
              <span className="text-[10px] text-rose-400 font-mono font-bold">주의 대상</span>
            </div>

            {/* 3개 챔피언 초상화 그리드 */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {(match.cautionChampions || ["001", "002", "003"]).map((champId, idx) => {
                const champ = getChampionById(champId);
                const tagColor =
                  idx === 0
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : idx === 1
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/40";
                const tagText = idx === 0 ? "1순위 경계" : idx === 1 ? "주력 픽" : "조커 픽";

                return (
                  <div
                    key={champId}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${tagColor}`}>
                      {tagText}
                    </span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                      {champ?.images?.portrait ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={champ.images.portrait}
                          alt={champ.nameKr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                          {champId}
                        </div>
                      )}
                    </div>
                    <div className="text-center min-w-0 w-full">
                      <p className="text-[11px] font-bold text-white truncate">
                        {champ?.nameKr || `챔피언 #${champId}`}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {champ?.positions?.[0] || "ALL"} · {champ?.primaryRole || "딜러"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-tight">
              밴픽 전략 시 해당 챔피언들의 선점 또는 밴 카드를 우선 검토하세요.
            </p>
          </div>
        </div>
      ) : (
        /* 이벤트 / 비경기 주간 안내 */
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-900/40 via-purple-900/30 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {match?.eventIcon || phaseMeta.icon}
          </div>
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-black text-white truncate">
                {match?.eventName || `${selectedWeek}주차 공식 이벤트`}
              </h4>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${phaseMeta.badgeClass}`}>
                {phaseMeta.nameKr}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {match?.eventDescription || phaseMeta.description}
            </p>
            <div className="flex items-center gap-1 pt-0.5 text-[10px] text-cyan-400">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">감독 권장: 체력 집중 관리 및 훈련 극대화</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. 구단 체크리스트 안내 (체력 고갈 경고 & 훈련 배정 상태) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>선수단 출전 & 훈련 체크리스트</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            총 {players.length}명 관리 중
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* 체력 상태 점검 */}
          <div
            className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
              lowStaminaPlayers.length > 0
                ? "bg-rose-950/30 border-rose-500/50 text-rose-200"
                : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {lowStaminaPlayers.length > 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-rose-300">
                      체력 고갈 경고 ({lowStaminaPlayers.length}명 위험)
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">선수단 체력 양호 (전원 20% 초과)</span>
                  </>
                )}
              </div>
            </div>

            {lowStaminaPlayers.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-rose-300/90 leading-relaxed">
                  체력 20% 이하 선수는 경기력 급락 및 부상 위험이 높습니다. '휴식' 배정을 권장합니다.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lowStaminaPlayers.map((p) => (
                    <span
                      key={p.profile.playerId}
                      className="px-2 py-0.5 rounded-md bg-rose-900/60 border border-rose-500/60 text-white text-[10px] font-bold"
                    >
                      {p.profile.nicknameKr || p.profile.nicknameEn} ({p.contractAndRole.mainPos}) : {p.conditionAndForm?.stamina ?? 0}%
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                모든 선수가 안전 체력 구간을 유지하고 있어 경기 및 고강도 훈련 수행에 문제없습니다.
              </p>
            )}
          </div>

          {/* 훈련 배정 상태 점검 */}
          <div className="p-3 rounded-xl border bg-slate-900/90 border-slate-700/80 text-slate-300 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>주간 훈련 배정 현황</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                훈련 {trainingPlayers.length}명 / 휴식 {restingPlayers.length}명
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {unassignedPlayers.length > 0 ? (
                <span className="text-amber-400">
                  ⚠️ 훈련 미배정 선수 {unassignedPlayers.length}명 발생! [훈련] 탭에서 종목을 지정하세요.
                </span>
              ) : (
                "전체 선수단의 주간 훈련 종목 및 휴식 설정이 정상 완료되었습니다."
              )}
            </p>

            <div className="flex items-center gap-2 pt-1 text-[10px] font-mono">
              <span className="text-slate-400">
                집중 훈련: <strong className="text-cyan-300">{trainingPlayers.length}명</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">
                휴식 회복: <strong className="text-emerald-300">{restingPlayers.length}명</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 리그 전체 경기 보기 모드일 때 추가되는 해당 주차 전체 대진표 */}
      {filterMode === "ALL" && weekMatches.length > 1 && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              리그 {divisionTier} {match?.month}월 {match?.monthWeek}주차 전체 대진표 ({weekMatches.length}경기)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Bo3 라운드 로빈</span>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            {weekMatches.map((m, idx) => {
              const hTeam = getTeamInfo(m.homeTeamId);
              const aTeam = getTeamInfo(m.awayTeamId);
              const isMine = m.isPlayerMatch;

              return (
                <div
                  key={m.id || idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                    isMine
                      ? "bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      : "bg-slate-900/60 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-white truncate max-w-[70px]">
                      {hTeam.name}
                    </span>
                    {isMine && m.homeTeamId === playerTeam.id && (
                      <span className="text-[8px] font-black px-1 rounded bg-cyan-500 text-slate-950">MY</span>
                    )}
                  </div>

                  <div className="text-center font-mono font-bold text-xs shrink-0">
                    {m.status === "COMPLETED" && m.result ? (
                      <span className="text-amber-300">
                        {m.result.homeScore} : {m.result.awayScore}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">VS</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 min-w-0 justify-end">
                    {isMine && m.awayTeamId === playerTeam.id && (
                      <span className="text-[8px] font-black px-1 rounded bg-cyan-500 text-slate-950">MY</span>
                    )}
                    <span className="text-[11px] font-bold text-white truncate max-w-[70px] text-right">
                      {aTeam.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
