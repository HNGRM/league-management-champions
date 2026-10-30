export interface EokCurrencyParts {
  integer: string;   // 예: "0", "10", "4"
  decimal: string;   // 예: "45", "00", "80" (항상 소수점 2자리)
  unit: string;      // "억원"
  full: string;      // 예: "0.45억원", "10.00억원"
}

/**
 * 금액(원)을 소수점 둘째 자리 억 원 단위로 분할하여 반환
 * 최저 단위: 100만 원 (0.01억 원)
 * 예: 45,000,000 -> { integer: "0", decimal: "45", unit: "억원", full: "0.45억원" }
 * 예: 1,000,000,000 -> { integer: "10", decimal: "00", unit: "억원", full: "10.00억원" }
 */
export const formatEokParts = (amount: number): EokCurrencyParts => {
  const eokValue = (amount || 0) / 100_000_000;
  const fixed = eokValue.toFixed(2);
  const [integer, decimal] = fixed.split(".");
  return {
    integer,
    decimal,
    unit: "억원",
    full: `${fixed}억원`,
  };
};

/**
 * 억 원 단위 문자열 반환 (예: "0.45억원", "10.00억원")
 */
export const formatEok = (amount: number): string => {
  return formatEokParts(amount).full;
};

/**
 * 하위 호환용 통화 포맷터 (0.00억원 형태로 통일 표기)
 */
export const formatKoreanCurrency = (amount: number): string => {
  return formatEok(amount);
};
