# Supabase Database Setup Guide

Your TalentForge application requires specific database tables to be created in your Supabase project. Follow these steps to set up your database.

## Quick Start

1. Go to your Supabase project at: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL script below
5. Click **Run** to create all required tables

## SQL Setup Script

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('hr', 'applicant', 'interviewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HR profiles table
CREATE TABLE IF NOT EXISTS hr_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  phone VARCHAR(20),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  hiring_needs TEXT,
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create applicant profiles table
CREATE TABLE IF NOT EXISTS applicant_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  location VARCHAR(255),
  current_role VARCHAR(100),
  experience_years INT,
  skills TEXT[],
  resume_url VARCHAR(255),
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hr_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title VARCHAR(255) NOT NULL,
  job_description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  salary_min INT,
  salary_max INT,
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  org_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url VARCHAR(255),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own role"
  ON user_roles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for hr_profiles
CREATE POLICY "HR users can view their own profile"
  ON hr_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "HR users can update their own profile"
  ON hr_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "HR users can insert their own profile"
  ON hr_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for applicant_profiles
CREATE POLICY "Applicants can view their own profile"
  ON applicant_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Applicants can update their own profile"
  ON applicant_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Applicants can insert their own profile"
  ON applicant_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for job_postings
CREATE POLICY "Anyone can view all job postings"
  ON job_postings FOR SELECT
  USING (true);

CREATE POLICY "HR users can create job postings"
  ON job_postings FOR INSERT
  WITH CHECK (auth.uid() = hr_id);

CREATE POLICY "HR users can update their own job postings"
  ON job_postings FOR UPDATE
  USING (auth.uid() = hr_id);

CREATE POLICY "HR users can delete their own job postings"
  ON job_postings FOR DELETE
  USING (auth.uid() = hr_id);

-- Create RLS policies for job_applications
CREATE POLICY "Candidates can view their own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = candidate_id OR auth.uid() IN (SELECT hr_id FROM job_postings WHERE id = job_id));

CREATE POLICY "Candidates can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "HR users can view applications for their jobs"
  ON job_applications FOR SELECT
  USING (auth.uid() IN (SELECT hr_id FROM job_postings WHERE id = job_id));

CREATE POLICY "HR users can update applications for their jobs"
  ON job_applications FOR UPDATE
  USING (auth.uid() IN (SELECT hr_id FROM job_postings WHERE id = job_id));
```

## Step-by-Step Instructions

### 1. Create Tables in Supabase

- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **SQL Editor** → **New Query**
- Paste the SQL script above
- Click **Run**

### 2. Verify Tables Were Created

Go to **Database** → **Tables** and confirm you see:
- `user_roles`
- `hr_profiles`
- `applicant_profiles`
- `organizations`

### 3. Test Your Setup

Now you can:

1. **Sign Up**: Go to http://localhost:3000/auth/signup
   - Create a new account as either HR or Candidate
   - The signup process will automatically create the required database records

2. **Login**: Go to http://localhost:3000/auth/login
   - Use the email and password you just created
   - You should be redirected to the onboarding page

## Troubleshooting

### Error: "Account not found. Please sign up first"
- This means either:
  1. You haven't signed up yet → Go to `/auth/signup` first
  2. The database tables don't exist → Run the SQL script above
  3. Your `user_roles` table is empty → Sign up properly to create your user record

### Error: "Failed to load user role"
- The `user_roles` table might not have your user's record
- Try signing up again from `/auth/signup`

### Error: "Database connection error"
- Check your `.env.local` file has valid Supabase credentials:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_key
  ```

### Still having issues?
- Open browser console (F12 → Console tab) and check for error messages
- The system will now show more detailed error messages to help with debugging
- Check [Supabase Logs](https://app.supabase.com/project/_/logs/edge-functions) for backend errors

## Recommended Next Steps

1. ✅ Run the SQL setup script above
2. ✅ Go to `/auth/signup` and create a test account
3. ✅ Go to `/auth/login` and log in with your test account
4. ✅ Complete the onboarding process
5. ✅ You should now have access to the dashboard

## Important Security Notes

- **Never share your `SUPABASE_SERVICE_ROLE_KEY`** with anyone
- The `.env.local` file is already in `.gitignore`, so it won't be committed
- Row-Level Security (RLS) ensures users can only see their own data
- All auth is handled by Supabase's built-in authentication system
