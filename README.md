
# Chat App

This is a real-time chat application built with Node.js, Express, MongoDB, and Socket.IO. It allows users to register, log in, and chat in real time with others.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

## Setup & Running

1. **Clone the repository**
   ```
   git clone https://github.com/Ahmed-Ma7moud/chat-app-NodeJS
   cd chat-app-NodeJS
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```bash
   PORT=3000
   MONGO_URI=<YOUR_MONGODB_URI>
   JWT_SECRET=<YOUR_JWT_SECRET>
   ```

4. **Start the server:**
   ```
   npm start
   ```
   The server will run on [http://localhost:3000](http://localhost:3000) by default.

   If you are using nodemon, stop the server by pressing:

   CTRL + C (Windows/Linux)

   ⌘ + C (Mac)

5. **Open the app:**
   - Go to [http://localhost:3000](http://localhost:3000) in your browser.
   - Register a new user and start chatting!

## Project Structure

- `app.js` — Main server entry point
- `config/` — Database and socket configuration
- `controllers/` — Business logic for authentication, conversations, and messages
- `middlewares/` — Authentication and validation middleware
- `models/` — Mongoose models for User, Conversation, and Message
- `public/` — Static frontend files (HTML, CSS, JS)
- `routes/` — Express route definitions for API endpoints
- `services/` — Services for managing online users and other logic
- `socket/` — Socket.IO server and event handlers
- `validation/` — Input validation schemas and logic

## Features

- User registration and login (JWT authentication)
- Create and join conversations
- Real-time messaging with Socket.IO
- Typing indicators and online status
- Tracking messages status (seen/delivered)
- Tracking user online/offline status
- Input validation and sanitization for security
- Pagination for loading older messages and conversations
- Rate limiting on login , register and sending messages to prevent spam

