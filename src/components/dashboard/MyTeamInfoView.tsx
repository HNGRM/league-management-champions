"use client";

import React, { useMemo } from "react";
import {
  Shield,
  Trophy,
  Users,
  Building2,
  Swords,
  Wallet,
  Award,
  Sparkles,
  Handshake,
  UserCheck,
} from "lucide-react";
import { Team, PredefinedTeam, ManagerProfile } from "@/types/game";
import { Player, Position } from "@/types/player";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { createDefaultAvatarDna } from "@/types/avatar";
import { getTeamLogo } from "@/data/teamLogos";
import { PREDEFINED_TEAMS } from "@/data/teams";
import { calculatePlayerOvr, autoAssignPlayerRoles } from "@/utils/playerAssignment";
import { useGameStore } from "@/store/useGameStore";

interface MyTeamInfoViewProps {
  team: Team | null;
  predefinedTeam: PredefinedTeam | null;
  managerProfile: ManagerProfile;
  players: Player[];
  league?: string;
}

const POSITIONS: Position[] = ["TOP", "JGL", "MID", "BOT", "SUP"];

export default function MyTeamInfoView({
  team,
  predefinedTeam,
  managerProfile,
  players,
  league,
}: MyTeamInfoViewProps) {
  const customTeamInfo = useGameStore((state) => state.customTeamInfo);
  const currentDivision = useGameStore((state) => state.currentDivision);

  // 팀 정보 매핑 및 폴백
  const activeLeague = league || predefinedTeam?.league || "KCL";
  const matchedPredefined = useMemo(() => {
    return predefinedTeam || PREDEFINED_TEAMS.find((t) => t.id === team?.id) || null;
  }, [predefinedTeam, team?.id]);

  const teamNameKo =
    customTeamInfo.nameKo || team?.name || matchedPredefined?.nameKo || "나의 팀";
  const teamNameEn =
    customTeamInfo.nameEn || matchedPredefined?.nameEn || "My Team";
  const teamShortName =
    customTeamInfo.shortName || team?.shortName || matchedPredefined?.shortName || "NEW";

  const teamLogoUrl =
    customTeamInfo.customLogoUrl ||
    (team?.id ? getTeamLogo(team.id) : null) ||
    (matchedPredefined?.id ? getTeamLogo(matchedPredefined.id) : null);

  const cityName = matchedPredefined?.city || "서울";
  const homeArena = `${cityName} 아레나`;
  const divisionText = `${activeLeague} 디비전 ${currentDivision || "D"}`;

  // 감독 이름 및 나이
  const managerNameEn = managerProfile.nameEn?.trim() || managerProfile.name || "DIRECTOR";
  const managerNameKo = managerProfile.nameKo?.trim() || "감독";
  const managerFullName = `${managerNameEn} (${managerNameKo})`;
  const managerAge = managerProfile.age || 32;

  // 언어 텍스트 표기
  const languagesText = useMemo(() => {
    if (!managerProfile.languages || managerProfile.languages.length === 0) {
      return `${activeLeague} (모국어)`;
    }
    const [first, second] = managerProfile.languages;
    if (!second) {
      return `${first} (모국어)`;
    }
    return `${first} (모국어) · ${second} (제2외국어)`;
  }, [managerProfile.languages, activeLeague]);

  // 5개 라인 주전 전력 분석 (TOP -> JGL -> MID -> BOT -> SUP)
  const lineup = useMemo(() => {
    const hasStarter = players.some((p) => p.contractAndRole?.rosterStatus === "Starter");
    const effectivePlayers = hasStarter ? players : autoAssignPlayerRoles(players);

    return POSITIONS.map((pos) => {
      let player = effectivePlayers.find(
        (p) => p.contractAndRole?.rosterStatus === "Starter" && p.contractAndRole?.mainPos === pos
      );
      if (!player) {
        player = effectivePlayers.find((p) => p.contractAndRole?.mainPos === pos);
      }

      if (player) {
        const ovr = calculatePlayerOvr(player);
        return {
          pos,
          player,
          nickname: player.profile.nicknameEn,
          nameKo: player.profile.nicknameKr,
          ovr,
          age: player.profile.age,
          isFilled: true,
        };
      }

      return {
        pos,
        player: null,
        nickname: "-",
        nameKo: "공석",
        ovr: 0,
        age: 0,
        isFilled: false,
      };
    });
  }, [players]);

  // 팀 주전 종합 전력 및 평균 나이 계산
  const filledStarters = useMemo(() => lineup.filter((item) => item.isFilled), [lineup]);

  const teamAvgOvr = useMemo(() => {
    if (filledStarters.length === 0) return 0;
    const sum = filledStarters.reduce((acc, curr) => acc + curr.ovr, 0);
    return Math.round(sum / filledStarters.length);
  }, [filledStarters]);

  const teamAvgAge = useMemo(() => {
    if (filledStarters.length === 0) return "0.0";
    const sum = filledStarters.reduce((acc, curr) => acc + curr.age, 0);
    return (sum / filledStarters.length).toFixed(1);
  }, [filledStarters]);

  return (
    <div className="flex flex-col gap-3 pb-6 select-none animate-in fade-in duration-200">
      {/* ================= 1. 팀 프로필 & 감독 프로필 카드 ================= */}
      <div className="flex flex-col gap-2.5">
        {/* 팀 기본 브랜딩 카드 */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800/90 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          {/* 배경 은은한 네온 글로우 */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            {/* 팀 로고 */}
            {teamLogoUrl ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-cyan-400/50 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <img
                  src={teamLogoUrl}
                  alt={teamNameKo}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 border border-cyan-400/50 flex items-center justify-center shrink-0 font-mono font-black text-sm text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                {teamShortName}
              </div>
            )}

            {/* 팀 명칭 및 세부 태그 */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  {teamNameKo}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[10px] shrink-0">
                  {teamShortName}
                </span>
              </div>

              <span className="text-xs text-slate-400 font-mono truncate">
                {teamNameEn}
              </span>

              {/* 리그/디비전 및 스폰서 뱃지 행 */}
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 font-bold text-[10px] flex items-center gap-1 shrink-0 shadow-sm">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{divisionText}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[10px] font-medium flex items-center gap-1 shrink-0">
                  <Handshake className="w-3 h-3 text-slate-500" />
                  <span>스폰서 없음</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 감독(Manager) 프로필 요약 카드 */}
        <div className="bg-slate-900/85 border border-indigo-500/30 rounded-2xl p-3.5 flex gap-3.5 items-center relative overflow-hidden shadow-sm">
          {/* 상단 우측 감독 직책 표기 */}
          <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[9px] font-bold font-mono tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>HEAD COACH</span>
          </div>

          {/* 감독 아바타 */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0 flex items-center justify-center relative">
            <AvatarRenderer
              dna={managerProfile.faceDna || createDefaultAvatarDna()}
              teamId={team?.id || matchedPredefined?.id}
              league={activeLeague}
              size="100%"
              className="w-full h-full"
            />
            {/* 좌상단 감독 뱃지 */}
            <div className="absolute top-0 left-0 px-2 py-0.5 rounded-br-xl backdrop-blur-md border-r border-b border-indigo-400/70 bg-indigo-950/95 text-indigo-300 font-bold text-[10px] tracking-tight shadow-md">
              감독
            </div>
          </div>

          {/* 감독 상세 스펙 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            {/* 1열: 이름, 나이 */}
            <div className="flex items-center gap-1.5 min-w-0 pr-20">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate font-mono">
                {managerFullName}
              </span>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                {managerAge}세
              </span>
            </div>

            {/* 2열: 명성 및 언어 */}
            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono flex-wrap">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Award className="w-3 h-3 text-amber-400 shrink-0" />
                <span>명성 50</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-300 font-medium truncate">
                {languagesText}
              </span>
            </div>

            {/* 3열: 감독 성향 3종 태그 (전술, 재정, 선수 관리) */}
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/60 text-slate-300 text-[9px] font-medium flex items-center gap-1">
                <Swords className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{managerProfile.tactics || "공격적"}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/60 text-slate-300 text-[9px] font-medium flex items-center gap-1">
                <Wallet className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span>{managerProfile.finance || "신중함"}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/60 text-slate-300 text-[9px] font-medium flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                <span>{managerProfile.playerManagement || "유연함"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. 5개 라인 수직 전력 막대 바 (Lineup Power Bars) ================= */}
      <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        {/* 상단 종합 지표 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-200">
                5개 라인 주전 전력 분석
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                주전 5인 선발 라인업
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold text-xs font-mono shadow-sm">
              팀 전력: {teamAvgOvr} OVR
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium text-[11px] font-mono">
              평균 {teamAvgAge}세
            </span>
          </div>
        </div>

        {/* 5개 수직 기둥 바 차트 (TOP | JGL | MID | BOT | SUP) */}
        <div className="grid grid-cols-5 gap-2 items-end pt-1">
          {lineup.map((item) => {
            // OVR 티어별 색상 분기
            // 75+ : 시안/에메랄드
            // 65~74 : 블루/인디고
            // 64 이하 : 앰버/오렌지
            let ovrTextColor = "text-amber-400";
            let gaugeGradient =
              "bg-gradient-to-t from-amber-700 via-amber-600 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]";

            if (item.ovr >= 75) {
              ovrTextColor = "text-cyan-300";
              gaugeGradient =
                "bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]";
            } else if (item.ovr >= 65) {
              ovrTextColor = "text-indigo-300";
              gaugeGradient =
                "bg-gradient-to-t from-blue-700 via-indigo-600 to-cyan-500 shadow-[0_0_10px_rgba(99,102,241,0.35)]";
            }

            return (
              <div
                key={item.pos}
                className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
              >
                {/* 상단 OVR 수치 */}
                <span
                  className={`text-xs font-black font-mono tracking-tight ${
                    item.isFilled ? ovrTextColor : "text-slate-500"
                  }`}
                >
                  {item.isFilled ? item.ovr : "-"}
                </span>

                {/* 수직 바 트랙 (0~100 스케일 게이지) */}
                <div className="w-full h-28 sm:h-32 bg-slate-950/90 rounded-xl border border-slate-800/80 p-1 flex flex-col justify-end relative overflow-hidden">
                  {/* 보조 기준선 (50%, 75%) */}
                  <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-800/40 pointer-events-none" />
                  <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-800/40 pointer-events-none" />

                  {/* 게이지 바 */}
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ease-out relative ${gaugeGradient}`}
                    style={{
                      height: item.isFilled
                        ? `${Math.min(100, Math.max(8, item.ovr))}%`
                        : "0%",
                    }}
                  >
                    {/* 상단 은은한 빛 반사 */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg" />
                  </div>
                </div>

                {/* 라인 포지션 배지 */}
                <div className="px-1.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-[10px] font-bold font-mono text-slate-300 text-center w-full shadow-sm">
                  {item.pos}
                </div>

                {/* 주전 선수 영문 닉네임 */}
                <div
                  className="text-[10px] font-bold text-white font-mono truncate text-center w-full"
                  title={item.nickname}
                >
                  {item.nickname}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 3. 팬덤 및 위상 요약 (Fandom & Reputation) ================= */}
      <div className="grid grid-cols-3 gap-2">
        {/* 팬덤 (서포터즈) */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-[10px] font-medium">팬덤 (서포터즈)</span>
          </div>
          <div className="text-sm font-bold text-white font-mono tracking-tight truncate">
            {team?.fans ? `${team.fans.toLocaleString()}명` : "15,000명"}
          </div>
          <span className="text-[9px] text-slate-500 font-mono truncate">
            열성 서포터즈
          </span>
        </div>

        {/* 홈구장 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[10px] font-medium">홈구장</span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight truncate">
            {homeArena}
          </div>
          <span className="text-[9px] text-slate-500 font-mono truncate">
            연고지 {cityName}
          </span>
        </div>

        {/* 팀 명성 */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between gap-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-medium">팀 명성</span>
          </div>
          <div className="text-sm font-bold text-amber-300 font-mono tracking-tight flex items-center gap-1">
            <span>{team?.reputation || 25}</span>
            <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono truncate">
            디비전 {currentDivision || "D"} 기준
          </span>
        </div>
      </div>
    </div>
  );
}
