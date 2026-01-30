# Smart Home LAN — NestJS (backend) + React (frontend)

This repository contains a minimal full-stack application (NestJS backend + React + Vite frontend) written in TypeScript. ChatGPT was used to generate the initial scaffold, documentation and most of the UI elements. Co-pilot was also used in the coding of a few parts.
It is intended to run on your local network. The backend provides integrations with actual devices, the integrations are described in the [config.json](./config.json) file at the root.

## Project layout

```
smart-home-lan/
├── config.json
├── smart_home_requests // Contains Bruno requests for development reasons
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── index.html
    ├── .env
    └── src/
```

## Notes
- Backend listens on port **3001** by default and binds to `0.0.0.0` so other devices on your local network can reach it.
- Frontend dev server runs via Vite on **5173** by default (script `npm run dev`). If you run both locally during development, you may need to configure a proxy or modify `API_BASE` in `client/src/App.tsx` to point to your server host/IP (e.g. `http://192.168.1.112:3001/api/rooms`).
- When you're ready to replace the in-memory state with real API data, update `server/src/rooms/rooms.service.ts` to fetch/persist from your API or database.

## Quick start (development)
1. Start server:
   ```bash
   cd server
   npm install
   npm run start:dev
   ```
2. Start client:
   ```bash
   cd client
   npm install
   npm run dev
   ```
3. Open the client at `http://localhost:5173`.

## Integrations
Currently there are only two working integrations:
- MEL Cloud Home (For Air Conditioning devices)
- Tuya (For Smart switches)

## Configuration
The heart of the project sits at the configuration which is the single source of truth describing all the rooms, devices and possible actions.
Integrations are also set via the config.json, it's important to not version the credentials so a simple templating system is used where the raw JSON is replaces with env vars, for example:
`... "key": "{{SOME_VALUE}}"`, a full text search is initially run that will replace `SOME_VALUE` with the existing `.env` declaration. If non exists, then an exception is thrown and the application doesn't boot-up.

## Improvement Notes
### Client
- Collapsible cards

### Backend
- Be more resilient to MEL Cloud Home API failures, they are pretty bad.
- IP Restriction (bypassable with eventual login) to only work within my LAN - IP Restriction is done!
- Websockets for automated updates
- Host it in another machine in my home
- BREAKING: Add lights integration
- config.json -> Add the presets (actions) to each device individually

## Hosting
FULL CONFIG
1. Create nginx conf file (currently you can check the example here: [palais.conf](/host/palais.conf))
2. Make sure that the router is pointing to the correct address (very important)
3. Create the SSL certs
  1. Install certbot
  2. Add the sudo access to the cert bot managed folders
    1. Run the following commands
```bash
sudo mkdir -p /opt/homebrew/var/www/.well-known/acme-challenge
sudo chown -R $(whoami) /opt/homebrew/var/www
```
  3. Run
```bash
sudo certbot certonly \
--webroot \
-w /opt/homebrew/var/www \
-d palais-freitas.xyz \
-d www.palais-freitas.xyz
```
4. Restart nginx server

