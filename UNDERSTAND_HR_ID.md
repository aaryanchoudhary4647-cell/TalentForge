# Understanding HR ID - How Job Posting Ties to HR Accounts

## How HR ID Works (Automatically) ✅

When an HR manager signs up:

1. **Supabase creates an authentication record** with a unique `id`
   - Example: `550e8400-e29b-41d4-a716-446655440000`

2. **We store this as their HR profile ID**
   - In `hr_profiles` table: `id = 550e8400-e29b-41d4-a716-446655440000`

3. **When they create a job posting, we use that same ID as `hr_id`**
   - The job automatically links to that HR
   - Example job record: `hr_id = 550e8400-e29b-41d4-a716-446655440000`

**This happens automatically - no manual ID entry needed!**

---

## Error: "Missing hr_id" - Why?

If you see "missing hr_id" error, it means one of these:

### 1. ❌ `user.id` is not being populated
- **Check**: Open browser console (F12 → Console)
- **Look for**: Message starting with "✅ User loaded for job posting:"
- **Should show**: An id like `550e8400-e29b...`

**Fix if missing**: 
- Log out and log back in
- Make sure you're logged in as **HR** (not Candidate)

### 2. ❌ Signed up as Candidate, not HR
- **Check**: When signing up, make sure "HR Recruiter" is selected
- **Fix**: Sign up again, this time select "HR Recruiter"

### 3. ❌ HR profile was not created during signup
- **Check in Supabase**:
  1. Go to Supabase Dashboard
  2. Click **Database** → **Tables** → `hr_profiles`
  3. Look for a row with your user ID
  4. If not there, your signup didn't complete properly

**Fix**: 
- Sign up again making sure you go through the full flow
- Or manually insert in Supabase:
  ```sql
  INSERT INTO hr_profiles (id, company_name)
  VALUES ('your-user-id-here', 'Your Company');
  ```

### 4. ❌ RLS Policy not set up correctly
- **Check**: Run the full SUPABASE_SETUP.md script
- **Must include**: The RLS policy that allows HR to insert jobs:
  ```sql
  CREATE POLICY "HR users can create job postings"
    ON job_postings FOR INSERT
    WITH CHECK (auth.uid() = hr_id);
  ```

**Fix**: Run SUPABASE_SETUP.md again in SQL Editor

---

## How to Verify Everything is Set Up ✅

### Step 1: Check User ID When Logged In
1. Open browser console (F12)
2. When page loads, look for message:
   ```
   ✅ User loaded for job posting: 
   {
     id: "550e8400-e29b-41d4-a716-446655440000",
     email: "hr@company.com",
     name: "John Doe",
     role: "hr"
   }
   ```

**If you don't see this** → User is not loading. Log out/in again.

### Step 2: Check HR Profile in Database
1. Go to Supabase Dashboard
2. Click **SQL Editor** → **New Query**
3. Run:
   ```sql
   SELECT id, company_name FROM hr_profiles;
   ```
4. You should see a row with your user ID

### Step 3: Try Posting a Job
1. Fill in the form  
2. Click "Post Job"
3. Should see SUCCESS message ✅

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────┐
│ HR SIGNS UP (auth/signup)                   │
├─────────────────────────────────────────────┤
│ Email: hr@company.com                       │
│ Password: ••••••••                          │
│ Role: HR Recruiter ← SELECT THIS            │
└────────────┬────────────────────────────────┘
             │
             ↓
     SUPABASE CREATES AUTH
         user.id = abc123
             │
             ↓
  ┌──────────┴──────────┐
  │                     │
  ↓                     ↓
user_roles         hr_profiles
id: abc123         id: abc123
role: hr           company_name: ""
                   
             │
             ↓
  ┌─────────────────────┐
  │  HR CREATES JOB     │
  │  /hr/jobs           │
  └─────────┬───────────┘
            │
            ↓
  ┌─────────────────────┐
  │  WE INSERT:         │
  │  hr_id: abc123 ◄─── AUTO FROM user.id!
  │  job_title: ...     │
  │  ...                │
  └─────────┬───────────┘
            │
            ↓
  ┌─────────────────────┐
  │   job_postings      │
  │   id: xyz789        │
  │   hr_id: abc123     │
  │   job_title: ...    │
  └─────────────────────┘
```

---

## Debugging Checklist

Before posting a job, verify:

- [ ] You're logged in as **HR** (not Candidate)
- [ ] Browser console shows "✅ User loaded for job posting" with your ID
- [ ] Supabase has your user in `hr_profiles` table
- [ ] SUPABASE_SETUP.md has been run (all tables exist)
- [ ] You filled all required fields
- [ ] Click "Post Job" button

If error still shows "missing hr_id":
1. Open console (F12)
2. Look for "📤 Posting job with HR user ID:" message
3. Check if `hr_id` field is empty or has a value
4. Share the value or "undefined" in your error report

---

## FAQ

**Q: Do I need to manually type my HR ID?**
A: No! It's automatically set from your Supabase account ID.

**Q: What if I see "Only HR users can post jobs. You are logged in as: candidate"?**
A: You signed up as a Candidate. You need to sign up again as an HR Recruiter.

**Q: Can one HR post multiple jobs?**
A: Yes! Each job will have the same `hr_id` (your unique ID). That's how Supabase knows it's your job.

**Q: What if two HRs have the same email?**
A: Impossible. Supabase auth prevents duplicate emails. Each HR gets a unique ID.

---

## Getting Help

When reporting "missing hr_id" error:

1. Open browser console (F12 → Console)
2. Copy the error message
3. Share screenshot showing:
   - The red error on the form
   - The "✅ User loaded" message in console (or say if missing)
   - Any ❌ error messages in red

This will help us diagnose faster!
