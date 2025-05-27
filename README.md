![Vemetric Node SDK](https://github.com/user-attachments/assets/846a7c6b-206b-4c85-bfbd-c4a7c3cb6a3a)

# The Vemetric SDK for Node.js, Bun and Deno

Learn more about the Vemetric Node.js SDK in the [official docs](https://vemetric.com/docs/sdks/nodejs).

You can also checkout the [NPM Package](https://www.npmjs.com/package/@vemetric/node).

## Installation

```bash
npm install @vemetric/node
```

## Usage

```ts
import { Vemetric } from '@vemetric/node';

const vemetric = new Vemetric({
  token: 'YOUR_PROJECT_TOKEN',
});

// Track an event
await vemetric.trackEvent('MyCustomEvent', {
  userIdentifier: 'user-id',
  eventData: { key: 'value' },
});

// Update user data
await vemetric.updateUser({
  userIdentifier: 'user-id',
  userData: {
    set: { key1: 'value1' },
    setOnce: { key2: 'value2' },
    unset: ['key3'],
  },
});
```

## Configuration

The client can be configured with the following options:

```ts
const vemetric = new Vemetric({
  token: 'YOUR_PROJECT_TOKEN', // Required
  host: 'https://hub.vemetric.com', // Optional, defaults to https://hub.vemetric.com
});
```
