# Getting Started
UI is built using Vite and React. Everything is written in Typescript.

The frontend works in a similar way to HATEOAS (although not entirely the same). The main principle is that the API feeds a state on `/api/home` which is fed from the
config file. The sample config file is [here](../server/config.json). The UI will now how to render Rooms (collpasable cards) and Devices (rows).
Each device has a set of presets (actions) which will be rendered as buttons with a state, showing the current preset.
API Calls to any action will follow `/api/actions/{roomId}/{deviceId}/{actionId}`.

## Env Vars
Vite uses a `.env` naming convention: 
- `.env.local`: Sets the local development env vars. `VITE_APP_ENV="development"`
- `.env.production`: Sets the production development env vars: `VITE_APP_ENV="production"`
- `VITE_API_HOSTNAME:` The API hostname, locally should be `"http://localhost:3001/api"`

## Building and Running
To run locally simply do `npm run dev` and it loads the `.env.local` file.
To run in production:
- Build using `npm run build:prod`
- Run using `npm run preview`
