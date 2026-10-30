"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  Wallet,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Handshake,
  Sparkles,
  CheckCircle2,
  Building2,
  Ticket,
  Award,
  UserPlus,
  UserMinus,
  Wrench,
  AlertTriangle,
  Landmark,
} from "lucide-react";
import { Team } from "@/types/game";
import { Player } from "@/types/player";
import { Coach } from "@/types/coach";
import { calculateTeamValueBreakdown } from "@/utils/contractEconomics";
import { formatKoreanMoney } from "@/utils/format";

interface MyTeamFinanceViewProps {
  team: Team | null;
  players: Player[];
  coaches?: Coach[];
}

interface FinanceLineItem {
  id: string;
  label: string;
  amount: number;
  displayAmount: string;
  icon: React.ComponentType<{ className?: string }>;
}

const INCOME_ITEMS: FinanceLineItem[] = [
  {
    id: "sponsor",
    label: "스폰서 지원금",
    amount: 150_000_000,
    displayAmount: "+1.50억 원",
    icon: Handshake,
  },
  {
    id: "ticket_goods",
    label: "홈경기 티켓 & 굿즈 판매",
    amount: 80_000_000,
    displayAmount: "+0.80억 원",
    icon: Ticket,
  },
  {
    id: "prize",
    label: "대회 순위 상금",
    amount: 50_000_000,
    displayAmount: "+0.50억 원",
    icon: Award,
  },
  {
    id: "transfer_out",
    label: "선수·코치 매각(이적료)",
    amount: 40_000_000,
    displayAmount: "+0.40억 원",
    icon: UserMinus,
  },
];

const EXPENSE_ITEMS: FinanceLineItem[] = [
  {
    id: "salary",
    label: "선수·코치 연봉",
    amount: 160_000_000,
    displayAmount: "-1.60억 원",
    icon: Wallet,
  },
  {
    id: "transfer_in",
    label: "선수·코치 영입(이적료)",
    amount: 40_000_000,
    displayAmount: "-0.40억 원",
    icon: UserPlus,
  },
  {
    id: "facility",
    label: "시설 유지비",
    amount: 20_000_000,
    displayAmount: "-0.20억 원",
    icon: Wrench,
  },
  {
    id: "penalty",
    label: "계약해지 위약금",
    amount: 10_000_000,
    displayAmount: "-0.10억 원",
    icon: AlertTriangle,
  },
];

export default function MyTeamFinanceView({
  team,
  players,
}: MyTeamFinanceViewProps) {
  // 팀 가치 산정 (선수단 총 시장가치 + 보유 현금 + 팬덤 가치)
  const { rosterValue, cashBalance, fandomValue, totalValue } = useMemo(
    () => calculateTeamValueBreakdown(team, players),
    [team, players]
  );

  // 수입 / 지출 합계 및 이번 시즌 예상 결산 차액
  const totalIncome = useMemo(
    () => INCOME_ITEMS.reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const totalExpense = useMemo(
    () => EXPENSE_ITEMS.reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const netProfit = totalIncome - totalExpense;
  const isSurplus = netProfit >= 0;

  return (
    <div className="flex flex-col gap-3 pb-6 select-none animate-in fade-in duration-200">
      {/* ================= 1. 팀 추정 가치 통합 카드 (3대 세부 탭 포함) ================= */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-slate-800/90 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
        {/* 배경 네온 글로우 */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 🏆 팀 추정 가치 상단 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
              팀 추정 가치
            </span>
          </div>

          <span className="text-base sm:text-lg font-black text-amber-300 font-mono tracking-tight shrink-0">
            {formatKoreanMoney(totalValue)}
          </span>
        </div>

        {/* 팀 추정 가치 3대 세부 탭 (선수단 가치 / 총 보유 자금 / 팬덤 자산) */}
        <div className="flex flex-col gap-2 relative z-10">
          {/* 세부 1: 선수단 가치 */}
          <div className="rounded-xl bg-slate-950/75 border border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300 truncate">
                선수단 가치
              </span>
            </div>
            <span className="text-sm font-extrabold text-indigo-300 font-mono shrink-0">
              {formatKoreanMoney(rosterValue)}
            </span>
          </div>

          {/* 세부 2: 총 보유 자금 */}
          <div className="rounded-xl bg-slate-950/75 border border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300 truncate">
                총 보유 자금
              </span>
            </div>
            <span className="text-sm font-extrabold text-cyan-300 font-mono shrink-0">
              {formatKoreanMoney(cashBalance)}
            </span>
          </div>

          {/* 세부 3: 팬덤 자산 */}
          <div className="rounded-xl bg-slate-950/75 border border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-300 truncate">
                팬덤 자산
              </span>
            </div>
            <span className="text-sm font-extrabold text-rose-300 font-mono shrink-0">
              {formatKoreanMoney(fandomValue)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= 2. 이번 시즌 예상 결산 통합 카드 ================= */}
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 border border-slate-800/90 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        {/* 📊 이번 시즌 예상 결산 상단 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                isSurplus
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400"
              }`}
            >
              {isSurplus ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
              이번 시즌 예상 결산
            </span>
          </div>

          <span
            className={`text-xs sm:text-sm font-extrabold font-mono shrink-0 ${
              isSurplus ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {isSurplus
              ? `흑자 (+${formatKoreanMoney(netProfit)} 예상)`
              : `적자 (-${formatKoreanMoney(Math.abs(netProfit))} 예상)`}
          </span>
        </div>

        {/* 하위 1: 이번 시즌 수입 요약 (4개 세부 탭 포함) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-200 truncate">
                이번 시즌 수입 요약
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[11px] shrink-0">
              총수입 +{formatKoreanMoney(totalIncome)}
            </span>
          </div>

          {/* 4대 수입 세부 항목 */}
          <div className="flex flex-col gap-1.5">
            {INCOME_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="px-3 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800/70 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-300 font-mono shrink-0">
                    {item.displayAmount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하위 2: 이번 시즌 지출 요약 (4개 세부 탭 포함) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/70 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-200 truncate">
                이번 시즌 지출 요약
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono font-bold text-[11px] shrink-0">
              총지출 -{formatKoreanMoney(totalExpense)}
            </span>
          </div>

          {/* 4대 지출 세부 항목 */}
          <div className="flex flex-col gap-1.5">
            {EXPENSE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="px-3 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800/70 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-300 truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-300 font-mono shrink-0">
                    {item.displayAmount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 3. 메인 스폰서 센터 카드 ================= */}
      <div className="bg-gradient-to-br from-slate-900/90 via-indigo-950/25 to-slate-950/95 border border-indigo-500/35 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-200">
              메인 스폰서 센터
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>MAIN SPONSOR</span>
          </span>
        </div>

        {/* 스폰서 상세 명세 */}
        <div className="flex flex-col gap-2 relative z-10">
          {/* 스폰서명 */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-indigo-500/25 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">스폰서명</span>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs sm:text-sm font-extrabold text-white">
                넥서스 테크 (IT 기업)
              </span>
            </div>
          </div>

          {/* 기본 지원금 */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">기본 지원금</span>
            <span className="text-xs font-bold text-cyan-300 font-mono">
              연간 1.20억 원
            </span>
          </div>

          {/* 스폰서 효과 */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400 shrink-0">
              스폰서 효과
            </span>
            <span className="text-xs font-semibold text-indigo-300 truncate">
              전자기기 지원 (선수 컨디션 +5%)
            </span>
          </div>

          {/* 성과금 조건 */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400 shrink-0">
              성과금 조건
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate">
              스프링 플레이오프 진출 시
            </span>
          </div>

          {/* 성과금 보너스 */}
          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-emerald-300/90 shrink-0">
              성과금 보너스
            </span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-300 font-mono">
                +0.50억 원 (진행 중)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
