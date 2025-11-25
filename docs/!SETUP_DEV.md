# Biomes – Local Dev Setup (WSL / Ubuntu)

These notes are for working on the `biomes-game` fork on any machine, using **WSL Ubuntu** and the **./b** wrapper (never calling Bazel directly).

---

## 1. Prerequisites

- Windows 10/11 with **WSL2** and **Ubuntu** installed
- Git
- GitHub account with SSH access set up
- Reasonably recent:
  - Python 3.10
  - Node.js (version compatible with the repo – use whatever you used on the first machine)
- Disk space: this repo and Bazel cache are large

> **Important:** All Biomes commands should be run from **Ubuntu in WSL**, not from PowerShell directly.

---

## 2. Clone the repo (SSH)

Open **Ubuntu (WSL)**:

```bash
cd /mnt/c/Gamebridge/Dev
git clone git@github.com:AaronThibault/biomes-game.git
cd biomes-game
```

---

## 3. Project Believe Backend (pb-backend)

We are building a local-first backend in `services/pb-backend`.

### Running the backend

To run the backend in isolation:

```bash
# From repo root (in WSL)
docker-compose up --build pb-backend
```

### Testing

- **HTTP Health Check**:
  ```bash
  curl http://localhost:4100/healthz
  ```
- **WebSocket**:
  Connect any WS client (e.g., Postman, wscat) to:
  `ws://localhost:4905/pb-sync`

  Example payloads:

  ```json
  { "type": "ping" }
  ```

  ```json
  { "type": "echo", "payload": { "text": "hello from client" } }
  ```
