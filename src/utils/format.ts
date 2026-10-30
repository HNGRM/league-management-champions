export interface EokCurrencyParts {
  integer: string;   // 예: "0", "10", "4", "34"
  decimal: string;   // 예: "45", "00", "80", "65" (항상 소수점 2자리)
  unit: string;      // "억 원"
  full: string;      // 예: "0.45억 원", "10.00억 원", "34.65억 원"
}

/**
 * 금액(원)을 소수점 둘째 자리 억 원 단위로 분할하여 반환
 * 최저 단위: 100만 원 (0.01억 원)
 * 예: 45,000,000 -> { integer: "0", decimal: "45", unit: "억 원", full: "0.45억 원" }
 * 예: 1,000,000,000 -> { integer: "10", decimal: "00", unit: "억 원", full: "10.00억 원" }
 * 예: 3,465,000,000 -> { integer: "34", decimal: "65", unit: "억 원", full: "34.65억 원" }
 */
export const formatEokParts = (amount: number): EokCurrencyParts => {
  const isNegative = (amount || 0) < 0;
  const absValue = Math.abs(amount || 0);
  const eokValue = absValue / 100_000_000;
  const fixed = eokValue.toFixed(2);
  const [integerPart, decimal] = fixed.split(".");
  const integer = isNegative ? `-${integerPart}` : integerPart;
  return {
    integer,
    decimal,
    unit: "억 원",
    full: `${isNegative ? "-" : ""}${fixed}억 원`,
  };
};

/**
 * 억 원 단위 문자열 반환 (예: "0.45억 원", "10.00억 원", "34.65억 원")
 */
export const formatEok = (amount: number): string => {
  return formatEokParts(amount).full;
};

/**
 * 하위 호환용 통화 포맷터 (nn.nn억 원 형태로 통일 표기)
 */
export const formatKoreanCurrency = (amount: number): string => {
  return formatEok(amount);
};

/**
 * 게임 내 모든 통화 표기 - nn.nn억 원 단위 통일 (소수점 2자리 고정)
 * 예: 3,465,000,000 -> "34.65억 원"
 *     500,000,000   -> "5.00억 원"
 *     80,000,000    -> "0.80억 원"
 */
export const formatKoreanMoney = (amount: number): string => {
  return formatEok(amount);
};

/**
 * 요약 보조 텍스트용 억 단위 표기 (nn.nn억 원 통일)
 */
export const formatShortEok = (amount: number): string => {
  return formatEok(amount);
};
