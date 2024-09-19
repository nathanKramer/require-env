# Require Env

Allows you to easily create config objects from environment variables.

Values are required by default.

```ts
import { requireEnv, num, bool } from 'require-env';

const config = requireEnv({
  someString: "REQUIRED_STRING_VALUE",
  someNum: ["REQUIRED_NUMBER_VALUE", num],
  someBool: ["REQUIRED_BOOLEAN_VALUE", bool],
  someOptionalValue: ["OPTIONAL_VALUE", { parser: bool, optional: true }],
})
```

E.g getting postgres credentials:

```ts
const config = requireEnv({
  host: "DB_HOST",
  user: "DB_USER",
  password: "DB_PASS",
  database: "DB_NAME",
  port: ["DB_PORT", num],
})

