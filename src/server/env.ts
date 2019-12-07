export function getPositiveIntEnv(key: string, defaultValue: string): number {
  const value = process.env[key] || defaultValue;
  const numValue = parseInt(value);
  if (isNaN(numValue) || numValue <= 0) {
    throw new Error(`The environment variable ${key} must be a positive integer!`);
  }
  return numValue;
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`The environment variable ${key} must be non-empty!`);
  }

  return value;
}
