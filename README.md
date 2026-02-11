# CS Study Time

---

## About

Proof of concept MCP server that streamlines question bank generation from a variety of sources (markdown, PDF). The question generation API handles parsing the question into a structured category (true false, short answer, select all), and regsitering the source and topic for easy client querying. 

This particular study bank has been generated from discussions, lecture slides, homeworks, and past exams. Claude Code was given access to the question generation MCP server, and used the provided schemas and endpoints to generate all questions with structured categories and labels. 

**See `/question-gen/README.md` for details.**

The provided front end and backend shows how to use this question bank with SQLite to track user progress as they study.

### Gallery

<img width="648" height="520" alt="Screenshot 2026-02-10 at 9 39 31 PM" src="https://github.com/user-attachments/assets/f337e388-a98a-4297-9f07-cdf7708c6d89" />

<img width="648" height="520" alt="Screenshot 2026-02-10 at 9 39 10 PM" src="https://github.com/user-attachments/assets/a9026ff7-d54a-4504-9efe-c5d1e52bfe12" />

<img width="648" height="520" alt="Screenshot 2026-02-10 at 9 39 22 PM" src="https://github.com/user-attachments/assets/fbe8ebc4-7f71-4fb3-b648-4967a9c6a200" />

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




