import { supabase } from "./supabase";
import { SaveSlot } from "@/types/game";

export interface CloudSaveRow {
  id: string;
  user_id: string;
  slot_number: number;
  save_title: string;
  game_year: number;
  game_week: number;
  team_name: string | null;
  game_data: any;
  updated_at: string;
}

/**
 * 로그인한 유저의 세이브 슬롯 8개 목록을 DB에서 조회합니다.
 */
export async function fetchUserSlots(userId: string): Promise<SaveSlot[]> {
  try {
    const { data, error } = await supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", userId)
      .order("slot_number", { ascending: true });

    if (error) {
      console.error("[SaveManager] 세이브 슬롯 조회 실패:", error);
      return Array.from({ length: 8 }, (_, index) => ({
        id: index + 1,
        isCreated: false,
        isLocked: index !== 0,
      }));
    }

    const savedMap = new Map<number, CloudSaveRow>();
    (data || []).forEach((row: CloudSaveRow) => {
      savedMap.set(row.slot_number, row);
    });

    // 8개 슬롯 생성 (기존 슬롯이 채워지면 다음 슬롯 해금)
    const result: SaveSlot[] = [];
    for (let i = 1; i <= 8; i++) {
      const saved = savedMap.get(i);
      if (saved) {
        result.push({
          id: i,
          isCreated: true,
          isLocked: false,
          team: saved.game_data?.currentTeam,
          managerProfile: saved.game_data?.managerProfile,
          customTeamInfo: saved.game_data?.customTeamInfo,
          selectedLeague: saved.game_data?.selectedLeague,
          selectedTeam: saved.game_data?.selectedTeam,
          myPlayers: saved.game_data?.myPlayers,
          leagueDivisions: saved.game_data?.leagueDivisions,
          currentDivision: saved.game_data?.currentDivision || "D",
          currentYear: saved.game_year || saved.game_data?.currentYear || 2027,
          currentWeek: saved.game_week || saved.game_data?.currentWeek || 1,
          activeMatchIndex: saved.game_data?.activeMatchIndex || 0,
          seasonSchedule: saved.game_data?.seasonSchedule || [],
          facilities: saved.game_data?.facilities,
          lastPlayedAt: saved.updated_at,
        });
      } else {
        // 첫 번째 슬롯이거나 바로 앞 슬롯이 생성되어 있으면 해금
        const isPrevCreated = i === 1 || savedMap.has(i - 1);
        result.push({
          id: i,
          isCreated: false,
          isLocked: !isPrevCreated,
        });
      }
    }

    return result;
  } catch (err) {
    console.error("[SaveManager] 슬롯 조회 중 예외 발생:", err);
    return Array.from({ length: 8 }, (_, index) => ({
      id: index + 1,
      isCreated: false,
      isLocked: index !== 0,
    }));
  }
}

/**
 * 8개 슬롯의 연속 잠금 상태를 재계산 (이전 슬롯이 생성되어 있어야 다음 슬롯 해금)
 */
export function recalculateSlotLocks(slots: SaveSlot[]): SaveSlot[] {
  return slots.map((slot, index) => {
    if (slot.isCreated) {
      return { ...slot, isLocked: false };
    }
    const isFirst = index === 0;
    const prevSlot = index > 0 ? slots[index - 1] : null;
    const isPrevCreated = isFirst || (prevSlot?.isCreated ?? false);
    return {
      ...slot,
      isLocked: !isPrevCreated,
    };
  });
}

/**
 * 현재 게임 상태를 지정된 슬롯에 클라우드 저장(Upsert)합니다.
 */
export async function saveGameToCloud(
  userId: string,
  slotNumber: number,
  saveTitle: string,
  gameYear: number,
  gameWeek: number,
  teamName: string,
  gameState: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      user_id: userId,
      slot_number: slotNumber,
      save_title: saveTitle,
      game_year: gameYear,
      game_week: gameWeek,
      team_name: teamName,
      game_data: gameState,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("game_saves")
      .upsert(payload, { onConflict: "user_id,slot_number" });

    if (error) {
      console.error("[SaveManager] 클라우드 저장 실패:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[SaveManager] 저장 중 예외 발생:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 특정 슬롯의 세이브 데이터를 불러옵니다.
 */
export async function loadGameFromCloud(
  userId: string,
  slotNumber: number
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("game_saves")
      .select("game_data")
      .eq("user_id", userId)
      .eq("slot_number", slotNumber)
      .single();

    if (error || !data) {
      console.error("[SaveManager] 세이브 불러오기 실패:", error);
      return { success: false, error: error?.message || "데이터 없음" };
    }

    return { success: true, data: data.game_data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 슬롯 삭제/초기화
 */
export async function deleteGameFromCloud(
  userId: string,
  slotNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("game_saves")
      .delete()
      .eq("user_id", userId)
      .eq("slot_number", slotNumber);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
