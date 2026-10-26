// 1500000 -> "₦1,500,000"
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
