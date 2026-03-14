/**
 * MOCK DATA
 * Used when Supabase/OpenAI keys are not yet set.
 * Replace nothing — this auto-disables when real keys are added.
 */

export const MOCK_USER = {
  id: 'mock-user-1',
  email: 'hr@talentforge.dev',
  name: 'Priya Sharma',
  role: 'hr' as const,
  org_id: 'mock-org-1',
}

export const MOCK_CANDIDATE = {
  id: 'mock-candidate-1',
  email: 'candidate@talentforge.dev',
  name: 'Rahul Mehta',
  role: 'candidate' as const,
  org_id: 'mock-org-1',
}

export const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'Senior Backend Engineer',
    domain: 'Engineering',
    level: 'Senior',
    description: 'Build scalable APIs handling 1M+ requests/day using Node.js, PostgreSQL, and Redis.',
    org_id: 'mock-org-1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    candidates_count: 12,
    avg_score: 74,
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    domain: 'Product',
    level: 'Mid',
    description: 'Own the product roadmap for our B2B SaaS platform, coordinate with engineering and design.',
    org_id: 'mock-org-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    candidates_count: 8,
    avg_score: 68,
  },
  {
    id: 'job-3',
    title: 'Frontend Engineer',
    domain: 'Engineering',
    level: 'Junior',
    description: 'Build beautiful, accessible UIs using React, Next.js, and Tailwind CSS.',
    org_id: 'mock-org-1',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    candidates_count: 21,
    avg_score: 71,
  },
]

export const MOCK_CANDIDATES = [
  {
    id: 'c1', name: 'Rahul Mehta', job_title: 'Senior Backend Engineer',
    overall_score: 82, percentile_rank: 88, hr_signal: 'hire' as const,
    emotion: 'confident' as const, completed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    applications: [
      { job_title: 'Senior Backend Engineer', company: 'TechCorp', location: 'Bangalore', status: 'Interview', applied_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { job_title: 'Full Stack Developer', company: 'StartupXYZ', location: 'Mumbai', status: 'Applied', applied_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      { job_title: 'Backend Engineer', company: 'FinTech Inc', location: 'Delhi', status: 'Rejected', applied_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'c2', name: 'Sneha Patel', job_title: 'Product Manager',
    overall_score: 61, percentile_rank: 54, hr_signal: 'hold' as const,
    emotion: 'neutral' as const, completed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    applications: [
      { job_title: 'Product Manager', company: 'EcomGiant', location: 'Bangalore', status: 'Applied', applied_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'c3', name: 'Arjun Singh', job_title: 'Frontend Engineer',
    overall_score: 44, percentile_rank: 23, hr_signal: 'reject' as const,
    emotion: 'stressed' as const, completed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    applications: [],
  },
  {
    id: 'c4', name: 'Divya Nair', job_title: 'Senior Backend Engineer',
    overall_score: 76, percentile_rank: 72, hr_signal: 'hire' as const,
    emotion: 'confident' as const, completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applications: [
      { job_title: 'Senior Backend Engineer', company: 'DataFlow', location: 'Chennai', status: 'Interview', applied_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { job_title: 'Tech Lead', company: 'InnovateLabs', location: 'Hyderabad', status: 'Applied', applied_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
]

export const MOCK_QUESTIONS = [
  { id: 'q1', tier: 'intro' as const, text: 'Tell me about yourself and your background in software engineering.', order: 1 },
  { id: 'q2', tier: 'intro' as const, text: 'Why are you interested in this role at our company?', order: 2 },
  { id: 'q3', tier: 'technical' as const, text: 'How would you design a scalable API service handling one million requests per day?', order: 3 },
  { id: 'q4', tier: 'technical' as const, text: 'Explain the difference between SQL and NoSQL databases and when you would use each.', order: 4 },
  { id: 'q5', tier: 'technical' as const, text: 'Walk me through how you would debug a production outage at 3am.', order: 5 },
  { id: 'q6', tier: 'advanced' as const, text: 'Describe a time you had to make a difficult technical decision under tight deadlines. What was the outcome?', order: 6 },
  { id: 'q7', tier: 'advanced' as const, text: 'How do you approach mentoring junior engineers while managing your own delivery commitments?', order: 7 },
]

export const MOCK_REPORT = {
  session_id: 'session-mock-1',
  candidate_name: 'Rahul Mehta',
  job_title: 'Senior Backend Engineer',
  overall_score: 82,
  percentile_rank: 88,
  total_candidates_in_pool: 340,
  role_fit_percentage: 85,
  role_fit_reasoning: 'Candidate demonstrates strong system design depth, clear understanding of distributed systems, and confident communication under pressure. Minor gaps identified in team conflict resolution and cross-functional leadership scenarios.',
  strengths: [
    'Exceptional system design knowledge',
    'Clear and structured communication',
    'Strong technical depth in backend architecture',
    'Confident and fast response times',
  ],
  gaps: [
    'Limited experience with cross-functional leadership',
    'Some hesitation on team conflict scenarios',
  ],
  emotion_summary: 'Candidate showed high confidence throughout technical sections. Mild hesitation detected on leadership questions — likely nervousness rather than lack of knowledge.',
  hr_signal: 'hire' as const,
  scores_breakdown: {
    correctness: 86,
    relevance: 84,
    clarity: 88,
    depth: 79,
    emotion_score: 74,
    overall: 82,
  },
  responses: [
    {
      id: 'r1', question_text: 'Tell me about yourself.',
      answer_text: 'I have 4 years of experience building backend systems at scale...',
      response_latency_ms: 2400, hedging_count: 0, emotion: 'confident' as const,
      scores: { correctness: 88, relevance: 90, clarity: 92, depth: 80, emotion_score: 85, overall: 87 },
    },
    {
      id: 'r2', question_text: 'Design a scalable API handling 1M requests/day.',
      answer_text: 'I would use a load balancer with horizontal scaling, Redis caching...',
      response_latency_ms: 3200, hedging_count: 1, emotion: 'confident' as const,
      scores: { correctness: 90, relevance: 88, clarity: 85, depth: 88, emotion_score: 80, overall: 86 },
    },
    {
      id: 'r3', question_text: 'How do you handle team conflicts?',
      answer_text: 'I think maybe the best approach is to try and have a conversation...',
      response_latency_ms: 7800, hedging_count: 4, emotion: 'hesitant' as const,
      scores: { correctness: 65, relevance: 70, clarity: 60, depth: 55, emotion_score: 48, overall: 60 },
    },
  ],
}
