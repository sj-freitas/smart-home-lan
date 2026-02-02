# Smart Home LAN — NestJS (backend) + React (frontend)

This repository contains a minimal full-stack application (NestJS backend + React + Vite frontend) written in TypeScript. ChatGPT was used to generate the initial scaffold, documentation and most of the UI elements. Co-pilot was also used in the coding of a few parts.
It is intended to run on your local network. The backend provides integrations with actual devices, the integrations are described in the [config.json](./config.json) file at the root.

## Project layout
- [Server](./server/README.md)
- [Client](./client/README.md)
- [Bruno Requests](./smart_home_requests/README.md)
- [Nginx Config](./host/) (Sample Config for SSL and Websockets)

## Backlog
### Client
- [MEDIUM] Add tests (collapsible flow etc.)

### Backend
- [IMPORTANT] (Ongoing) Write documentation on the README.md files. Hard to keep progress but ongoing.
- [IMPORTANT] Add retry to outbound requests - things fail, 2-3 retries with exponential backoff goes a long way to make this more resilient.
- [MEDIUM] Host it in the cloud
- [MEDIUM] Config animations for groups (not super relevant but a funny thing to do)
- [MEDIUM] Consider a scenario where the state being broadcast considers if the user is logged-in.
- [MEDIUM] Add unit tests (integration stuff, algorithms, helpers and services.)
- [Not Important] Config runtime load (create strong auth URL on POST api/config) change config's scope to REQUEST making it much more dynamic! Read is already dynamic.
- [Not Important] Login for users not in the same IP + email access management
- [Not Important] Created PerRequest Transactions for DB interactions

## Hosting using Nginx
1. Create nginx conf file (currently you can check the example here: [palais.conf](/host/palais.conf))
  1. Nginx should run here: `/opt/homebrew/etc/nginx/servers/` on Mac
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
4. Restart nginx server: `brew services restart nginx` (On Mac)

