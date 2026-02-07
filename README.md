# Smart Home Management

_This can run on LAN but it's currently designed for the Cloud as well._
A server to integrate with your home devices. The main design principle is to not require any user within your home to login and download to several different apps but instead having a centralized location.
Another motivation is to restrict the control a user has on the devices, instead of having to set the AC mode, temperature, etc they only need to press a Heat or Cool button.
The whole system is highly modifiable with a config file as the source of truth, see more on [config file section](./server/README.md#Config).

## Project layout

- [Server](./server/README.md)
- [Client](./client/README.md)
- [Bruno Requests](./smart_home_requests/README.md)

## Backlog

These are used internally to track development features. Can move these to a better tool within Github.

### Client

- [MEDIUM] Add tests (collapsible flow etc.)

### Backend

- [IMPORTANT] Test token flows
- [MEDIUM] Add unit tests (integration stuff, algorithms, helpers and services.)
- [MEDIUM] Change humidity and temperature sensors to not use Xiaomi. Looking for options. Current temperature via AC is OK. Humidity isn't.
- [MEDIUM] Custom Scripts for devices via EVAL (plugin system) for example runScript: {PATH_TO_SCRIPT} -> Runs that code with the device context. Allows the script to do several things like animations. Need to think of the API design for this. Actions can also trigger scripts.
- [LOW] Back-office page, manage devices and access

### Misc

- [IMPORTANT] Siri Shortcut factory via the /api/home request.
