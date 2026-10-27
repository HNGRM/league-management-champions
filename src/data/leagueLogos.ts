// League Logo Image Path Mapping for League Management: Champions
import { LeagueLanguage } from "@/types/game";

export const LEAGUE_LOGOS: Record<LeagueLanguage, string> = {
  KCL: "/img/league logo/kcl_logo.jpg",
  CCL: "/img/league logo/ccl_logo.jpg",
  ECL: "/img/league logo/ecl_logo.jpg",
  ACL: "/img/league logo/acl_logo.jpg",
  PCL: "/img/league logo/pcl_logo.jpg",
};

export function getLeagueLogo(leagueCode?: LeagueLanguage | string | null): string | null {
  if (!leagueCode) return null;
  return LEAGUE_LOGOS[leagueCode as LeagueLanguage] || null;
}
