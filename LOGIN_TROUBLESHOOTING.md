# Login & Test Fixes - Quick Reference

## ✅ Issues Fixed

### 1. Export Tests Fixed
**File**: `client/src/tests/export.test.ts`

**Changes**:
- Replaced `expect().rejects.toThrow()` with try-catch blocks
- Added proper error instance checking
- Fixed async error handling in Vitest

**Test Now**:
```bash
cd client
npm test -- export.test.ts
```

### 2. Login Debugging Enhanced
**Files Created**:
- `server/scripts/debugLogin.ts` - Comprehensive login debugger
- Enhanced `client/src/lib/apiClient.ts` - Better error logging

**Verified**:
- ✅ Test user exists in database
- ✅ Password hash is correct
- ✅ Password comparison works
- ✅ Credentials: test@example.com / password123

## 🔍 Login Troubleshooting Steps

### Step 1: Verify Backend is Running
```bash
cd server
npm run dev
# Should see: Server running on port 3000
```

### Step 2: Verify Frontend is Running
```bash
cd client
npm run dev
# Should see: Local: http://localhost:5173
```

### Step 3: Check Database Connection
```bash
cd server
npx tsx scripts/debugLogin.ts
# Should show: ✅ Password comparison successful
```

### Step 4: Test Login API Directly
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected Response**:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "displayName": "Test User"
  },
  "token": "eyJ..."
}
```

### Step 5: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages

**Common Issues**:
- CORS errors → Check server CORS configuration
- Network errors → Verify API_URL in .env
- 401 errors → Password mismatch (run debugLogin.ts)
- 404 errors → Backend not running

### Step 6: Verify Environment Variables

**Backend** (`server/.env`):
```env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:3000
```

## 🐛 Common Login Issues & Fixes

### Issue: "Invalid credentials" with correct password

**Cause**: Password hash mismatch

**Fix**:
```bash
cd server
npx tsx scripts/debugLogin.ts
# This will reset the password if needed
```

### Issue: Network Error / Cannot connect

**Cause**: Backend not running or wrong URL

**Fix**:
1. Check backend is running: `curl http://localhost:3000/auth/login`
2. Verify VITE_API_URL in client/.env
3. Restart both servers

### Issue: CORS Error

**Cause**: CORS not configured

**Fix**: Check `server/src/app.ts` has CORS middleware:
```typescript
import cors from 'cors';
app.use(cors());
```

### Issue: 404 Not Found

**Cause**: Route not registered

**Fix**: Verify `server/src/app.ts` includes:
```typescript
import authRoutes from './routes/AuthRoutes';
app.use('/auth', authRoutes);
```

## 📝 Test Credentials

**Email**: `test@example.com`
**Password**: `password123`

## 🔧 Quick Fixes

### Reset Test User Password
```bash
cd server
npx tsx scripts/debugLogin.ts
```

### View Database
```bash
cd server
npx prisma studio
# Opens at http://localhost:5555
```

### Clear Browser Storage
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Check Server Logs
Look for these in server terminal:
- `POST /auth/login` - Login attempt
- `200` - Success
- `401` - Invalid credentials
- `500` - Server error

## ✅ Verification Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Database connected (Prisma Studio works)
- [ ] Test user exists (debugLogin.ts passes)
- [ ] VITE_API_URL is correct
- [ ] No CORS errors in console
- [ ] JWT_SECRET is set in backend .env

## 🎯 Next Steps

If login still fails after all checks:

1. **Check Network Tab** in DevTools
   - Look at the request payload
   - Check response status and body
   - Verify request URL is correct

2. **Enable Debug Mode**
   - Add console.logs in LoginPage.tsx
   - Add console.logs in AuthService.ts
   - Check what error is being caught

3. **Test with curl**
   - If curl works but browser doesn't → Frontend issue
   - If curl fails → Backend issue

4. **Check Server Logs**
   - Look for errors in server terminal
   - Check if request is reaching the server
   - Verify database queries are working

---

**Last Updated**: 2025-11-20
**Status**: ✅ Tests Fixed, Login Debugged
