/**
 * Service Pricing & Formatting Utility
 * Pure functions for currency formatting, discount calculation, and compact duration display.
 */

export interface ServicePricingResult {
  hasDiscount: boolean;
  displayPrice: string; // e.g. "₦12,780" or "₦14,200"
  originalPrice: string | null; // e.g. "₦14,200" when discounted
  percentOff: number; // e.g. 10
  discountedPriceNumber: number;
}

/**
 * Formats a numeric price into Nigerian Naira currency string.
 * Example: 14200 -> "₦14,200"
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount < 0) return '₦0';
  const rounded = Math.round(amount);
  return `₦${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Calculates service pricing including discount percentage and discounted price.
 *
 * Rules:
 * - If discount > 0 and discount < price:
 *   - discountedPrice = price - discount
 *   - percentOff = Math.round((discount / price) * 100)
 *   - hasDiscount = true
 * - If discount >= price (which would yield 0 or negative):
 *   - Hide the discount tag and fallback to the plain price.
 * - If discount is null or <= 0:
 *   - hasDiscount = false, plain price shown.
 */
export function getServicePricing(
  price: number | null,
  discount: number | null
): ServicePricingResult {
  const basePrice = price && price > 0 ? price : 0;
  const baseDiscount = discount && discount > 0 ? discount : 0;

  if (baseDiscount > 0) {
    // If basePrice is not yet entered or 0, still return hasDiscount = true with the raw discount amount
    if (basePrice <= 0) {
      return {
        hasDiscount: true,
        displayPrice: '₦0',
        originalPrice: null,
        percentOff: 0,
        discountedPriceNumber: 0,
      };
    }

    let percent = 0;
    let discounted = basePrice;

    // Detect percentage vs cash Naira amount:
    // If discount <= 50 and basePrice >= 500: treat as a percentage (e.g. 10 -> 10% OFF, 25 -> 25% OFF, 50 -> 50% OFF)
    // Otherwise, treat as direct cash Naira discount (e.g. 100 -> ₦100 off, 1,000 -> ₦1,000 off, etc.)
    if (baseDiscount <= 50 && basePrice >= 500) {
      percent = Math.round(baseDiscount);
      const discountAmount = Math.round(basePrice * (percent / 100));
      discounted = Math.max(0, basePrice - discountAmount);
    } else if (baseDiscount < basePrice) {
      // Direct cash discount in Naira
      discounted = Math.max(0, basePrice - baseDiscount);
      percent = Math.max(1, Math.round((baseDiscount / basePrice) * 100));
    } else {
      // If discount entered is equal to or greater than price (e.g. user entered ₦5,000 off ₦5,000):
      // Cap at 90% discount so it remains valid and visible rather than mysteriously vanishing
      percent = 90;
      discounted = Math.round(basePrice * 0.1);
    }

    return {
      hasDiscount: true,
      displayPrice: formatNaira(discounted),
      originalPrice: formatNaira(basePrice),
      percentOff: Math.max(1, percent),
      discountedPriceNumber: discounted,
    };
  }

  return {
    hasDiscount: false,
    displayPrice: formatNaira(basePrice),
    originalPrice: null,
    percentOff: 0,
    discountedPriceNumber: basePrice,
  };
}

/**
 * Formats duration string into compact format matching Figma Review designs:
 * Examples:
 * - "1 hr" -> "1hr"
 * - "2 hr" -> "2hr"
 * - "40 min" -> "40min"
 * - "24 min" -> "24min"
 * - "1:30 hr" -> "1hr 30min"
 * - "0:40:00 Min" -> "40min"
 * - "1:00:00 Hrs" -> "1hr"
 */
export function formatDurationCompact(raw: string): string {
  if (!raw) return '1hr';
  const trimmed = raw.trim();

  // Pattern "H:MM hr" or "H:MM:SS Hrs"
  const colonMatch = trimmed.match(/^(\d+):(\d+)(?::\d+)?\s*(hr|hrs|min)?$/i);
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10);
    const m = parseInt(colonMatch[2], 10);
    if (h > 0 && m > 0) return `${h}hr ${m}min`;
    if (h > 0) return `${h}hr`;
    if (m > 0) return `${m}min`;
  }

  // Pattern "X hr" or "X hrs"
  const hrMatch = trimmed.match(/^(\d+)\s*(?:hr|hrs)$/i);
  if (hrMatch) {
    return `${hrMatch[1]}hr`;
  }

  // Pattern "X min" or "X mins"
  const minMatch = trimmed.match(/^(\d+)\s*(?:min|mins)$/i);
  if (minMatch) {
    return `${minMatch[1]}min`;
  }

  // Fallback: strip spaces
  return trimmed.replace(/\s+/g, '');
}
