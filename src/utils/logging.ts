const sanitizeForLog = (value: any): any => {
  if (typeof value === 'string') {
    return value
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .substring(0, 1000);
  }
  if (typeof value === 'object' && value !== null) {
    const sanitized: any = Array.isArray(value) ? [] : {};
    for (const key in value) {
      sanitized[key] = sanitizeForLog(value[key]);
    }
    return sanitized;
  }
  return value;
};

export const logAction = (action: string, element: string, details: any) => {
  try {
    const sanitizedDetails = sanitizeForLog(details);
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: sanitizeForLog(action),
      element: sanitizeForLog(element),
      state: JSON.parse(JSON.stringify(sanitizedDetails)),
    };
    console.log('HMAP_LOG:', logEntry);
  } catch (error) {
    console.error('Error during logging:', error);
  }
};
