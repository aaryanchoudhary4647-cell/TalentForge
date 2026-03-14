# Fix: "Failed to post job. Please try again." Error

## 🔴 Current Issue
You're seeing this error when trying to post a job as HR.

## ✅ Solution

### Step 1: Open Browser Console
This is **critical** for debugging:
1. Press **F12** on your keyboard
2. Click the **Console** tab
3. Try posting a job again
4. Look for error messages in red with ❌ symbol

### Step 2: Check What Error You See

Copy the error message and find your issue below:

#### **Error: "Database table 'job_postings' not found"**
→ Go to Step 3 (Run Supabase Setup)

#### **Error: "Permission denied" or "RLS Policy"**
→ Go to Step 3 (Run Supabase Setup) - Make sure to run the ENTIRE script

#### **Error: "Connection refused" or "Cannot reach Supabase"**
→ Check your `.env.local` file has correct Supabase credentials

#### **Error: "undefined" or Nothing in console**
→ Check if you're logged in as HR (not Candidate)
→ Then go to Step 3

---

### Step 3: Run Supabase Setup (If Not Done)

This is the **most common** reason the job posting fails.

#### Quick Steps:
1. In your project, open file: `SUPABASE_SETUP.md`
2. Go to https://app.supabase.com
3. Select your TalentForge project
4. Click **SQL Editor** in the left sidebar
5. Click **+ New Query** button
6. Copy **EVERYTHING** from SUPABASE_SETUP.md (starting from line 39, all tables and policies)
7. Paste into the SQL editor
8. Click **Run** button
9. Wait for it to complete (should show "No errors")

#### ⚠️ Important
- You **MUST** include all the RLS policies, not just the table creation
- It says "No errors" when done ✓
- Don't stop halfway through

---

### Step 4: Verify Tables Were Created

After running the SQL script:

1. In Supabase, go to **Database** → **Tables**
2. Look for:
   - ✅ `job_postings` 
   - ✅ `job_applications`
3. If they're not there, the SQL script didn't run correctly

---

### Step 5: Refresh & Try Again

1. Refresh your browser (Press **F5**)
2. Try posting a job again
3. You should see "Job posted successfully!" ✅

---

## 🆘 Still Not Working?

### Check Your Supabase Credentials
Make sure `.env.local` has valid keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

If these are empty or say "placeholder", you need to set them up.

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click **Logs** button
3. Look for errors in the last 5 minutes
4. Copy the error message

### Still Stuck?
Check the **EXACT error** in:
1. Browser console (F12 → Console tab)
2. Supabase Logs
3. Share this error in your debugging

---

## 🚀 Expected Flow

1. ✅ Logged in as HR
2. ✅ Go to `/hr/jobs`
3. ✅ Fill in form (all starred fields required)
4. ✅ Click "Post Job"
5. ✅ See "Job posted successfully!" message
6. ✅ Redirected to `/hr` dashboard

---

## 📋 Checklist

Before trying to post a job, confirm:

- [ ] You ran the Supabase setup script
- [ ] You're logged in as **HR** (not Candidate)
- [ ] You filled in all required fields (Job Title, Description, Requirements, Job Type)
- [ ] Your `.env.local` file has Supabase credentials
- [ ] You see `job_postings` table in Supabase → Database → Tables

If all checkmarks are done and it still fails → check browser console (F12) for the exact error.

---

## 🔍 Debugging Commands

In your browser console (F12), you can also check if Supabase is connected:

```javascript
// Check if Supabase client exists
console.log(window.supabase);

// This should not be empty
```

---

## 💬 Common Reasons

| Reason | Fix |
|--------|-----|
| Setup script not run | Run `SUPABASE_SETUP.md` in Supabase SQL Editor |
| Wrong table name | Tables must be exactly: `job_postings`, `job_applications` |
| RLS policies missing | Run ENTIRE script including policies |
| Wrong user role | Must be logged in as HR, not Candidate |
| Empty env variables | Fill `.env.local` with real Supabase keys |
| Copied old form data | Make sure you're on the latest code |

---

**Want to verify everything worked?**
Go to Supabase → Database → `job_postings` table → You should see your new job row there ✅
