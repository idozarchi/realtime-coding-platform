# Real-time Coding Platform

A real-time coding platform that allows a mentor (Tom) to teach JavaScript to students through interactive code blocks.

## Features

- Real-time code editing with syntax highlighting
- Role-based access (Mentor/Student)
- Student count tracking
- Success detection when code matches solution
- Responsive design
- Modern UI with Monaco Editor

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd realtime-coding-platform
```

2. Set up the backend:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
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

1. The first user to open a code block becomes the mentor (Tom)
2. Subsequent users become students
3. The mentor can view the code in read-only mode
4. Students can edit the code in real-time
5. When a student's code matches the solution, a success message appears
6. If the mentor leaves, all students are redirected to the lobby

## Deployment

The application can be deployed to various platforms:

### Backend
- Railway.app
- Heroku
- DigitalOcean

### Frontend
- Netlify
- Vercel
- GitHub Pages

## Technologies Used

- Frontend:
  - React
  - Socket.IO Client
  - Monaco Editor
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - MongoDB
  - Mongoose

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
