# Job Posting Issue - Troubleshooting Guide

## If the job posting form is stuck on "Loading"...

### Step 1: Check the Browser Console
1. Open your browser's Developer Tools (Press **F12**)
2. Go to the **Console** tab
3. Look for any error messages in red
4. Copy the error and use it to troubleshoot below

### Step 2: Verify Database is Set Up

You MUST run the Supabase setup script first. Follow these steps:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your TalentForge project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Go to `SUPABASE_SETUP.md` in your project root
6. Copy the ENTIRE SQL script (all tables and RLS policies)
7. Paste into the SQL editor
8. Click **Run** button

**This MUST complete without errors.**

### Step 3: Check if Tables Exist

After running the SQL script:

1. In Supabase, go to **Database** → **Tables** in the left sidebar
2. Verify you see these tables:
   - ✅ `user_roles`
   - ✅ `applicant_profiles`
   - ✅ `hr_profiles`
   - ✅ `job_postings` (NEW)
   - ✅ `job_applications` (NEW)
   - ✅ `organizations`

If any table is missing, the SQL script didn't run successfully. Try again.

### Step 4: Refresh the Page

After running the setup script:
1. Refresh your browser (Press **F5** or **Ctrl+R**)
2. Try posting a job again

### Common Errors

#### Error: "Database table 'job_postings' not found"
- **Solution**: Run the SQL setup script from SUPABASE_SETUP.md in your Supabase SQL Editor

#### Error: "Permission denied" or "RLS Policy"
- **Solution**: Run the ENTIRE SQL script including all RLS policies from SUPABASE_SETUP.md
- Make sure you didn't stop the script halfway through

#### Error: "undefined or null error"
- Open browser console (F12)
- Copy the full error message
- This usually means database is not set up

#### Form just keeps loading
1. Check browser console for errors (F12)
2. Run the database setup script
3. Refresh the page

### Step 5: Test It Works

Once database is set up:

1. **As HR**, go to `/hr/jobs`
2. Fill in:
   - **Job Title** ⭐ (e.g., "Senior Developer")
   - **Job Description** ⭐ (e.g., "We're looking for...")
   - **Requirements** ⭐ (e.g., "5+ years experience in Node.js")
   - **Job Type** ⭐ (e.g., select "full-time")
   - Salary Min & Max (optional)
3. Click **Post Job**
4. You should see "Job posted successfully!" message
5. Should redirect to `/hr` dashboard

### If Still Not Working

1. Check **Supabase Logs**:
   - Go to Supabase Dashboard
   - Click **Logs** in left sidebar
   - Look for any error messages in the past few minutes

2. Check **Network Tab**:
   - Open Developer Tools (F12)
   - Go to **Network** tab
   - Try posting a job
   - Look for failed requests (red X)
   - Click on the failed request to see the error

3. Share the error details from:
   - Browser console error message
   - Supabase logs error message
   - Network tab response error

### Database Setup Commands

If you prefer, here's the quick reference:

1. `SUPABASE_SETUP.md` file location: `c:\Users\aarya\OneDrive\Desktop\talentforge\SUPABASE_SETUP.md`
2. Copy everything from line 39 onwards
3. Paste in Supabase SQL Editor
4. Run

---

**Need help?** Check the error message in the browser console first - that's the key to debugging this!
