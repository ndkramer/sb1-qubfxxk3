// Debounce function to limit the rate at which a function can fire
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): { (...args: Parameters<T>): void; cancel?: () => void } {
  let timeout: NodeJS.Timeout;

  const debouncedFn = function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  debouncedFn.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debouncedFn;
};