type Opts<ReturnValue> = {
  optional?: boolean;
  parser?: (value: string) => ReturnValue;
  defaultValue?: ReturnValue;
};

type TupleCase = [
  string,
  Opts<unknown> | ((value: string) => unknown) | string | undefined,
];

type EnvConfig = Record<string, string | TupleCase>;

/**
 * Creates an object with the same keys as the input config,
 * but with the values from the environment variables.
 *
 * @param config - The configuration object with environment variable keys.
 * @returns An object with the same keys as the input config, but with values from the environment variables.
 */
export function requireEnv<T extends EnvConfig>(
  config: T
): {
  [K in keyof T]: T[K] extends [
    string,
    Opts<infer R> | ((value: string) => infer R),
  ]
    ? R
    : string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [key, value] of Object.entries(config)) {
    if (Array.isArray(value)) {
      result[key] = resolveTupleCase(value);
    } else {
      result[key] = requireEnvVar(value);
    }
  }

  return result;
}

function resolveTupleCase(value: TupleCase) {
  const [envVar, opts] = value;

  if (typeof opts === "string") {
    return requireEnvVar(envVar, opts);
  }

  const converter = typeof opts === "function" ? opts : opts?.parser;

  let envValue;
  let defaultValue;

  if (typeof opts === "object") {
    defaultValue = opts?.defaultValue;

    if (opts?.optional || opts?.defaultValue !== undefined) {
      envValue = process.env[envVar];
    } else {
      envValue = requireEnvVar(envVar);
    }
  } else {
    envValue = requireEnvVar(envVar);
  }

  let resolvedValue;

  if (converter) {
    try {
      resolvedValue = envValue ? converter(envValue) : defaultValue;
    } catch (error) {
      throw new Error(
        `Error resolving environment variable ${envVar}, ${error}`
      );
    }
  } else {
    resolvedValue = envValue ?? defaultValue;
  }

  return resolvedValue;
}

/**
 * Retrieves the value of an environment variable.
 *
 * @param key - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Will throw an error if the environment variable is not set.
 */
export function requireEnvVar(key: string): string;
export function requireEnvVar(key: string, defaultValue: string): string;
export function requireEnvVar(key: string, defaultValue?: string): string {
  if (!process.env[key] && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return process.env[key] ?? defaultValue!;
}

/**
 * Parses a string to a number.
 *
 * @param value - The string to parse.
 * @returns The parsed number.
 * @throws Will throw an error if the string is not a valid number.
 */
export const num = (value: string) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return num;
};

/**
 * Parses a string to a positive integer.
 *
 * @param value - The string to parse.
 * @returns The parsed positive integer.
 * @throws Will throw an error if the string is not a valid positive integer.
 */
export const positiveInteger = (value: string) => {
  const num = Number(value);
  if (isNaN(num) || num <= 0 || Math.floor(num) !== num) {
    throw new Error(`Invalid positive integer: ${value}`);
  }
  return num;
};

/**
 * Parses a string to a boolean.
 *
 * @param value - The string to parse.
 * @returns The parsed boolean.
 * @throws Will throw an error if the string is not a valid boolean.
 */
export const bool = (value: string) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Invalid boolean: ${value}`);
};
