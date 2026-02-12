# Getting Started

The UI is built using Vite and uses React. Everything is written in Typescript.

The frontend works in a similar way to HATEOAS (although not entirely the same). The main principle is that the API feeds a state from `/api/home` which is fed from the
config file. The sample config file is [here](../server/config.json). The UI will know how to render Rooms (collapsible cards) and Devices (rows).
Each device has a set of presets (actions) which will be rendered as buttons with a state, showing the current preset.
API Calls to any action will follow `/api/actions/{roomId}/{deviceId}/{actionId}`.

## Env Vars

Vite uses a `.env` naming convention:

- `.env.local`: Sets the local development env vars. `VITE_APP_ENV="development"`
- `.env.production`: Sets the production development env vars: `VITE_APP_ENV="production"`
- `VITE_API_HOSTNAME:` The API hostname, locally should be `"http://localhost:3001/api"`
- `VITE_GOOGLE_CLIENT_ID:` The Client Id for authentication. This flow can be bypassed if the API has AUTH_ALWAYS_DISALLOW_THE_IP set to "false".

## Auth

The application requests a GET: `curl '<VITE_API_HOSTNAME>/api/auth/check'` to make sure that the user has access to the API.
This request can return a 401, the app handles the login via GoogleAuth, 403, the app shows the state but should run in ReadOnly mode. 200, all the actions can be executed normally.
The login is handled by Google by redirecting the page to the login page, once the flow is complete the API will set a `session` cookie. The API will persist the cookies
in the database. So the client doesn't need to handle any of the session logic as long as the `credentials` are sent to the API.

To test locally the VITE_GOOGLE_CLIENT_ID can be set but you'll need to create a GoogleAuth Client.

## Building and Running

To run locally simply do `npm run dev` and it loads the `.env.local` file.
To run in production:

- Build using `npm run build:prod`
- Run using `npm run preview`

The application is designed to be hosted via the NestJS API, you can see more on the [Server's Dockerfile](../server/dockerfile).
