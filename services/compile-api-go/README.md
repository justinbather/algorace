# compile-api-go

A Go + MongoDB HTTP service for managing compile jobs, written as a replacement for the Node
compile manager in [AlgoRace](../../README.md).

**Status: incomplete.** The routing and persistence layers are wired up and `POST /jobs` works,
but the read, update and delete handlers are empty stubs. The Node service at [compile-manager](../compile-manager) is the version
that actually ran in the deployed system.

## Run it

Needs a MongoDB connection string in the environment — `db.Connect` reads it via `godotenv`.

```bash
cp .env.example .env    # set your Mongo URI
go run .
```

Listens on `:3000`.

## Routes

| Method | Path | Status |
| --- | --- | --- |
| `POST` | `/jobs` | Implemented — decodes a job and inserts it. |
| `GET` | `/jobs` | Stub. |
| `GET` | `/jobs/{jobId}` | Stub. |
| `PUT` / `PATCH` | `/jobs/{jobId}` | Stub. |
| `DELETE` | `/jobs/{jobId}` | Stub. |

Built on [gorilla/mux](https://github.com/gorilla/mux) and the official MongoDB Go driver.

## Known limitations

Beyond the unimplemented handlers:

- **The model doesn't match the domain.** `CompileJob` carries `Title`, `Category` and
  `Difficulty`, which describe a *problem*, not a job. A real compile job needs an id, status,
  submitted code, language, and captured stdout/stderr — see the Node manager's schema.
- **Database and collection names are hardcoded** to `test` and `public_compile` inside the handler.
- **A failed insert writes an error and then continues** to `WriteHeader(StatusCreated)`, so a
  database failure still reports success to the caller.
- No request validation, no structured logging, no graceful shutdown, no tests.

## Context

AlgoRace was a multiplayer DSA practice platform. Code submitted by a user was queued to a
worker pool that compiled and ran it inside a Docker container, then reported results back.
The wider architecture is described in
[the top-level README](../../README.md), and the sandboxing
approach in [remote-compiler](../remote-compiler).
