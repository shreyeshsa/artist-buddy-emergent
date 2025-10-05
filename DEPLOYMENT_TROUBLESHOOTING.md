# Deployment Troubleshooting Guide

This guide helps you diagnose and fix blank white screen issues when deploying your Artist Buddy application.

## Most Common Issue: Missing Environment Variables

### Why This Causes a Blank Screen
Your application requires Supabase credentials to function. When these are missing in production, the app cannot initialize properly, resulting in a blank white screen.

### Solution: Configure Environment Variables

#### For Netlify:
1. Go to your site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add the following variables:
   ```
   VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
   ```
5. Click **Deploy site** to trigger a new build with the environment variables

#### For Vercel:
1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add the same variables as above
4. Click **Redeploy** from the Deployments tab

#### For Other Hosting Platforms:
Most hosting platforms have a similar environment variables section. Look for:
- Environment Variables
- Build Environment
- Secrets
- Configuration

---

## Complete Diagnostic Checklist

### Step 1: Check Browser Console (Most Important!)
1. Open your published site
2. Press `F12` or right-click → Inspect
3. Go to the **Console** tab
4. Look for errors (red text)

**Common Error Messages:**
- `Missing Supabase environment variables` → Configure environment variables (see above)
- `Failed to fetch` → Network/CORS issue
- `Uncaught TypeError` → JavaScript error in code
- `404 Not Found` → Build file missing

### Step 2: Verify Build Files
Check that these files exist in your deployment:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── favicon.svg
└── robots.txt
```

**If files are missing:**
- Rebuild your project locally: `npm run build`
- Check if the build completes successfully
- Verify the `dist` folder is populated
- Redeploy

### Step 3: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for failed requests (red status codes)

**Common Issues:**
- **404 errors** → Files not uploaded correctly
- **CORS errors** → Supabase URL configured incorrectly
- **500 errors** → Server configuration issue

### Step 4: Verify Routing Configuration
Your app uses client-side routing. Ensure your hosting platform redirects all routes to `index.html`.

**Netlify** - Check `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel** - Check `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 5: Test Local Build
Before debugging deployment, verify the build works locally:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

If this works locally but not in production, the issue is with deployment configuration (usually environment variables).

---

## Issue-Specific Solutions

### Issue: "Cannot read property of undefined"
**Cause:** JavaScript error in code, often due to missing data

**Solution:**
1. Check browser console for the exact error
2. The error will include a file name and line number
3. Review that code section for potential issues

### Issue: Infinite Loading Spinner
**Cause:** Authentication initialization hanging

**Solution:**
1. Check if Supabase credentials are correct
2. Verify network connectivity to Supabase
3. Check browser console for timeout errors
4. The app now has a 5-second timeout to prevent infinite loading

### Issue: "Failed to connect to authentication service"
**Cause:** Supabase connection problem

**Solutions:**
1. Verify environment variables are correct
2. Check if Supabase project is active (login to Supabase dashboard)
3. Verify CORS settings in Supabase (usually auto-configured)
4. Check if your IP is blocked (rare)

### Issue: CSS Not Loading / Unstyled Content
**Cause:** CSS file path issue or build problem

**Solutions:**
1. Verify `base: "/"` is set in `vite.config.ts`
2. Clear your browser cache
3. Check Network tab for 404 errors on CSS files
4. Rebuild: `npm run build`

### Issue: "Module not found" errors
**Cause:** Missing dependencies or import path issues

**Solutions:**
1. Verify all dependencies are installed: `npm install`
2. Check for typos in import statements
3. Rebuild the project
4. Check if `node_modules` was included in deployment (it shouldn't be)

---

## Prevention Strategies

### 1. Always Test Production Builds Locally
```bash
npm run build
npm run preview
```

### 2. Use Environment Variable Checklists
Before deploying, verify:
- [ ] VITE_SUPABASE_URL is set
- [ ] VITE_SUPABASE_ANON_KEY is set
- [ ] Environment variables are in the hosting platform (not just .env file)

### 3. Set Up Deployment Checks
Many hosting platforms support deployment checks:
- Add a health check endpoint
- Set up build notifications
- Configure automatic rollbacks on failure

### 4. Monitor Console Errors
Add error tracking:
- Sentry
- LogRocket
- Custom error boundary with reporting

### 5. Use Feature Flags
Test new features behind flags before enabling in production

---

## Quick Reference: Error Messages

| Error Message | Most Likely Cause | Quick Fix |
|--------------|-------------------|-----------|
| Blank white screen | Missing env vars | Add VITE_SUPABASE_* to hosting platform |
| Loading forever | Auth timeout | Check Supabase connection |
| 404 on assets | Build not deployed | Rebuild and redeploy |
| CORS error | Wrong Supabase URL | Verify environment variables |
| Module not found | Missing dependency | Run npm install and rebuild |

---

## Getting Help

If you're still experiencing issues after trying these solutions:

1. **Check Browser Console** - Copy the full error message
2. **Check Network Tab** - Note any failed requests
3. **Check Build Logs** - Review deployment platform logs
4. **Document Steps** - What you tried and what happened

With this information, you can:
- Search for the specific error message
- Ask for help with concrete details
- Debug systematically

---

## Your Current Configuration

**Hosting:** Based on your config files, you're set up for:
- ✅ Netlify (netlify.toml present)
- ✅ Vercel (vercel.json present)

**Build Command:** `npm run build`
**Output Directory:** `dist`
**Node Version:** 18

**Required Environment Variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Emergency Checklist

If your site is down right now, do these in order:

1. [ ] Open browser console - check for errors
2. [ ] Verify environment variables in hosting platform
3. [ ] Trigger a new deployment
4. [ ] Wait 2-3 minutes for deployment to complete
5. [ ] Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
6. [ ] Clear browser cache if still not working
7. [ ] Check if you can access other sites (verify your internet)

---

## Technical Details

### How the App Initializes

1. HTML loads → Shows loading spinner
2. JavaScript bundle loads
3. Supabase client initializes
4. If env vars missing → Shows configuration error screen
5. Auth state checks (5 second timeout)
6. Renders login screen or main app

### New Safeguards Added

- ✅ No longer throws error on missing env vars (shows helpful message instead)
- ✅ 5-second timeout on auth initialization (previously 10 seconds)
- ✅ Better error messages in console
- ✅ Graceful degradation when Supabase is unreachable
- ✅ User-friendly configuration screen for missing env vars
