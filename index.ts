type Opts = {
  optional?: boolean;
  parser?: (value: string) => unknown;
};
type EnvConfig = Record<
  string,
  string | [string, Opts | ((value: string) => unknown) | undefined]
>;

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
    { parser: (value: string) => infer R } | ((value: string) => infer R),
  ]
    ? R
    : string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  for (const [key, value] of Object.entries(config)) {
    if (Array.isArray(value)) {
      const [envVar, opts] = value;

      const converter = typeof opts === "function" ? opts : opts?.parser;

      let envValue;

      if (typeof opts === "object" && opts?.optional) {
        envValue = process.env[envVar];
      } else {
        envValue = requireEnvVar(envVar);
      }

      let resolvedValue;

      if (converter) {
        try {
          resolvedValue = envValue ? converter(envValue) : undefined;
        } catch (error) {
          throw new Error(
            `Error resolving environment variable ${envVar}, ${error}`
          );
        }
      } else {
        resolvedValue = envValue;
      }

      result[key] = resolvedValue;
    } else {
      result[key] = requireEnvVar(value);
    }
  }

  return result;
}

/**
 * Retrieves the value of an environment variable.
 *
 * @param key - The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws Will throw an error if the environment variable is not set.
 */
export const requireEnvVar = (key: string) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return process.env[key];
};

export const num = (value: string) => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return num;
};

export const bool = (value: string) => {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Invalid boolean: ${value}`);
};
