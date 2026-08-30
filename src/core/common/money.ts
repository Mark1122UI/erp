/**
 * Precise currency & money math utilities (cents-based arithmetic)
 */

export const Money = {
  // Convert dollars/euros/units to cents integer
  toCents(amount: number): number {
    return Math.round((Number(amount) || 0) * 100);
  },

  // Convert cents integer back to standard 2-decimal rounded number
  fromCents(cents: number): number {
    return Number((cents / 100).toFixed(2));
  },

  // Add numbers safely
  add(a: number, b: number): number {
    return this.fromCents(this.toCents(a) + this.toCents(b));
  },

  // Subtract numbers safely
  subtract(a: number, b: number): number {
    return this.fromCents(this.toCents(a) - this.toCents(b));
  },

  // Multiply number by factor safely
  multiply(amount: number, factor: number): number {
    return this.fromCents(Math.round(this.toCents(amount) * factor));
  },

  // Calculate percentage (e.g. tax or discount)
  percentage(amount: number, ratePercent: number): number {
    return this.fromCents(Math.round((this.toCents(amount) * ratePercent) / 100));
  },

  // Format currency for display
  format(amount: number, currency: string = 'USD'): string {
    const val = Number(amount) || 0;
    return `${currency} ${val.toFixed(2)}`;
  },
};
