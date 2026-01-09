export const PRICING_CATALOG: Record<string, number> = {
  DATA_PACK_10GB: 299,
  DATA_PACK_20GB: 499,
  DATA_PACK_50GB: 999,
  VOICE_PLAN_100MIN: 199,
  VOICE_PLAN_UNLIMITED: 399,
  SMS_PACK_1000: 99,
  SMS_PACK_5000: 399,
};

export function getPrice(sku: string): number | null {
  return PRICING_CATALOG[sku] ?? null;
}
