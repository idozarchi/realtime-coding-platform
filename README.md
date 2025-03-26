# Real-time Coding Platform

A collaborative coding platform that enables real-time code sharing and mentoring between teachers and students.

## Features

- Real-time code synchronization
- Role-based access (Mentor/Student)
- Code execution and validation
- Solution checking
- Student count tracking
- Room-based collaboration

## Project Structure

```
realtime-coding-platform/
├── backend/
│   ├── config/
│   │   ├── cors.js
│   │   ├── database.js
│   │   └── staticConfig.js
│   ├── models/
│   │   └── CodeBlock.js
│   ├── routes/
│   │   └── codeBlocks.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CodeBlock/
    │   │   │   ├── CodeBlockHeader.js
    │   │   │   └── CodeEditor.js
    │   │   └── Lobby/
    │   │       └── CodeBlockList.js
    │   ├── hooks/
    │   │   └── useSocketConnection.js
    │   ├── pages/
    │   │   ├── CodeBlock/
    │   │   │   └── CodeBlock.js
    │   │   └── Lobby/
    │   │       └── Lobby.js
    │   └── App.js
    └── package.json
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   MONGO_URI=your_mongodb_uri
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm start
   ```

## Usage

1. Open the application in your browser
2. Create a new code block or join an existing one
3. First user to join becomes the mentor
4. Subsequent users become students
5. Mentor can edit code and provide solutions
6. Students can view and edit their own version of the code

## Deployment

The application is deployed at: [https://realtime-coding-platform-git-main-idos-projects-e7dca031.vercel.app/](https://realtime-coding-platform-git-main-idos-projects-e7dca031.vercel.app/)

**Note:** Since we are using Render for the backend server, it may take up to 60 seconds to load on first use. After the first use, the server will be ready immediately.
