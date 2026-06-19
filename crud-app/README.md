# Contact Manager CRUD Application

A full-stack CRUD (Create, Read, Update, Delete) application for managing contacts with names and addresses. Built with Node.js/Express backend and React frontend.

## ✨ New Features (v2.0)

- **📜 Scrolling Contact List**: Efficiently browse through large contact lists with smooth scrolling
- **🪟 Modal Windows**: Interactive view/edit/delete operations in elegant modal dialogs
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices with adaptive layouts
- **♿ Accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

See [FRONTEND-UPDATES.md](./FRONTEND-UPDATES.md) for detailed documentation of all UI enhancements.

## 🚀 Quick Start

### Prerequisites

You need either **Podman** (recommended) or **Podman** installed:

**Install Podman (macOS):**
```bash
brew install podman
podman machine init
podman machine start
```

**Install Podman (Linux):**
```bash
# Fedora/RHEL/CentOS
sudo dnf install podman

# Ubuntu/Debian
sudo apt-get update && sudo apt-get install podman
```

### Option 1: Podman (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd bobbi/crud-app

# Build and run with Podman Compose
podman compose up -d

# Access the application
open http://localhost:5000
```

**That's it!** The application is now running with both frontend and backend on port 5000.

For detailed Podman instructions, see [PODMAN.md](./PODMAN.md)

### Option 2: Podman (Alternative)

If you prefer Podman:

```bash
# Clone the repository
git clone <your-repo-url>
cd bobbi/crud-app

# Build and run with Podman Compose
podman-compose up -d

# Access the application
open http://localhost:5000
```

For detailed Podman instructions, see [DOCKER.md](./DOCKER.md)

---

## Features

### Core Functionality
- ✅ View all contacts (20 pre-loaded fictitious contacts)
- ✅ Add new contacts with name and address
- ✅ Edit existing contacts via modal window
- ✅ Delete contacts with confirmation dialog
- ✅ Persistent storage using JSON file
- ✅ Real-time updates

### User Interface (v2.0)
- ✅ **Scrolling Contact List**: Efficient browsing with custom scrollbar
- ✅ **Clickable Contact Names**: Click any name to view details
- ✅ **Modal Windows**: View, edit, and delete in elegant dialogs
- ✅ **Responsive Design**: Adapts to all screen sizes (desktop, tablet, mobile)
- ✅ **Smooth Animations**: Fade-in and scale effects
- ✅ **Accessibility**: Keyboard navigation and screen reader support
- ✅ **Touch-Friendly**: Optimized for mobile touch interactions

## Tech Stack

**Backend:**
- Node.js
- Express.js
- File system (JSON storage)

**Frontend:**
- React 18 with Hooks (useState, useEffect)
- Modern CSS3 with responsive design
- CSS Flexbox for layouts
- CSS clamp() for responsive typography
- Modal windows with animations
- Custom scrollbar styling
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

### Option 1: Podman (Recommended for Production)

See [PODMAN.md](./PODMAN.md) for complete Podman deployment guide.

**Quick Start:**
```bash
podman compose up -d
```

Access at: http://localhost:5000

### Option 2: Podman (Alternative Container Runtime)

See [DOCKER.md](./DOCKER.md) for complete Podman deployment guide.

**Quick Start:**
```bash
podman-compose up -d
```

Access at: http://localhost:5000

### Option 3: Local Development Setup

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

### Using the Application

1. **Open the Application**
   - Production (Podman/Podman): http://localhost:5000
   - Development: http://localhost:3000

2. **View Contacts**
   - Browse the scrolling list of contacts
   - Scroll through the list to see all contacts

3. **Add New Contact**
   - Fill in the "Name" and "Address" fields at the top
   - Click "Add Contact" button
   - New contact appears in the list immediately

4. **View Contact Details**
   - Click on any contact name in the list
   - Modal window opens showing full details

5. **Edit Contact**
   - Click on a contact name to open the modal
   - Click "Edit" button in the modal
   - Modify the name or address
   - Click "Save Changes" or "Cancel"

6. **Delete Contact**
   - Click on a contact name to open the modal
   - Click "Delete" button in the modal
   - Confirm deletion in the confirmation dialog
   - Click "Yes, Delete" or "Cancel"

7. **Close Modal**
   - Click the "✕" button in the top-right corner
   - Click "Close" button at the bottom
   - Click outside the modal (on the dark overlay)

### Keyboard Shortcuts

- **Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and links
- **Escape**: Close modal window (browser default)
- **Arrow Keys**: Scroll through contact list

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

**Modal Not Opening:**
- Check browser console for JavaScript errors
- Ensure contact name links are clickable
- Try refreshing the page

**Scrolling Not Working:**
- Verify browser supports CSS `overflow-y: auto`
- Check if contact list has enough items to scroll
- Try a different browser

**Responsive Layout Issues:**
- Clear browser cache
- Ensure browser supports CSS `clamp()` function
- Update to latest browser version
- Check browser zoom level (should be 100%)

## Documentation

- **[README.md](./README.md)** - This file, main documentation
- **[FRONTEND-UPDATES.md](./FRONTEND-UPDATES.md)** - Detailed frontend v2.0 documentation
- **[PODMAN.md](./PODMAN.md)** - Comprehensive Podman deployment guide
- **[PODMAN-SETUP.md](./PODMAN-SETUP.md)** - Quick Podman setup reference
- **[DOCKER.md](./DOCKER.md)** - Podman deployment guide
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Sorting options (by name, date added)
- [ ] Pagination or virtual scrolling for very large datasets
- [ ] Enhanced input validation
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] Export contacts to CSV/JSON
- [ ] Import contacts from file
- [ ] Contact photos/avatars
- [ ] Additional contact fields (phone, email, etc.)
- [ ] Contact groups/categories
- [ ] Bulk operations (select multiple, bulk delete)

## License

MIT