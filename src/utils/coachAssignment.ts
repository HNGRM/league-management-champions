import { Coach, CoachRole } from "@/types/coach";

export type CoachRoleCode = "ING" | "ANA" | "TRN" | "MNG" | "SCT" | "UNA";

export interface CoachRoleMeta {
  role: CoachRole;
  statKey: "ingame" | "analysis" | "training" | "managing" | "scouting";
  code: CoachRoleCode;
  order: number;
  description: string;
}

export const COACH_ROLES_META: CoachRoleMeta[] = [
  {
    role: "인게임 코치",
    statKey: "ingame",
    code: "ING",
    order: 1,
    description: "인게임 밴픽 및 오더 보정",
  },
  {
    role: "분석 코치",
    statKey: "analysis",
    code: "ANA",
    order: 2,
    description: "메타 분석 및 전력 리포트",
  },
  {
    role: "훈련 코치",
    statKey: "training",
    code: "TRN",
    order: 3,
    description: "선수 스탯 훈련 및 숙련도 성장",
  },
  {
    role: "관리 코치",
    statKey: "managing",
    code: "MNG",
    order: 4,
    description: "체력/의욕 관리 및 컨디션 케어",
  },
  {
    role: "스카우트 코치",
    statKey: "scouting",
    code: "SCT",
    order: 5,
    description: "유망주 발굴 및 협상력",
  },
];

export const ROLE_CODE_ORDER: Record<CoachRoleCode, number> = {
  ING: 1,
  ANA: 2,
  TRN: 3,
  MNG: 4,
  SCT: 5,
  UNA: 6,
};

export function getCoachRoleMeta(role: CoachRole | string | null | undefined): {
  code: CoachRoleCode;
  label: string;
  order: number;
  isAssigned: boolean;
} {
  switch (role) {
    case "인게임 코치":
      return { code: "ING", label: "인게임 코치", order: 1, isAssigned: true };
    case "분석 코치":
    case "전력분석 코치":
      return { code: "ANA", label: "분석 코치", order: 2, isAssigned: true };
    case "훈련 코치":
      return { code: "TRN", label: "훈련 코치", order: 3, isAssigned: true };
    case "관리 코치":
    case "팀 관리 코치":
      return { code: "MNG", label: "관리 코치", order: 4, isAssigned: true };
    case "스카우트 코치":
    case "스카우터":
      return { code: "SCT", label: "스카우트 코치", order: 5, isAssigned: true };
    default:
      return { code: "UNA", label: "미배정 코치", order: 6, isAssigned: false };
  }
}

/**
 * 5대 전담 보직 자동 배정(Auto-Assign) 알고리즘
 * 1. 1인 1보직 원칙
 * 2. 최적 매칭: 각 보직에 대해 해당 스탯이 가장 높은 코치를 중복 없이 1:1 매칭
 * 3. 동률 처리: 스탯이 같다면 영문 닉네임(nicknameEn) 알파벳 오름차순(A -> Z) 우선권
 * 4. 인원수 예외:
 *    - 5명 미만: 스탯이 우수한 보직부터 채우고 남은 보직은 공석 처리
 *    - 5명 초과: 5대 보직을 채우고 남은 코치들은 미배정(role: null)
 */
export function autoAssignCoachRoles(coaches: Coach[]): Coach[] {
  if (!coaches || coaches.length === 0) return [];

  interface CandidatePair {
    coachId: string;
    nicknameEn: string;
    role: CoachRole;
    roleIndex: number;
    statVal: number;
  }

  const pairs: CandidatePair[] = [];
  coaches.forEach((coach) => {
    COACH_ROLES_META.forEach((meta, roleIndex) => {
      pairs.push({
        coachId: coach.profile.coachId,
        nicknameEn: coach.profile.nicknameEn,
        role: meta.role,
        roleIndex,
        statVal: coach.stats[meta.statKey],
      });
    });
  });

  // 정렬: 스탯 내림차순 -> 닉네임 오름차순(A->Z) -> 보직 순서
  pairs.sort((a, b) => {
    if (b.statVal !== a.statVal) {
      return b.statVal - a.statVal;
    }
    const nameCmp = a.nicknameEn.localeCompare(b.nicknameEn);
    if (nameCmp !== 0) {
      return nameCmp;
    }
    return a.roleIndex - b.roleIndex;
  });

  const assignedCoachIds = new Set<string>();
  const assignedRoles = new Set<CoachRole>();
  const roleToCoachMap = new Map<CoachRole, string>();

  for (const pair of pairs) {
    if (!assignedCoachIds.has(pair.coachId) && !assignedRoles.has(pair.role)) {
      assignedCoachIds.add(pair.coachId);
      assignedRoles.add(pair.role);
      roleToCoachMap.set(pair.role, pair.coachId);

      if (
        assignedRoles.size === COACH_ROLES_META.length ||
        assignedCoachIds.size === coaches.length
      ) {
        break;
      }
    }
  }

  return coaches.map((coach) => {
    let assignedRole: CoachRole | null = null;
    for (const [role, coachId] of roleToCoachMap.entries()) {
      if (coachId === coach.profile.coachId) {
        assignedRole = role;
        break;
      }
    }

    return {
      ...coach,
      contractAndRole: {
        ...coach.contractAndRole,
        role: assignedRole,
      },
    };
  });
}

/**
 * 코치 목록을 고정 렌더링 순서에 따라 정렬:
 * 1. [ING] 인게임 코치
 * 2. [ANA] 분석 코치
 * 3. [TRN] 훈련 코치
 * 4. [MNG] 관리 코치
 * 5. [SCT] 스카우트 코치
 * 6. [UNA] 미배정 코치 (종합 OVR 내림차순 -> 닉네임 오름차순)
 */
export function sortCoachesByRoleOrder(coaches: Coach[]): Coach[] {
  return [...coaches].sort((a, b) => {
    const metaA = getCoachRoleMeta(a.contractAndRole?.role);
    const metaB = getCoachRoleMeta(b.contractAndRole?.role);

    if (metaA.order !== metaB.order) {
      return metaA.order - metaB.order;
    }

    // 같은 보직이거나 둘 다 미배정인 경우: 종합 OVR 내림차순, 닉네임 오름차순
    const sumA =
      a.stats.ingame +
      a.stats.analysis +
      a.stats.training +
      a.stats.managing +
      a.stats.scouting;
    const sumB =
      b.stats.ingame +
      b.stats.analysis +
      b.stats.training +
      b.stats.managing +
      b.stats.scouting;
    if (sumB !== sumA) {
      return sumB - sumA;
    }
    return a.profile.nicknameEn.localeCompare(b.profile.nicknameEn);
  });
}
