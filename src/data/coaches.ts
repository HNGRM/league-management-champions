import { Coach } from "@/types/coach";
import coachesData from "./coaches.json";

export const COACHES: Coach[] = coachesData as Coach[];

// 리그별 코치 목록
export const KCL_COACHES: Coach[] = COACHES.filter((c) => c.contractAndRole.teamId?.startsWith("KCL-"));
export const CCL_COACHES: Coach[] = COACHES.filter((c) => c.contractAndRole.teamId?.startsWith("CCL-"));
export const ECL_COACHES: Coach[] = COACHES.filter((c) => c.contractAndRole.teamId?.startsWith("ECL-"));
export const ACL_COACHES: Coach[] = COACHES.filter((c) => c.contractAndRole.teamId?.startsWith("ACL-"));
export const PCL_COACHES: Coach[] = COACHES.filter((c) => c.contractAndRole.teamId?.startsWith("PCL-"));

// 팀 ID별 소속 코치 목록
export const COACHES_BY_TEAM: Record<string, Coach[]> = COACHES.reduce(
  (acc, coach) => {
    const teamId = coach.contractAndRole.teamId;
    if (!teamId) return acc;
    if (!acc[teamId]) {
      acc[teamId] = [];
    }
    acc[teamId].push(coach);
    return acc;
  },
  {} as Record<string, Coach[]>
);

export function getCoachesByTeamId(teamId: string): Coach[] {
  return COACHES_BY_TEAM[teamId] || [];
}

export default COACHES;
