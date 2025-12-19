/**
 * Sanitizes a string to make it safe for use as a CSS selector/ID
 * Removes or replaces characters that are invalid in CSS selectors
 */
export function sanitizeForSelector(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace invalid chars with underscore
    .replace(/^[0-9]/, '_$&')         // Prefix if starts with number
    .slice(0, 100);                    // Limit length for safety
}

/**
 * Generates a safe, unique ID from a potentially unsafe string
 */
export function generateSafeId(input: string, prefix: string = 'id'): string {
  const sanitized = sanitizeForSelector(input);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${sanitized}-${timestamp}`;
}
