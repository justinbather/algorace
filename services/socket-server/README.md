# socket-server

The Socket.IO server behind AlgoRace's multiplayer mode. Holds lobby membership and live race
state so clients see readiness and progress without polling.

Part of the [AlgoRace](../../README.md) monorepo.

## What it does

Clients connect on join and the server tracks which users are in which lobby, who has marked
themselves ready, and when the host starts a match. Lobby and problem documents are read from the
same MongoDB instance the user service writes to — the schemas in `schema/` mirror it.

```bash
npm install
node index.js
```

Expects a Mongo connection string in the environment. The client connects via
`REACT_APP_SOCKET_URL`, defaulting to `:8000`.

## Notes

- Lobby state is held in the server process, so it is single-instance by design — running two
  replicas would split lobbies across them. Scaling this out would need a shared adapter
  (Redis) or sticky routing.
- No auth on the socket connection itself; it trusts that the client reached it having already
  authenticated against the user service.
