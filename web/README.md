# web (AlgoRace client)

The React client for **AlgoRace**, a multiplayer data structures and algorithms practice
platform — solve problems solo, or race a friend in a shared lobby with live updates.

This is the client only. It talks to the services alongside it in this repo — see
[the top-level README](../README.md) for the overall architecture.

## Run it

```bash
npm install
npm start
```

Serves on `http://localhost:3000`. The backends it expects are configured in
`src/config/constants.js` and overridable by environment:

| Variable | Default | Service |
| --- | --- | --- |
| `REACT_APP_BASE_URL` | `:8080` | [User service](../services/user-service) — auth, lobbies, problems |
| `REACT_APP_SOCKET_URL` | `:8000` | [Socket server](../services/socket-server) — live lobby state |
| `REACT_APP_MANAGER_URL` | `:7070` | [Compile manager](../services/compile-manager) — job submission and status |
| `REACT_APP_COMPILE_URL` | `:5050` | [Remote compiler](../services/remote-compiler) — sandboxed execution |

## Screens

| Route area | Purpose |
| --- | --- |
| `pages/home` | Landing and mode selection |
| `pages/login`, `pages/signup` | Auth against the user service |
| `pages/practice`, `pages/editor` | Solo mode — problem list and the practice editor |
| `pages/lobby`, `pages/challenge` | Multiplayer — create or join a lobby, then the race editor |

## How it works

- **Code editing** is [Monaco](https://microsoft.github.io/monaco-editor/) (the editor from VS Code)
  via `@monaco-editor/react`, seeded from `src/config/starter_code.txt` and switchable by language.
- **Live lobby state** runs over `socket.io-client`. A single shared socket is created in
  `src/config/socket.js` and imported where needed, so lobby membership and race progress update
  without polling.
- **Submitting code** is asynchronous by design: the client POSTs to the compile manager, gets a
  job id back with `pending` status, and polls for the result while the worker pool compiles and
  runs the submission inside a Docker container. The UI has to hold the "waiting on a job" state
  rather than blocking on a request.
- **Auth** is a token checked by the `useVerifyUser` hook, with `components/redirect.js` guarding
  routes that need a session.
- Styling is Sass, organised into partials, components and per-page sheets, set in JetBrains Mono.

## Notes

- Bootstrapped with Create React App and still on `react-scripts`.
- A `.env` file is committed. It holds only the `REACT_APP_*` service URLs above, which are baked
  into the client bundle at build time and are not secrets — but it shouldn't be tracked.
- An earlier, empty version of this client existed as a separate `algorace-client` repo.
