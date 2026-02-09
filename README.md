# CS Study Time

---

## About

Designed for USC's CS570. In the future I may add a more flexible option for importing study banks for any course, but in that case, applications like that already exist. The goal for this application is to quickly drill major topics in graphs, greedy, and algorithms.

### Gallery

<img width="1157" height="1023" alt="Screenshot 2026-02-09 at 12 11 22 AM" src="https://github.com/user-attachments/assets/fd85cb5f-bbb2-48ea-aa4e-4824d5beb48d" />

---

<img width="1157" height="1023" alt="Screenshot 2026-02-09 at 12 11 12 AM" src="https://github.com/user-attachments/assets/7e5f974a-f86e-4212-82a0-29e33743cbdd" />

---

<img width="1157" height="1023" alt="Screenshot 2026-02-09 at 12 11 15 AM" src="https://github.com/user-attachments/assets/7e78d94c-2eb3-42d5-aae5-5c12ddbba024" />

---

### Running locally

This app is designed to run locally! All user stats and question banks are stored in `backend/study.db`.

After cloning the repo:

Open two terminal windows

If running for the first time, use "npm install" step before "npm run dev". You only need to do this once.

**Terminal 1**

```
cd backend
npm run dev
```

**Terminal 2**

```
cd frontend
npm run dev
```


**Example Output**

```
user@MacBook-Pro-2 frontend % npm run dev

> frontend@0.0.0 dev
> vite

12:08:31 AM [vite] (client) Re-optimizing dependencies because vite config has changed

  VITE v7.3.1  ready in 144 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```

**Access the web UI at localhost:5173** (or wherever Vite points it)


