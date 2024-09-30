# Notes App API

This is a simple Notes application API built using **Node.js**, **Express**, and **MongoDB**. The API allows users to register, log in, create, view, search, and manage their notes.

## Features

- **User Authentication:** Users can register and log in using their email and password, with JWT-based authentication.
- **Notes Management:** Users can create, view, update, and delete their own notes.
- **Search Notes:** Users can search their notes by title.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/notes-app.git
cd notes-app
```

####  2. Install the dependencies
```bash
npm install
```

### 3. Create .env  file in the rootof your project and add the following
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_for_authentication
```

### 4. Run the Application

```bash
npm start
```

The app will be running at http://localhost:3000

