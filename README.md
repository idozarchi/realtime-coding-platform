# Real-time Coding Platform

A real-time coding platform that enables interactive JavaScript teaching through code blocks. The platform supports multiple students learning simultaneously with a mentor.

## Features

- Real-time code editing with Monaco Editor
- Role-based access (Mentor/Student)
- Multiple student support in each room
- Student count tracking
- Success detection when code matches solution
- Responsive design
- Modern UI with syntax highlighting
- Real-time code synchronization between students
- Solution showing/hiding for mentors
- Success overlay for completed challenges

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn

## Technical Requirements

### Backend Dependencies
- Express v4.18.2
- Socket.IO v4.6.1
- Mongoose v7.0.3
- CORS v2.8.5
- dotenv v16.0.3

### Frontend Dependencies
- React v18.2.0
- React Router v6.8.2
- Monaco Editor v4.7.0
- Socket.IO Client v4.6.1
- Axios v1.3.4

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/idozarchi/realtime-coding-platform.git
cd realtime-coding-platform
```

2. Set up the backend:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGO_URI=mongodb+srv://idoz:<db_password>@bank.pximp.mongodb.net/?retryWrites=true&w=majority&appName=Bank
PORT=5000
FRONTEND_URL=http://localhost:3000
```

4. Set up the frontend:
```bash
cd ../frontend
npm install
```

5. Create a `.env` file in the frontend directory with:
```
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. The first user to open a code block becomes the mentor
2. Subsequent users become students
3. The mentor can:
   - View all students' code in real-time
   - Show/hide the solution
   - Monitor student progress
4. Students can:
   - Edit code in real-time
   - See their changes reflected immediately
   - Submit solutions
   - Reset their code
5. When a student's code matches the solution, a success message appears
6. If the mentor leaves, all students are redirected to the lobby

## Project Structure

```
realtime-coding-platform/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CodeEditor/
    │   │   ├── CodeBlockHeader/
    │   │   ├── StudentControls/
    │   │   └── SuccessOverlay/
    │   ├── pages/
    │   │   ├── Lobby/
    │   │   └── CodeBlock/
    │   └── hooks/
    ├── package.json
    └── .env
```

## Deployment

The application can be deployed to various platforms:

### Backend
- Railway.app
- Heroku
- DigitalOcean
- Render

### Frontend
- Netlify
- Vercel
- GitHub Pages

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
