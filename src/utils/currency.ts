
/**
 * Format a number as Indian Rupees (INR)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatINR = (
  amount: number, 
  options: { 
    decimals?: number, 
    showSymbol?: boolean,
    showCode?: boolean
  } = {}
): string => {
  const { 
    decimals = 0, 
    showSymbol = true,
    showCode = false
  } = options;
  
  // Format with Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  let formatted = formatter.format(amount);
  
  // Remove symbol if not required
  if (!showSymbol) {
    formatted = formatted.replace(/[₹]/g, '').trim();
  }
  
  // Add ISO code if required
  if (showCode) {
    formatted = `${formatted}${showSymbol ? ' ' : ''}INR`;
  }
  
  return formatted;
};
