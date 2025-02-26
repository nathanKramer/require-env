import { requireEnv, requireEnvVar, num, bool, positiveInteger } from "./index";

describe("requireEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return string values for simple config", () => {
    process.env.TEST_VAR = "test_value";
    const config = requireEnv({ testVar: "TEST_VAR" });
    expect(config).toEqual({ testVar: "test_value" });
  });

  it("should convert values using provided converter functions", () => {
    process.env.TEST_NUMBER = "42";
    const config = requireEnv({
      testNumber: ["TEST_NUMBER", (value: string) => parseInt(value, 10)],
    });
    expect(config).toEqual({ testNumber: 42 });
  });

  it("should convert values using provided converter functions with opts", () => {
    process.env.TEST_NUMBER = "42";
    const config = requireEnv({
      testNumber: [
        "TEST_NUMBER",
        { parser: (value: string) => parseInt(value, 10) },
      ],
    });
    expect(config).toEqual({ testNumber: 42 });
  });

  it("should handle optional values", () => {
    process.env.TEST_NUMBER = "42";
    const config = requireEnv({
      testNumber: [
        "TEST_NUMBER",
        { parser: (value: string) => parseInt(value, 10), optional: true },
      ],
    });
    expect(config).toEqual({ testNumber: 42 });
  });

  it("should handle multiple config entries", () => {
    process.env.TEST_STRING = "hello";
    process.env.TEST_BOOLEAN = "true";
    const config = requireEnv({
      testString: "TEST_STRING",
      testBoolean: [
        "TEST_BOOLEAN",
        { parser: (value: string) => value === "true" },
      ],
    });
    expect(config).toEqual({ testString: "hello", testBoolean: true });
  });

  it("should throw an error if an environment variable is not set", () => {
    expect(() => requireEnv({ missingVar: "MISSING_VAR" })).toThrow(
      "Environment variable MISSING_VAR is not set"
    );
  });
});

describe("requireEnvVar", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return the value of an existing environment variable", () => {
    process.env.EXISTING_VAR = "existing_value";
    expect(requireEnvVar("EXISTING_VAR")).toBe("existing_value");
  });

  it("should throw an error if the environment variable is not set", () => {
    expect(() => requireEnvVar("NON_EXISTENT_VAR")).toThrow(
      "Environment variable NON_EXISTENT_VAR is not set"
    );
  });

  it("should throw an error if a converter fails", () => {
    process.env.INVALID_NUM = "not_a_number";

    const config = {
      invalidNum: ["INVALID_NUM", { parser: num }] as [
        string,
        { parser: (value: string) => number },
      ],
    };

    expect(() => requireEnv(config)).toThrow(
      "Error resolving environment variable INVALID_NUM, Error: Invalid number: not_a_number"
    );
  });

  describe("default values", () => {
    it("should support shorthand default values", () => {
      process.env.TEST_VALUE = undefined;
      const config = requireEnv({
        testValue: ["TEST_VALUE", "Foo"],
      });
      expect(config).toEqual({ testValue: "Foo" });
    });

    it("should use the environment variable value when set", () => {
      process.env.TEST_VALUE = "Bar";
      const config = requireEnv({
        testValue: ["TEST_VALUE", { defaultValue: "Foo" }],
      });
      expect(config).toEqual({ testValue: "Bar" });
    });

    it("should use a default value when the environment variable is not set", () => {
      process.env.TEST_VALUE = undefined;
      const config = requireEnv({
        testValue: ["TEST_VALUE", { defaultValue: "Foo" }],
      });
      expect(config).toEqual({ testValue: "Foo" });
    });

    it("should support default values with parsers", () => {
      process.env.TEST_NUMBER = undefined;
      const config = requireEnv({
        testNumber: ["TEST_NUMBER", { defaultValue: 3000, parser: num }],
      });
      expect(config).toEqual({ testNumber: 3000 });
    });

    it("should use the environment variable value if present when parsing", () => {
      process.env.TEST_NUMBER = "42";
      const config = requireEnv({
        testNumber: ["TEST_NUMBER", { defaultValue: 3000, parser: num }],
      });
      expect(config).toEqual({ testNumber: 42 });
    });
  });
});

describe("num", () => {
  it("should convert a valid number string to a number", () => {
    expect(num("42")).toBe(42);
    expect(num("-3.14")).toBe(-3.14);
  });

  it("should throw an error for invalid number strings", () => {
    expect(() => num("not_a_number")).toThrow("Invalid number: not_a_number");
  });
});

describe("positiveInteger", () => {
  it("should convert a valid positive integer string to a number", () => {
    expect(positiveInteger("42")).toBe(42);
  });

  it("should throw an error for non-integer strings", () => {
    expect(() => positiveInteger("42.353")).toThrow(
      "Invalid positive integer: 42.353"
    );
  });

  it("should throw an error for non-integer strings", () => {
    expect(() => positiveInteger("-42")).toThrow(
      "Invalid positive integer: -42"
    );
  });

  it("should throw an error for invalid positive integer strings", () => {
    expect(() => positiveInteger("not_a_positive_integer")).toThrow(
      "Invalid positive integer: not_a_positive_integer"
    );
  });
});

describe("bool", () => {
  it('should convert "true" to true', () => {
    expect(bool("true")).toBe(true);
  });

  it('should convert "false" to false', () => {
    expect(bool("false")).toBe(false);
  });

  it("should throw an error for invalid boolean strings", () => {
    expect(() => bool("not_a_boolean")).toThrow(
      "Invalid boolean: not_a_boolean"
    );
  });
});
