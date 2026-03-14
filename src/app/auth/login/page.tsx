'use client'

import React, { useState } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────────
   FlipBook Login  ·  Applicant ↔ HR
   
   Mechanism (identical to the FlorinPop codepen):
   ─ Two full-height static panels sit left (Applicant) and right (HR).
   ─ A single half-width .page element is hinged at its LEFT edge,
     which coincides with the book's centre spine.
   ─ Front face (purple) = HR invite — covers right panel by default.
   ─ Back face  (pink)   = Applicant invite — revealed when flipped.
   ─ rotateY(-180deg) sweeps the page from right → left.
   ────────────────────────────────────────────────────────────── */

// ─── Shared icon SVGs ────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#0077B5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#333">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const ApplicantSVG = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const HRSvg = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────

const css: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex", 
    flexDirection: "column", // <-- ADDED THIS: Stacks children vertically
    alignItems: "center", 
    justifyContent: "center",
    background: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)",
    fontFamily: "'Inter','Segoe UI',system-ui,-apple-system,sans-serif",
    padding: 24,
  },

  // book
  container: {
    position: "relative" as const,
    width: "min(820px, calc(100vw - 48px))", 
    height: "auto",
    minHeight: 520,
    borderRadius: 24,
    boxShadow: "0 25px 60px rgba(0,0,0,.45)",
    overflow: "hidden",
    perspective: 1800,
  },

  // static panels
  panel: {
    position: "absolute" as const,
    top: 0, width: "50%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fff",
    overflowY: "auto" as const,
  },

  panelContent: {
    width: "100%", padding: "32px 24px",
    display: "flex", flexDirection: "column" as const, justifyContent: "center",
    boxSizing: "border-box" as const,
    minHeight: "100%",
  },

  formTitle:    { fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", color: "#1a1a2e", marginBottom: 4, wordBreak: "break-word" as const },
  formSubtitle: { fontSize: 12, color: "#999", marginBottom: 20, wordBreak: "break-word" as const },
  fieldLabel:   { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase" as const, color: "#aaa", marginBottom: 5 },

  fieldInput: {
    width: "100%", padding: "12px 14px",
    border: "1.5px solid #eaeaf0", borderRadius: 10,
    fontSize: 13, color: "#1a1a2e", background: "#fafafd",
    outline: "none", boxSizing: "border-box" as const, marginBottom: 10,
    transition: "border-color .2s, box-shadow .2s",
  },

  formRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap" as const, gap: 8,
  },
  cbRow:   { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const },
  cbLabel: { fontSize: 11, color: "#888", cursor: "pointer", wordBreak: "break-word" as const },
  forgot:  { fontSize: 11, color: "#bbb", cursor: "pointer", transition: "color .2s", wordBreak: "break-word" as const },

  signBtn: {
    width: "100%", padding: 12, border: "none", borderRadius: 11,
    fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
    letterSpacing: ".3px", transition: "transform .2s, box-shadow .2s",
  },

  divRow:  { display: "flex", alignItems: "center", gap: 8, margin: "12px 0", fontSize: 10, color: "#ccc", textTransform: "uppercase" as const, letterSpacing: ".5px" },
  divLine: { flex: 1, height: 1, background: "#eaeaf0" },

  socialRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" as const },
  socBtn: {
    width: 40, height: 40, borderRadius: 10,
    border: "1.5px solid #eaeaf0", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "border-color .2s, transform .2s", flexShrink: 0,
  },

  // flipping page
  page: {
    position: "absolute" as const,
    top: 0, left: "50%", width: "50%", height: "100%",
    transformOrigin: "left center",
    transformStyle: "preserve-3d" as const,
    transition: "transform .85s cubic-bezier(.4,.2,.2,1)",
    zIndex: 10,
  },

  face: {
    position: "absolute" as const, inset: 0,
    backfaceVisibility: "hidden" as const, overflow: "hidden",
    display: "flex", flexDirection: "column" as const,
    alignItems: "center", justifyContent: "center",
    padding: "44px 36px", textAlign: "center" as const, color: "#fff",
  },

  faceBack: { transform: "rotateY(180deg)" },

  blob: {
    position: "absolute" as const, borderRadius: "50%",
    background: "rgba(255,255,255,.08)", pointerEvents: "none" as const,
  },

  iconRing: {
    width: 68, height: 68, borderRadius: "50%",
    background: "rgba(255,255,255,.18)", border: "1.5px solid rgba(255,255,255,.28)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 20, backdropFilter: "blur(8px)",
  },

  inviteTitle: { fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", marginBottom: 10, wordBreak: "break-word" as const },
  inviteText:  { fontSize: 12, lineHeight: 1.65, opacity: .82, marginBottom: 26, maxWidth: 240, wordBreak: "break-word" as const },

  switchBtn: {
    padding: "10px 24px",
    border: "2px solid rgba(255,255,255,.55)", borderRadius: 50,
    background: "rgba(255,255,255,.12)", color: "#fff",
    fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: ".4px",
    backdropFilter: "blur(4px)", transition: "background .25s, border-color .25s, transform .2s", whiteSpace: "nowrap" as const,
  },

  // spine
  spine: {
    position: "absolute" as const, top: 0, left: "calc(50% - 1px)", width: 2, height: "100%",
    background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.1) 20%, rgba(0,0,0,.15) 50%, rgba(0,0,0,.1) 80%, transparent)",
    zIndex: 20, pointerEvents: "none" as const,
  },

  signupLink: {
    fontSize: 14, // slightly bumped up for better visibility
    color: "#fff", 
    cursor: "pointer", 
    transition: "color .2s",
    fontWeight: 500,
    textDecoration: "underline",
    textUnderlineOffset: "4px"
  },
};

// ─── LoginForm ───────────────────────────────────────────────

interface FormProps {
  title: string;
  subtitle: string;
  emailPlaceholder: string;
  accentColor: string;
  btnGradient: string;
  btnShadow: string;
}

const LoginForm: React.FC<FormProps> = ({ title, subtitle, emailPlaceholder, accentColor, btnGradient, btnShadow }) => {
  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = accentColor;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}22`;
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#eaeaf0";
    e.currentTarget.style.boxShadow = "none";
  };

  const socials = [
    { icon: <GoogleIcon />, label: "Google" },
    { icon: <LinkedInIcon />, label: "LinkedIn" },
    { icon: <GitHubIcon />, label: "GitHub" },
  ];

  return (
    <div style={css.panelContent}>
      <h2 style={css.formTitle}>{title}</h2>
      <p style={css.formSubtitle}>{subtitle}</p>

      <label style={css.fieldLabel}>Email</label>
      <input type="email" placeholder={emailPlaceholder} style={css.fieldInput} onFocus={focusInput} onBlur={blurInput} />
      <label style={css.fieldLabel}>Password</label>
      <input type="password" placeholder="••••••••" style={css.fieldInput} onFocus={focusInput} onBlur={blurInput} />

      <div style={css.formRow}>
        <div style={css.cbRow}>
          <input type="checkbox" id={`cb-${title}`} style={{ accentColor }} />
          <label htmlFor={`cb-${title}`} style={css.cbLabel}>Remember me</label>
        </div>
        <span
          style={css.forgot}
          onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#bbb")}
        >
          Forgot password?
        </span>
      </div>

      <button
        style={{ ...css.signBtn, background: btnGradient, boxShadow: btnShadow }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        onClick={(e) => e.preventDefault()}
      >
        Sign In
      </button>

      <div style={css.divRow}>
        <div style={css.divLine} />
        <span>or continue with</span>
        <div style={css.divLine} />
      </div>

      <div style={css.socialRow}>
        {socials.map(({ icon, label }) => (
          <button
            key={label}
            style={css.socBtn}
            title={label}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#eaeaf0"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── InviteFace ──────────────────────────────────────────────

interface InviteProps {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  btnLabel: string;
  faceSide: "front" | "back";
  onFlip: () => void;
}

const InviteFace: React.FC<InviteProps> = ({ gradient, icon, title, text, btnLabel, faceSide, onFlip }) => (
  <div style={{ ...css.face, ...(faceSide === "back" ? css.faceBack : {}), background: gradient }}>
    {/* blobs */}
    <div style={{ ...css.blob, width: 160, height: 160, top: -44, right: -44 }} />
    <div style={{ ...css.blob, width: 100, height: 100, bottom: -26, left: -26 }} />
    <div style={{ ...css.blob, width: 56, height: 56, top: "44%", left: "12%", background: "rgba(255,255,255,.05)" }} />

    <div style={css.iconRing}>{icon}</div>
    <h3 style={css.inviteTitle}>{title}</h3>
    <p style={css.inviteText}>{text}</p>
    <button
      style={css.switchBtn}
      onClick={onFlip}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.24)"; e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.55)"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      {btnLabel}
    </button>
  </div>
);

// ─── Root ─────────────────────────────────────────────────────

const Login: React.FC = () => {
  const [flipped, setFlipped] = useState(false);
  const flip = () => setFlipped((p) => !p);

  return (
    <div style={css.wrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={css.container}>

        {/* ── Static left: Applicant login ── */}
        <div style={{ ...css.panel, left: 0 }}>
          <LoginForm
            title="Welcome back"
            subtitle="Sign in to your applicant account"
            emailPlaceholder="you@example.com"
            accentColor="#667eea"
            btnGradient="linear-gradient(135deg,#667eea,#764ba2)"
            btnShadow="0 8px 20px rgba(102,126,234,.35)"
          />
        </div>

        {/* ── Static right: HR login ── */}
        <div style={{ ...css.panel, right: 0 }}>
          <LoginForm
            title="Hello, Recruiter"
            subtitle="Sign in to your HR dashboard"
            emailPlaceholder="hr@company.com"
            accentColor="#f5576c"
            btnGradient="linear-gradient(135deg,#f093fb,#f5576c)"
            btnShadow="0 8px 20px rgba(245,87,108,.35)"
          />
        </div>

        {/* ── Flipping page — hinge at centre spine ── */}
        <div
          style={{
            ...css.page,
            transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)",
          }}
        >
          {/* FRONT: HR invite (covers right panel by default) */}
          <InviteFace
            faceSide="front"
            gradient="linear-gradient(135deg,#667eea 0%,#764ba2 100%)"
            icon={<HRSvg />}
            title="Are you hiring?"
            text="Switch to the HR portal to post roles, shortlist talent, and manage your entire pipeline in one place."
            btnLabel="HR Login →"
            onFlip={flip}
          />

          {/* BACK: Applicant invite (covers left panel after flip) */}
          <InviteFace
            faceSide="back"
            gradient="linear-gradient(135deg,#f093fb 0%,#f5576c 100%)"
            icon={<ApplicantSVG />}
            title="Looking for work?"
            text="Head back to the applicant portal to explore open roles, track your applications, and land your next opportunity."
            btnLabel="← Applicant Login"
            onFlip={flip}
          />
        </div>

        {/* spine shadow */}
        <div style={css.spine} />

      </div>

      {/* Navigation link positioned neatly below the login container */}
      <div style={{ 
        marginTop: 32, // Adjusted margin to sit closer to the book
        textAlign: "center", 
        color: "#fff", 
        padding: "0 16px", 
        zIndex: 1,
      }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Don't have an account? </span>
        <Link href="/auth/signup" style={css.signupLink}>
          Create one
        </Link>
      </div>
    </div>
  );
};

export default Login;