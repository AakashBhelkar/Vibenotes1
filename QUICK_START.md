# VibeNotes - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend  
cd ../client
npm install
```

### Step 2: Configure Environment

**Create `server/.env`:**
```env
PORT=3000
DATABASE_URL=your_supabase_connection_string
DIRECT_URL=your_supabase_direct_url
JWT_SECRET=your_secret_key_here
```

**Create `client/.env`:**
```env
VITE_API_URL=http://localhost:3000
```

### Step 3: Setup Database
```bash
cd server
npx prisma db push
```

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Step 5: Open Application
Navigate to: **http://localhost:5173**

---

## 📝 Usage

1. **Sign Up**: Create a new account
2. **Login**: Sign in with your credentials
3. **Create Note**: Click the `+` button
4. **Edit Note**: Click on any note to edit
5. **Auto-Save**: Changes save automatically after 1 second
6. **Search**: Use the search bar to find notes
7. **Pin**: Click the pin icon to keep notes at top
8. **Offline**: Works completely offline, syncs when online

---

## 🎯 Key Features

- ✅ **Offline-First**: Full functionality without internet
- ✅ **Auto-Save**: Never lose your work
- ✅ **Fast Search**: Instant note search
- ✅ **Secure**: JWT authentication
- ✅ **Sync**: Automatic bidirectional sync

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify DATABASE_URL is correct
- Ensure JWT_SECRET is set

### Frontend won't start
- Check if port 5173 is available
- Verify VITE_API_URL points to backend

### Can't login
- Ensure backend is running
- Check browser console for errors
- Verify database connection

---

## 📚 Documentation

- **Full Documentation**: See `DEVELOPMENT_SUMMARY.md`
- **Project Status**: See `PROJECT_STATUS.md`
- **API Docs**: See `Docs/api-spec.md`

---

**Need Help?** Check the documentation or review the code comments!
