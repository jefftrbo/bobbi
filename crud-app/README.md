# Contact Manager CRUD Application

A full-stack CRUD (Create, Read, Update, Delete) application for managing contacts with names and addresses. Built with Node.js/Express backend and React frontend.

## 🚀 Quick Start with Docker (Recommended)

The easiest way to run this application is using Docker:

```bash
# Clone the repository
git clone <your-repo-url>
cd bobbi/crud-app

# Build and run with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:5000
```

**That's it!** The application is now running with both frontend and backend on port 5000.

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md)

---

## Features

- ✅ View all contacts (20 pre-loaded fictitious contacts)
- ✅ Add new contacts
- ✅ Edit existing contacts
- ✅ Delete contacts
- ✅ Persistent storage using JSON file
- ✅ Modern, responsive UI
- ✅ Real-time updates

## Tech Stack

**Backend:**
- Node.js
- Express.js
- File system (JSON storage)

**Frontend:**
- React 18
- Modern CSS with gradients
- Fetch API for HTTP requests

## Project Structure

```
crud-app/
├── server.js           # Express backend server
├── data.json          # JSON file storing contacts
├── package.json       # Backend dependencies
├── client/            # React frontend
│   ├── src/
│   │   ├── App.js     # Main React component
│   │   └── App.css    # Styling
│   └── package.json   # Frontend dependencies
└── README.md
```

## Installation Options

### Option 1: Docker (Recommended for Production)

See [DOCKER.md](./DOCKER.md) for complete Docker deployment guide.

**Quick Start:**
```bash
docker-compose up -d
```

Access at: http://localhost:5000

### Option 2: Local Development Setup

#### Prerequisites
- Node.js (v14 or higher)
- npm

#### Setup Instructions

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd bobbi/crud-app
```

2. **Install backend dependencies:**
```bash
cd crud-app
npm install
```

2. **Install frontend dependencies:**
```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run both servers separately

**Terminal 1 - Start the backend server:**
```bash
npm start
```
Backend will run on http://localhost:5000

**Terminal 2 - Start the React frontend:**
```bash
cd client
npm start
```
Frontend will run on http://localhost:3000

### Option 2: Run both servers concurrently (recommended)

First, install concurrently:
```bash
npm install
```

Then run both servers:
```bash
npm run dev:all
```

## API Endpoints

### GET /api/contacts
Get all contacts
```bash
curl http://localhost:5000/api/contacts
```

### GET /api/contacts/:id
Get a single contact by ID
```bash
curl http://localhost:5000/api/contacts/1
```

### POST /api/contacts
Create a new contact
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","address":"123 Main St, City, State 12345"}'
```

### PUT /api/contacts/:id
Update an existing contact
```bash
curl -X PUT http://localhost:5000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","address":"456 Oak Ave, City, State 67890"}'
```

### DELETE /api/contacts/:id
Delete a contact
```bash
curl -X DELETE http://localhost:5000/api/contacts/1
```

## Usage

1. Open http://localhost:3000 in your browser
2. View the list of 20 pre-loaded contacts
3. Use the form at the top to add new contacts
4. Click "Edit" on any contact card to modify it
5. Click "Delete" to remove a contact (with confirmation)

## Data Persistence

All contact data is stored in `data.json`. Changes made through the UI are immediately persisted to this file and will be available after server restart.

## Pre-loaded Contacts

The application comes with 20 fictitious contacts:
- Alice Johnson, Bob Smith, Carol Williams, David Brown, Emma Davis
- Frank Miller, Grace Wilson, Henry Moore, Iris Taylor, Jack Anderson
- Karen Thomas, Leo Jackson, Maria White, Nathan Harris, Olivia Martin
- Paul Thompson, Quinn Garcia, Rachel Martinez, Samuel Robinson, Tina Clark

## Development

### Backend Development
```bash
npm run dev
```
Uses nodemon for auto-restart on file changes

### Frontend Development
```bash
cd client
npm start
```
React development server with hot reload

## Troubleshooting

**CORS Issues:**
- The backend is configured to accept requests from any origin
- If you encounter CORS errors, ensure the backend is running on port 5000

**Port Already in Use:**
- Backend: Change PORT in server.js
- Frontend: React will prompt to use a different port

**Data Not Persisting:**
- Ensure the backend has write permissions to data.json
- Check server console for error messages

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Pagination for large datasets
- [ ] Input validation and error handling
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Export contacts to CSV
- [ ] Import contacts from file

## License

MIT