# Smart Home Management

_This can run on LAN but it's currently designed for the Cloud as well._

A server that integrates with your home's devices. The main goal of this project is to let your home's guests use your smart devices without logging in or downloading any apps, as long as they are inside your home.
Another motivation is to restrict the control users' have when managing the devives. Instead of having to set the AC mode, temperature, etc they only need to press a Heat or Cool button.
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

- [MEDIUM] State consolidation refactor. Make it so that the state is generate by different types and consolidated into a single object that is stored in the DB and successive state reads will check this state:
    - This makes the application do less polling requests
    - Better support for webhooks
    - Better loading performance
- [MEDIUM] Humidity and Temperature sensor integration.
- [MEDIUM] Add proper logging
- [MEDIUM] Add unit tests (integration stuff, algorithms, helpers and services.)
- [MEDIUM] Custom Scripts for devices via EVAL (plugin system) for example runScript: {PATH_TO_SCRIPT} -> Runs that code with the device context. Allows the script to do several things like animations. Need to think of the API design for this. Actions can also trigger scripts.
- [LOW] Back-office page, manage devices and access
