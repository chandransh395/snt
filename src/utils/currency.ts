
/**
 * Formats a number as a rupees amount.
 * @param amount - The amount to format.
 * @returns The formatted amount.
 */
export function formatPrice(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return 'Invalid amount';
  }
  
  // Format as Indian Rupee
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
  
  return formattedAmount;
}

/**
 * Formats a number as a price with "From" prefix.
 * @param amount - The amount to format.
 * @returns The formatted price with "From" prefix.
 */
export function formatPriceWithFrom(amount: number | string): string {
  return `From ${formatPrice(amount)}`;
}
