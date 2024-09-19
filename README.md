# Require Env

Allows you to easily create config objects from environment variables.

Values are required by default.

E.g getting DB credentials:

```ts
const config = requireEnv({
  host: "DB_HOST",
  user: "DB_USER",
  password: "DB_PASS",
  database: "DB_NAME",
  port: ["DB_PORT", positiveInteger],
});
```

## Install

```
npm install @nathan.kramer/require-env
```

## Usage

### Getting a single value

```ts
import { requireEnvVar } from '@nathan.kramer/require-env';

const value = requireEnvVar("SOME_ENV_VAR");
```

### Creating a config object

```ts
import { requireEnv } from '@nathan.kramer/require-env';

const config = requireEnv({
  someString: "REQUIRED_STRING_VALUE",
  someNum: ["REQUIRED_NUMBER_VALUE", parseInt],
  someOptionalValue: ["OPTIONAL_VALUE", { optional: true }],
  valueWithDefault: ["VALUE_WITH_DEFAULT", "default value"],
});
```

### Built-in parsers for convenience

These are just for convenience. They will error on invalid values.

```ts
import { requireEnv, num, bool, positiveInteger } from '@nathan.kramer/require-env';

const config = requireEnv({
  someNum: ["REQUIRED_NUMBER_VALUE", num],
  somePositiveInteger: ["REQUIRED_POSITIVE_INTEGER_VALUE", positiveInteger],
  someBool: ["REQUIRED_BOOLEAN_VALUE", bool],
});
```

### Default values

```ts
import { requireEnvVar } from '@nathan.kramer/require-env';

const value = requireEnvVar("SOME_ENV_VAR", "default value");
```

```ts
import { requireEnv } from '@nathan.kramer/require-env';

const config = requireEnv({
  someValue: ["SOME_VALUE", "default value"],
  someOtherValue: ["SOME_INT", { parser: parseInt, defaultValue: 123 }],
});
```
