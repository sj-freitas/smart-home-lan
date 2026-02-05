# Smart Home LAN — NestJS (backend) + React (frontend)
A server to integrate with your home devices. The LAN initial idea isn't really being done here, as I preferred a cloud approach but the same principle can be used.
The reason was that Xiaomi removed LAN control of some of the devices.

## Project layout
- [Server](./server/README.md)
- [Client](./client/README.md)
- [Bruno Requests](./smart_home_requests/README.md)

## Backlog
### Client
- [MEDIUM] Add tests (collapsible flow etc.)
- [IMPORTANT] Add Auth to the client

### Backend
- [EASY] Created PerRequest Transactions for DB interactions
- [IMPORTANT] Add API Key support for the requests (This allows Siri requests to bypass login and JWT)
- [IMPORTANT] Login for users not in the same IP + email access management

- [MEDIUM] Consider a scenario where the state being broadcast considers if the user is logged-in.
- [MEDIUM] (Ongoing) Write documentation on the README.md files. Hard to keep progress but ongoing.
- [MEDIUM] Add unit tests (integration stuff, algorithms, helpers and services.)
- [MEDIUM] Config animations for groups (not super relevant but a funny thing to do)
- [Not Important] Config runtime load (create strong auth URL on POST api/config) change config's scope to REQUEST making it much more dynamic! Read is already dynamic.

