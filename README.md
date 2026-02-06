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

### Backend
- [MEDIUM] (Ongoing) Write documentation on the README.md files. Hard to keep progress but ongoing.
- [MEDIUM] Add unit tests (integration stuff, algorithms, helpers and services.)
- [MEDIUM] Change humidity and temperature sensors to not use Xiaomi. Looking for options. Current temperature via AC is OK. Humidity isn't.
- [MEDIUM] Bathroom lights maybe (?)
- [MEDIUM] Custom Scripts for devices via EVAL (plugin system) for example runScript: {PATH_TO_SCRIPT} -> Runs that code with the device context. Allows the script to do several things like animations. Need to think of the API design for this. Actions can also trigger scripts.
- [LOW] Back-office page, manage devices and access

### Misc
- [IMPORTANT] Siri Shortcut factory via the /api/home request.
