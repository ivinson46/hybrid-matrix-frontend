import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useTranslation } from "./translations.js";

const API = "https://web-production-1d446.up.railway.app";

const LangContext = createContext("en");
const useLang = () => {
  const lang = useContext(LangContext);
  return useTranslation(lang);
};

const STATS = [
  { value: "39", label: "PROGRAMS" },
  { value: "480+", label: "EXERCISES" },
  { value: "5", label: "TIERS" },
  { value: "EN/ES", label: "BILINGUAL" },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

// Onboarding question definitions — labels resolved via translation at render time
const ONBOARDING_QUESTIONS = [
  { id: "goal",       qKey: "q_goal",       optKeys: ["goal_fat_loss","goal_muscle","goal_athletic","goal_general","goal_glutes"],   values: ["Fat Loss","Muscle & Strength","Athletic Performance","General Fitness","Glutes & Lower Body"] },
  { id: "experience", qKey: "q_experience", optKeys: ["exp_beginner","exp_intermediate","exp_advanced"],                             values: ["Beginner (0-1 year)","Intermediate (1-3 years)","Advanced (3+ years)"] },
  { id: "days",       qKey: "q_days",       optKeys: ["days_3","days_4","days_5","days_6"],                                          values: ["3 days","4 days","5 days","6 days"] },
  { id: "gender",     qKey: "q_gender",     optKeys: ["gender_mens","gender_womens","gender_both"],                                  values: ["Men's Programs","Women's Programs","Both"] },
  { id: "limitation", qKey: "q_limitation", optKeys: ["limit_none","limit_back","limit_knee","limit_shoulder","limit_other"],        values: ["None","Lower back issues","Knee issues","Shoulder issues","Other / Multiple"] },
];

function getCategoryColor(category) {
  const map = {
    "Hypertrophy": "#00FF87",
    "Fat Loss": "#00D4FF",
    "Athletic": "#FF6B35",
    "Strength": "#A855F7",
    "General Fitness": "#00FF87",
    "Glutes": "#FF6B9D",
  };
  return map[category] || "#00FF87";
}

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? "#00FF87" : "#00D4FF",
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
  );
}

const inputStyle = {
  padding: "13px 16px", background: "#050810", border: "1px solid #1a2744",
  borderRadius: "8px", color: "#E2E8F0", fontSize: "11px", letterSpacing: "2px",
  fontFamily: "'Courier New', monospace", outline: "none", width: "100%", boxSizing: "border-box",
};

function AuthModal({ mode, onClose, onSuccess }) {
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetDone, setResetDone] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = tab === "register" ? `${API}/api/v1/auth/register` : `${API}/api/v1/auth/login`;
      const body = tab === "register"
        ? { email: form.email, password: form.password, full_name: form.full_name }
        : { email: form.email, password: form.password };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      const displayName = data.full_name ? data.full_name : form.email.split("@")[0];
      localStorage.setItem("hm_token", data.access_token);
      localStorage.setItem("hm_user", JSON.stringify({ id: data.user_id, name: displayName, tier: data.tier, role: data.account_type, email: form.email, onboarded: false }));
      onSuccess({ ...data, resolvedName: displayName });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const submitForgot = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.reset_token) { setResetToken(data.reset_token); setResetMode(true); }
      else setError("No account found with that email.");
    } catch { setError("Something went wrong. Try again."); } finally { setLoading(false); }
  };

  const submitReset = async () => {
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed");
      setResetDone(true);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const overlayStyle = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" };
  const cardStyle = { background: "linear-gradient(145deg, #0A0F1E, #0D1525)", border: "1px solid #1a2744", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "420px" };

  // ── Forgot password screens ──
  if (forgotMode) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", fontFamily: MONO, marginBottom: "8px" }}>HYBRID MATRIX</div>
            {resetDone ? (
              <>
                <div style={{ fontSize: "22px", marginBottom: "10px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS }}>Password Updated</div>
                <div style={{ fontSize: "14px", color: "#718096", fontFamily: SANS, marginTop: "8px" }}>You can now log in with your new password.</div>
                <button onClick={() => { setForgotMode(false); setResetMode(false); setResetDone(false); setTab("login"); }} style={{ marginTop: "24px", width: "100%", padding: "14px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "10px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "15px", fontFamily: SANS }}>Back to Login</button>
              </>
            ) : resetMode ? (
              <>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS }}>Set New Password</div>
                <div style={{ fontSize: "14px", color: "#718096", fontFamily: SANS, marginTop: "6px" }}>Choose a new password for your account.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px", textAlign: "left" }}>
                  <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ ...inputStyle, fontFamily: SANS, fontSize: "14px", letterSpacing: "0" }} />
                  <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submitReset()} style={{ ...inputStyle, fontFamily: SANS, fontSize: "14px", letterSpacing: "0" }} />
                </div>
                {error && <div style={{ color: "#FF4444", fontSize: "13px", marginTop: "12px", fontFamily: SANS }}>⚠ {error}</div>}
                <button onClick={submitReset} disabled={loading} style={{ marginTop: "20px", width: "100%", padding: "14px", background: loading ? "#1a2744" : "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "10px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "15px", fontFamily: SANS }}>{loading ? "Updating..." : "Update Password"}</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS }}>Reset Password</div>
                <div style={{ fontSize: "14px", color: "#718096", fontFamily: SANS, marginTop: "6px" }}>Enter your email and we'll send a reset link.</div>
                <div style={{ marginTop: "24px", textAlign: "left" }}>
                  <input type="email" placeholder="Your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submitForgot()} style={{ ...inputStyle, fontFamily: SANS, fontSize: "14px", letterSpacing: "0" }} />
                </div>
                {error && <div style={{ color: "#FF4444", fontSize: "13px", marginTop: "12px", fontFamily: SANS }}>⚠ {error}</div>}
                <button onClick={submitForgot} disabled={loading} style={{ marginTop: "20px", width: "100%", padding: "14px", background: loading ? "#1a2744" : "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "10px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "15px", fontFamily: SANS }}>{loading ? "Sending..." : "Send Reset Link"}</button>
                <button onClick={() => setForgotMode(false)} style={{ marginTop: "10px", width: "100%", padding: "12px", background: "transparent", border: "1px solid #1a2744", borderRadius: "10px", cursor: "pointer", color: "#4A5568", fontSize: "14px", fontFamily: SANS }}>Back to Login</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#00FF87", marginBottom: "6px", fontFamily: MONO }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "11px", color: "#4A5568", letterSpacing: "3px", fontFamily: MONO }}>CORE ENGINE v2.0</div>
        </div>
        <div style={{ display: "flex", marginBottom: "24px", border: "1px solid #1a2744", borderRadius: "8px", overflow: "hidden" }}>
          {["login", "register"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: "12px", background: tab === t ? "#00FF8715" : "transparent", border: "none", cursor: "pointer", color: tab === t ? "#00FF87" : "#4A5568", fontSize: "13px", fontWeight: tab === t ? "600" : "400", fontFamily: SANS, borderBottom: tab === t ? "2px solid #00FF87" : "2px solid transparent" }}>{t === "login" ? "Log In" : "Register"}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tab === "register" && <input name="full_name" placeholder="Full name" value={form.full_name} onChange={handle} style={{ ...inputStyle, fontFamily: SANS, fontSize: "14px", letterSpacing: "0" }} />}
          <input name="email" placeholder="Email" type="email" value={form.email} onChange={handle} style={{ ...inputStyle, fontFamily: SANS, fontSize: "14px", letterSpacing: "0" }} />
          <input name="password" placeholder="Password" type="password" value={form.password} onChange={handle} onKeyDown={(e) => e.key === "Enter" && submit()} style={{ ...inputStyle, fontFamily: SANS, fontSize: "14px", letterSpacing: "0" }} />
        </div>
        {tab === "login" && (
          <button onClick={() => { setForgotMode(true); setError(""); }} style={{ marginTop: "10px", background: "none", border: "none", cursor: "pointer", color: "#00FF87", fontSize: "13px", fontFamily: SANS, padding: 0 }}>Forgot password?</button>
        )}
        {error && <div style={{ marginTop: "12px", color: "#FF4444", fontSize: "13px", fontFamily: SANS }}>⚠ {error}</div>}
        <button onClick={submit} disabled={loading} style={{ marginTop: "20px", width: "100%", padding: "14px", background: loading ? "#1a2744" : "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer", color: "#050810", fontWeight: "700", fontSize: "15px", fontFamily: SANS }}>
          {loading ? "Processing..." : tab === "register" ? "Create Account" : "Enter Matrix"}
        </button>
        <button onClick={onClose} style={{ marginTop: "10px", width: "100%", padding: "12px", background: "transparent", border: "1px solid #1a2744", borderRadius: "10px", cursor: "pointer", color: "#4A5568", fontSize: "14px", fontFamily: SANS }}>Cancel</button>
      </div>
    </div>
  );
}

function OnboardingModal({ userName, onComplete }) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;
  const select = (value) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (isLast) { onComplete(newAnswers); } else { setStep(step + 1); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "linear-gradient(145deg, #0A0F1E, #0D1525)", border: "1px solid #1a2744", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "500px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "8px", fontFamily: MONO }}>{t("personalizing")}</div>
          <div style={{ fontSize: "16px", color: "#E2E8F0", fontWeight: "700", fontFamily: SANS }}>{t("welcome")} {userName.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {ONBOARDING_QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= step ? "#00FF87" : "#1a2744", transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ fontSize: "10px", color: "#4A5568", letterSpacing: "2px", marginBottom: "10px", fontFamily: MONO }}>{t("question_of", { n: step + 1, total: ONBOARDING_QUESTIONS.length })}</div>
        <div style={{ fontSize: "17px", fontWeight: "700", color: "#E2E8F0", marginBottom: "20px", lineHeight: 1.4, fontFamily: SANS }}>{t(q.qKey)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.optKeys.map((optKey, i) => (
            <button key={optKey} onClick={() => select(q.values[i])} style={{ padding: "14px 18px", background: answers[q.id] === q.values[i] ? "#00FF8715" : "#050810", border: `1px solid ${answers[q.id] === q.values[i] ? "#00FF87" : "#1a2744"}`, borderRadius: "10px", cursor: "pointer", color: answers[q.id] === q.values[i] ? "#00FF87" : "#718096", fontSize: "14px", fontFamily: SANS, textAlign: "left", transition: "all 0.2s" }}>{t(optKey)}</button>
          ))}
        </div>
        <div style={{ marginTop: "20px", fontSize: "10px", color: "#4A5568", textAlign: "center", letterSpacing: "2px", fontFamily: MONO }}>{t("onboarding_note")}</div>
      </div>
    </div>
  );
}

function ProgramCard({ program, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const color = getCategoryColor(program.category);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onSelect(program)}
      style={{ background: hovered ? "linear-gradient(145deg, #0D1525, #111827)" : "linear-gradient(145deg, #080D1A, #0A0F1E)", border: `1px solid ${hovered ? color + "40" : "#1a2744"}`, borderRadius: "12px", padding: "24px", cursor: "pointer", transition: "all 0.25s", position: "relative", overflow: "hidden", boxShadow: hovered ? `0 0 30px ${color}15` : "none", fontFamily: "'Courier New', monospace" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: hovered ? `linear-gradient(90deg, transparent, ${color}, transparent)` : "transparent", transition: "all 0.3s" }} />
      <div style={{ display: "inline-block", padding: "3px 10px", border: `1px solid ${color}50`, borderRadius: "4px", fontSize: "8px", letterSpacing: "3px", color: color, marginBottom: "14px", background: `${color}10` }}>{program.category?.toUpperCase() || "PROGRAM"}</div>
      <div style={{ fontSize: "15px", fontWeight: "900", letterSpacing: "2px", color: "#E2E8F0", marginBottom: "10px", lineHeight: 1.3 }}>{program.name}</div>
      <div style={{ fontSize: "10px", color: "#718096", lineHeight: "1.7", marginBottom: "18px" }}>{program.description}</div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {[{ label: "LEVEL", value: program.intensity || "Moderate" }, { label: "DURATION", value: `${program.weeks} wks` }, { label: "DAYS/WK", value: program.days_per_week }, { label: "GENDER", value: program.gender || "Both" }].map((m) => (
          <div key={m.label}>
            <div style={{ fontSize: "8px", color: "#4A5568", letterSpacing: "2px" }}>{m.label}</div>
            <div style={{ fontSize: "10px", color: color, fontWeight: "700", letterSpacing: "1px" }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutView({ program, onBack }) {
  const { t } = useLang();
  const mobile = useIsMobile();
  const color = getCategoryColor(program.category);
  const [completedSets, setCompletedSets] = useState({});
  const [programExercises, setProgramExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    setCompletedSets({});
    setLogged(false);

    if (program.aiProgram) {
      const dayData = program.aiProgram.days.find(d => d.day_number === currentDay);
      setProgramExercises(dayData ? dayData.exercises.map((ex, i) => ({ ...ex, id: i })) : []);
      setLoading(false);
      return;
    }

    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/v1/programs/${program.id}/exercises?day=${currentDay}`);
        const data = await res.json();
        setProgramExercises(data.exercises || []);
      } catch (err) {
        console.error("Failed to fetch program exercises", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [program.id, currentDay]);

  const prescription = programExercises.length > 0
    ? { sets: programExercises[0].sets, reps: programExercises[0].reps, rest: `${programExercises[0].rest_seconds} sec` }
    : { sets: 3, reps: "10-12", rest: "60 sec" };

  const toggleSet = (exIdx, setIdx) => {
    const key = `${exIdx}-${setIdx}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalSets = programExercises.length * prescription.sets;
  const doneSets = Object.values(completedSets).filter(Boolean).length;
  const progress = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  useEffect(() => {
    if (progress !== 100 || logged) return;
    const logWorkout = async () => {
      try {
        const token = localStorage.getItem("hm_token");
        await fetch(`${API}/api/v1/workout-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            program_id: program.id,
            day_number: currentDay,
            week_number: 1,
            completed_exercises: completedSets,
          }),
        });
        setLogged(true);
      } catch (err) {
        console.error("Failed to log workout", err);
      }
    };
    logWorkout();
  }, [progress, logged]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 100%)", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2744", padding: mobile ? "14px 16px" : "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#05081099", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "9px", letterSpacing: "2px", color: color, marginBottom: "4px", fontFamily: MONO }}>{program.category?.toUpperCase()} — DAY {currentDay}</div>
          <div style={{ fontSize: mobile ? "13px" : "15px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{program.name}</div>
        </div>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid #1a2744", padding: "8px 14px", cursor: "pointer", color: "#4A5568", fontSize: "13px", fontFamily: SANS, borderRadius: "6px", marginLeft: "12px", flexShrink: 0 }}>← {t("back")}</button>
      </div>

      <div style={{ padding: mobile ? "16px" : "24px 32px", maxWidth: "800px", margin: "0 auto" }}>

        {/* Progress bar */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", color: "#4A5568", fontFamily: SANS }}>{t("workout_progress")}</div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: color, fontFamily: SANS }}>{t("complete_pct", { n: progress })}</div>
          </div>
          <div style={{ background: "#1a2744", borderRadius: "4px", height: "6px" }}>
            <div style={{ background: `linear-gradient(90deg, ${color}, #00D4FF)`, height: "100%", borderRadius: "4px", width: `${progress}%`, transition: "width 0.4s" }} />
          </div>
        </div>

        {/* Day navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          {Array.from({ length: program.days_per_week }).map((_, i) => (
            <button key={i} onClick={() => setCurrentDay(i + 1)} style={{
              padding: "8px 18px",
              background: currentDay === i + 1 ? color : "transparent",
              border: `1px solid ${currentDay === i + 1 ? color : "#1a2744"}`,
              borderRadius: "20px", cursor: "pointer",
              color: currentDay === i + 1 ? "#050810" : "#718096",
              fontSize: "13px", fontWeight: currentDay === i + 1 ? "700" : "400",
              fontFamily: SANS, transition: "all 0.2s",
            }}>Day {i + 1}</button>
          ))}
        </div>

        {/* Prescription */}
        <div style={{ background: "linear-gradient(145deg, #0D1525, #111827)", border: `1px solid ${color}30`, borderRadius: "14px", padding: "18px 20px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[{ label: t("sets"), value: prescription.sets }, { label: t("reps_label"), value: prescription.reps }, { label: t("rest"), value: prescription.rest }, { label: t("exercises"), value: programExercises.length }].map((m) => (
            <div key={m.label}>
              <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO }}>{m.label}</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: color, marginTop: "2px", fontFamily: SANS }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Exercise list */}
        <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#4A5568", marginBottom: "14px", fontFamily: MONO }}>{t("exercises_tap")}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {programExercises.map((ex, exIdx) => (
            <div key={ex.id} style={{ background: "#050D1A", border: "1px solid #1a2744", borderRadius: "14px", padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "10px", color: "#4A5568", letterSpacing: "1px", marginBottom: "4px", fontFamily: MONO }}>{ex.body_part} · {ex.equipment}</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS }}>{ex.name}</div>
                </div>
                {ex.video_url && (
                  <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", marginLeft: "12px", flexShrink: 0 }}>
                    <div style={{ width: "88px", height: "60px", borderRadius: "8px", border: `1px solid ${color}40`, background: "#050810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <div style={{ fontSize: "20px" }}>▶</div>
                      <div style={{ fontSize: "8px", color: color, fontFamily: MONO, letterSpacing: "1px", marginTop: "2px" }}>{t("watch")}</div>
                    </div>
                  </a>
                )}
              </div>

              {/* Set tracking */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: "12px", color: "#4A5568", fontFamily: SANS, marginRight: "4px" }}>{t("reps_unit", { n: prescription.reps })}</div>
                {Array.from({ length: prescription.sets }).map((_, setIdx) => {
                  const key = `${exIdx}-${setIdx}`;
                  const done = completedSets[key];
                  return (
                    <button key={setIdx} onClick={() => toggleSet(exIdx, setIdx)} style={{ width: "40px", height: "40px", borderRadius: "10px", border: `1px solid ${done ? color : "#1a2744"}`, background: done ? `${color}20` : "#0A0F1E", cursor: "pointer", color: done ? color : "#4A5568", fontSize: "13px", fontWeight: "700", fontFamily: SANS, transition: "all 0.2s" }}>
                      {done ? "✓" : setIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#4A5568", fontSize: "13px", fontFamily: SANS }}>
            {t("loading_workout")}
          </div>
        )}

        {progress === 100 && (
          <div style={{ marginTop: "32px", textAlign: "center", padding: "40px", background: "linear-gradient(145deg, #0D1525, #111827)", border: `1px solid ${color}40`, borderRadius: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏆</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: color, fontFamily: SANS, marginBottom: "8px" }}>{t("workout_complete")}</div>
            <div style={{ fontSize: "14px", color: "#718096", fontFamily: SANS }}>{t("day_logged", { n: currentDay })}</div>
            <button onClick={onBack} style={{ marginTop: "24px", padding: "14px 32px", background: `linear-gradient(90deg, ${color}, #00D4FF)`, border: "none", borderRadius: "10px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "14px", fontFamily: SANS }}>{t("back_to_programs")}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgramDetailModal({ program, onClose, onStart }) {
  const color = getCategoryColor(program.category);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(145deg, #0A0F1E, #0D1525)", border: `1px solid ${color}40`, borderRadius: "16px", padding: "40px", maxWidth: "600px", width: "100%", fontFamily: "'Courier New', monospace", boxShadow: `0 0 60px ${color}15`, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: "8px", letterSpacing: "4px", color: color, marginBottom: "8px" }}>{program.category?.toUpperCase()}</div>
        <h2 style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "2px", margin: "0 0 8px", color: "#E2E8F0" }}>{program.name}</h2>
        <p style={{ fontSize: "12px", color: "#718096", lineHeight: "1.8", marginBottom: "24px" }}>{program.description}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {[{ label: "DURATION", value: `${program.weeks} weeks` }, { label: "DAYS/WEEK", value: program.days_per_week }, { label: "INTENSITY", value: program.intensity }, { label: "GENDER", value: program.gender }].map((m) => (
            <div key={m.label} style={{ background: "#050810", borderRadius: "8px", padding: "12px", border: "1px solid #1a2744" }}>
              <div style={{ fontSize: "8px", color: "#4A5568", letterSpacing: "2px" }}>{m.label}</div>
              <div style={{ fontSize: "12px", fontWeight: "900", color: color, marginTop: "4px" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {program.tags && program.tags.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4A5568", marginBottom: "10px" }}>TAGS</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {program.tags.map((tag) => (
                <span key={tag} style={{ padding: "4px 10px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: "4px", fontSize: "9px", color: color, letterSpacing: "1px" }}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4A5568", marginBottom: "12px" }}>PROGRAM OVERVIEW</div>
          <div style={{ background: "#050810", borderRadius: "8px", padding: "20px", border: "1px solid #1a2744" }}>
            <div style={{ fontSize: "11px", color: "#718096", lineHeight: "2" }}>
              <div>✦ <span style={{ color: "#E2E8F0" }}>{program.weeks}-week structured program</span></div>
              <div>✦ <span style={{ color: "#E2E8F0" }}>{program.days_per_week} training days per week</span></div>
              <div>✦ <span style={{ color: "#E2E8F0" }}>{program.intensity} intensity level</span></div>
              <div>✦ <span style={{ color: "#E2E8F0" }}>Science-based progressive overload</span></div>
              <div>✦ <span style={{ color: "#E2E8F0" }}>Full exercise library with sets and reps</span></div>
              <div>✦ <span style={{ color: "#E2E8F0" }}>Video demos for every exercise</span></div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => onStart(program)} style={{ flex: 1, padding: "14px", background: `linear-gradient(90deg, ${color}, #00D4FF)`, border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "900", fontSize: "11px", letterSpacing: "3px", fontFamily: "'Courier New', monospace" }}>START PROGRAM →</button>
          <button onClick={onClose} style={{ padding: "14px 20px", background: "transparent", border: "1px solid #1a2744", borderRadius: "8px", cursor: "pointer", color: "#4A5568", fontSize: "10px", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>BACK</button>
        </div>
      </div>
    </div>
  );
}

const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'Courier New', monospace";

function StatBadge({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: `${color}12`, border: `1px solid ${color}30`, borderRadius: "8px", padding: "6px 10px", minWidth: "44px" }}>
      <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "1px", fontFamily: MONO, marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", fontWeight: "700", color: color, fontFamily: SANS }}>{value}</div>
    </div>
  );
}

function AIGeneratorModal({ user, onClose, onStart }) {
  const { t } = useLang();
  const [generating, setGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState(null);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);

  const prefs = user.preferences || {};
  const goalMap = {
    "Fat Loss": "Fat Loss", "Muscle & Strength": "Hypertrophy",
    "Athletic Performance": "Athletic", "General Fitness": "General Fitness", "Glutes & Lower Body": "Glutes",
  };
  const category = goalMap[prefs.goal] || "General Fitness";
  const color = getCategoryColor(category);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const token = localStorage.getItem("hm_token");
      const payload = {
        goal: prefs.goal || "General Fitness",
        experience: prefs.experience || "Intermediate (1-3 years)",
        days: prefs.days || "4 days",
        gender: prefs.gender || "Both",
        limitation: prefs.limitation || "None",
        weeks: 8,
      };

      const res = await fetch(`${API}/api/v1/ai-programs/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`);

      const jobId = data.job_id;
      let attempts = 0;
      while (attempts < 40) {
        await new Promise(r => setTimeout(r, 3000));
        const poll = await fetch(`${API}/api/v1/ai-programs/status/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await poll.json();
        if (result.status === "complete") { setGeneratedProgram(result.program); return; }
        if (result.status === "failed") throw new Error(result.error || "Generation failed");
        attempts++;
      }
      throw new Error("Timed out waiting for program generation");
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = async () => {
    const synthetic = {
      id: `ai-${Date.now()}`,
      name: generatedProgram.program_name,
      category,
      days_per_week: generatedProgram.days.length,
      weeks: 8,
      intensity: "AI-Generated",
      description: generatedProgram.philosophy,
      aiProgram: generatedProgram,
    };
    try {
      const token = localStorage.getItem("hm_token");
      await fetch(`${API}/api/v1/user-programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          program_name: generatedProgram.program_name,
          category,
          days_per_week: generatedProgram.days.length,
          weeks: 8,
          program_data: generatedProgram,
        }),
      });
    } catch (e) { console.error("Failed to save program", e); }
    onStart(synthetic);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(145deg, #0A0F1E, #0D1525)", border: `1px solid ${color}40`, borderRadius: "20px", padding: "32px", maxWidth: "680px", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: color, fontFamily: MONO, marginBottom: "8px" }}>{t("ai_panel")}</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#E2E8F0", fontFamily: SANS, lineHeight: 1.2 }}>{t("ai_title")}</div>
          <div style={{ fontSize: "14px", color: "#718096", marginTop: "6px", fontFamily: SANS }}>{t("ai_sub")}</div>
        </div>

        {!generatedProgram && (
          <>
            {/* Profile summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: t("goal_label"), value: prefs.goal || "Not set" },
                { label: t("experience_label"), value: prefs.experience || "Not set" },
                { label: t("days_week_label"), value: prefs.days || "Not set" },
                { label: t("limitations_label"), value: prefs.limitation || "None" },
              ].map((m) => (
                <div key={m.label} style={{ background: "#050810", borderRadius: "10px", padding: "14px 16px", border: "1px solid #1a2744" }}>
                  <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO, marginBottom: "4px" }}>{m.label}</div>
                  <div style={{ fontSize: "14px", color: color, fontWeight: "600", fontFamily: SANS }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: "12px", padding: "16px 20px", marginBottom: "24px" }}>
              <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6", fontFamily: SANS }}>
                A customized program rooted in periodization, biomechanics, and proven training science — generated just for you.
              </div>
            </div>

            {error && <div style={{ color: "#FF4444", fontSize: "13px", marginBottom: "16px", fontFamily: SANS }}>⚠ {error}</div>}

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={generate} disabled={generating} style={{ flex: 1, padding: "16px", background: generating ? "#1a2744" : `linear-gradient(90deg, ${color}, #00D4FF)`, border: "none", borderRadius: "10px", cursor: generating ? "not-allowed" : "pointer", color: "#050810", fontWeight: "800", fontSize: "14px", fontFamily: SANS }}>
                {generating ? t("generating") : t("generate_btn")}
              </button>
              <button onClick={onClose} style={{ padding: "16px 20px", background: "transparent", border: "1px solid #1a2744", borderRadius: "10px", cursor: "pointer", color: "#4A5568", fontSize: "13px", fontFamily: SANS }}>{t("cancel")}</button>
            </div>
          </>
        )}

        {generatedProgram && (
          <>
            {/* Program header card */}
            <div style={{ background: `${color}10`, border: `1px solid ${color}35`, borderRadius: "14px", padding: "20px 24px", marginBottom: "20px" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: color, fontFamily: SANS, marginBottom: "6px" }}>{generatedProgram.program_name}</div>
              <div style={{ fontSize: "14px", color: "#94A3B8", lineHeight: "1.6", fontFamily: SANS, marginBottom: "12px" }}>{generatedProgram.philosophy}</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "9px", letterSpacing: "2px", color: "#4A5568", fontFamily: MONO, paddingTop: "2px", flexShrink: 0 }}>PROGRESSION</span>
                <span style={{ fontSize: "13px", color: "#CBD5E1", fontFamily: SANS, lineHeight: 1.5 }}>{generatedProgram.progression_scheme}</span>
              </div>
            </div>

            {/* Day tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
              {generatedProgram.days.map((day, i) => (
                <button key={i} onClick={() => setActiveDay(i)} style={{ flexShrink: 0, padding: "8px 18px", background: activeDay === i ? color : "transparent", border: `1px solid ${activeDay === i ? color : "#1a2744"}`, borderRadius: "20px", cursor: "pointer", color: activeDay === i ? "#050810" : "#718096", fontSize: "12px", fontWeight: activeDay === i ? "700" : "400", fontFamily: SANS, transition: "all 0.2s" }}>Day {day.day_number}</button>
              ))}
            </div>

            {/* Day content */}
            {generatedProgram.days[activeDay] && (
              <div>
                <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #1a2744" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS }}>{generatedProgram.days[activeDay].day_name}</div>
                  <div style={{ fontSize: "13px", color: "#718096", marginTop: "4px", fontFamily: SANS }}>{generatedProgram.days[activeDay].focus}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {generatedProgram.days[activeDay].exercises.map((ex, i) => (
                    <div key={i} style={{ background: "#050D1A", border: "1px solid #1a2744", borderRadius: "12px", padding: "16px", transition: "border-color 0.2s" }}>
                      {/* Exercise header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: ex.coaching_note ? "12px" : "0" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "10px", color: "#4A5568", fontFamily: MONO, letterSpacing: "1px", marginBottom: "4px" }}>{ex.body_part} · {ex.equipment}</div>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS, lineHeight: 1.3 }}>{ex.name}</div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <StatBadge label="SETS" value={ex.sets} color={color} />
                          <StatBadge label="REPS" value={ex.reps} color={color} />
                          <StatBadge label="REST" value={`${ex.rest_seconds}s`} color={color} />
                          {ex.rir != null && <StatBadge label="RIR" value={ex.rir} color={color} />}
                        </div>
                      </div>
                      {/* Coaching note */}
                      {ex.coaching_note && (
                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", borderTop: "1px solid #1a2744", paddingTop: "10px" }}>
                          <span style={{ color: color, fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>💡</span>
                          <span style={{ fontSize: "13px", color: "#718096", lineHeight: "1.5", fontFamily: SANS }}>{ex.coaching_note}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={handleStart} style={{ flex: 1, padding: "16px", background: `linear-gradient(90deg, ${color}, #00D4FF)`, border: "none", borderRadius: "10px", cursor: "pointer", color: "#050810", fontWeight: "800", fontSize: "15px", fontFamily: SANS }}>{t("start_this_program")}</button>
              <button onClick={() => { setGeneratedProgram(null); setError(""); }} style={{ padding: "16px 20px", background: "transparent", border: "1px solid #1a2744", borderRadius: "10px", cursor: "pointer", color: "#4A5568", fontSize: "13px", fontFamily: SANS }}>{t("regenerate")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const TIERS = ["starter", "builder", "athlete", "elite_matrix", "vip_matrix"];
const ROLES = ["user", "admin"];
const TIER_COLORS = { starter: "#718096", builder: "#00D4FF", athlete: "#A855F7", elite_matrix: "#00FF87", vip_matrix: "#FF6B35" };

function AdminDashboard({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const token = localStorage.getItem("hm_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchData = async (q = "") => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/api/v1/admin/stats`, { headers }),
        fetch(`${API}/api/v1/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`, { headers }),
      ]);
      const s = await statsRes.json();
      const u = await usersRes.json();
      setStats(s);
      setUsers(u.users || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const updateUser = async (userId, field, value) => {
    setSaving(p => ({ ...p, [userId]: true }));
    try {
      await fetch(`${API}/api/v1/admin/users/${userId}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ [field]: value }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (err) { console.error(err); }
    finally { setSaving(p => ({ ...p, [userId]: false })); }
  };

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, color: "#00FF87" },
    { label: "Workouts Logged", value: stats.total_workouts, color: "#00D4FF" },
    { label: "AI Programs Built", value: stats.total_ai_programs, color: "#A855F7" },
    { label: "New Today", value: stats.new_today, color: "#FF6B35" },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 100%)", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2744", padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#05081099", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #1a2744", padding: "8px 14px", cursor: "pointer", color: "#718096", fontSize: "13px", fontFamily: SANS, borderRadius: "8px" }}>← Back</button>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#00FF87", fontFamily: MONO }}>ADMIN</div>
            <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: SANS }}>Control Panel</div>
          </div>
        </div>
        <div style={{ fontSize: "13px", color: "#4A5568", fontFamily: SANS }}>{user.name} · {user.tier}</div>
      </div>

      <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "32px" }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: "linear-gradient(145deg, #0D1525, #111827)", border: `1px solid ${s.color}30`, borderRadius: "14px", padding: "20px 24px" }}>
              <div style={{ fontSize: "10px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO, marginBottom: "8px" }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: "32px", fontWeight: "700", color: s.color, fontFamily: SANS }}>{loading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* Tier breakdown */}
        {stats?.users_by_tier?.length > 0 && (
          <div style={{ background: "linear-gradient(145deg, #0D1525, #111827)", border: "1px solid #1a2744", borderRadius: "14px", padding: "20px 24px", marginBottom: "28px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#4A5568", fontFamily: MONO, marginBottom: "14px" }}>USERS BY TIER</div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {stats.users_by_tier.map(t => (
                <div key={t.tier} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: TIER_COLORS[t.tier] || "#718096" }} />
                  <span style={{ fontSize: "14px", color: "#E2E8F0", fontFamily: SANS }}>{t.tier}</span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: TIER_COLORS[t.tier] || "#718096", fontFamily: SANS }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User table */}
        <div style={{ background: "linear-gradient(145deg, #0D1525, #111827)", border: "1px solid #1a2744", borderRadius: "14px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#4A5568", fontFamily: MONO }}>ALL USERS</div>
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchData(search)}
              style={{ ...inputStyle, maxWidth: "280px", fontFamily: SANS, fontSize: "14px", letterSpacing: "0", padding: "10px 14px" }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#4A5568", fontFamily: SANS }}>Loading users...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {users.map(u => (
                <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "12px", alignItems: "center", background: "#050D1A", borderRadius: "10px", padding: "14px 16px", border: "1px solid #1a2744" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#E2E8F0", fontFamily: SANS }}>{u.full_name || "—"}</div>
                    <div style={{ fontSize: "12px", color: "#4A5568", fontFamily: SANS, marginTop: "2px" }}>{u.email}</div>
                  </div>
                  {/* Tier selector */}
                  <select
                    value={u.tier || "starter"}
                    onChange={e => updateUser(u.id, "tier", e.target.value)}
                    disabled={saving[u.id]}
                    style={{ background: "#0A0F1E", border: `1px solid ${TIER_COLORS[u.tier] || "#1a2744"}`, borderRadius: "8px", color: TIER_COLORS[u.tier] || "#718096", padding: "6px 10px", fontSize: "12px", fontFamily: SANS, cursor: "pointer" }}
                  >
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {/* Role selector */}
                  <select
                    value={u.role || "user"}
                    onChange={e => updateUser(u.id, "role", e.target.value)}
                    disabled={saving[u.id]}
                    style={{ background: "#0A0F1E", border: "1px solid #1a2744", borderRadius: "8px", color: u.role === "admin" ? "#00FF87" : "#718096", padding: "6px 10px", fontSize: "12px", fontFamily: SANS, cursor: "pointer" }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {/* Status dot */}
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: u.is_active !== false ? "#00FF87" : "#FF4444", flexShrink: 0 }} title={u.is_active !== false ? "Active" : "Inactive"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout, onUpdateUser, lang, onToggleLang }) {
  const { t } = useLang();
  const mobile = useIsMobile();
  const [programs, setPrograms] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeProgram, setActiveProgram] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(!user.onboarded);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // Current saved program
  const [currentUserProgram, setCurrentUserProgram] = useState(null);

  // Body stats
  const [bodyStats, setBodyStats] = useState(null);
  const [editingStats, setEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({});
  const [savingStats, setSavingStats] = useState(false);

  const filterKeys = ["filter_all","filter_fat_loss","filter_hypertrophy","filter_strength","filter_athletic","filter_general","filter_glutes"];
  const filterValues = ["All","Fat Loss","Hypertrophy","Strength","Athletic","General Fitness","Glutes"];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("hm_token");
      const authHeaders = { Authorization: `Bearer ${token}` };
      try {
        const [progRes, exRes, curProgRes, statsRes] = await Promise.all([
          fetch(`${API}/api/v1/programs`),
          fetch(`${API}/api/v1/exercises`),
          fetch(`${API}/api/v1/user-programs/current`, { headers: authHeaders }),
          fetch(`${API}/api/v1/body-stats`, { headers: authHeaders }),
        ]);
        const progData = await progRes.json();
        const exData = await exRes.json();
        setPrograms(progData.programs || []);
        setFilteredPrograms(progData.programs || []);
        setExercises(exData.exercises || []);
        if (curProgRes.ok) {
          const cp = await curProgRes.json();
          setCurrentUserProgram(cp.program || null);
        }
        if (statsRes.ok) {
          const sd = await statsRes.json();
          setBodyStats(sd);
          setStatsForm(sd);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveBodyStats = async () => {
    setSavingStats(true);
    try {
      const token = localStorage.getItem("hm_token");
      const res = await fetch(`${API}/api/v1/body-stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          weight_lbs: statsForm.weight_lbs ? parseFloat(statsForm.weight_lbs) : null,
          height_inches: statsForm.height_inches ? parseFloat(statsForm.height_inches) : null,
          body_fat_pct: statsForm.body_fat_pct ? parseFloat(statsForm.body_fat_pct) : null,
          age: statsForm.age ? parseInt(statsForm.age) : null,
          notes: statsForm.notes || null,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setBodyStats(saved);
        setStatsForm(saved);
        setEditingStats(false);
      }
    } catch (e) { console.error("Failed to save stats", e); }
    finally { setSavingStats(false); }
  };

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredPrograms(programs);
    } else {
      setFilteredPrograms(programs.filter(p =>
        p.category?.toLowerCase().includes(activeFilter.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()))
      ));
    }
  }, [activeFilter, programs]);

  const handleOnboardingComplete = (answers) => {
    const updatedUser = { ...user, onboarded: true, preferences: answers };
    localStorage.setItem("hm_user", JSON.stringify(updatedUser));
    onUpdateUser(updatedUser);
    setShowOnboarding(false);
    let filtered = [...programs];
    if (answers.gender === "Men's Programs") filtered = filtered.filter(p => p.gender !== "Women's");
    if (answers.gender === "Women's Programs") filtered = filtered.filter(p => p.gender !== "Men's");
    const goalMap = { "Fat Loss": "Fat Loss", "Muscle & Strength": "Hypertrophy", "Athletic Performance": "Athletic", "General Fitness": "General Fitness", "Glutes & Lower Body": "Glutes" };
    const mappedCategory = goalMap[answers.goal];
    if (mappedCategory) {
      const goalFiltered = filtered.filter(p => p.category === mappedCategory);
      if (goalFiltered.length > 0) filtered = goalFiltered;
    }
    setFilteredPrograms(filtered.length > 0 ? filtered : programs);
  };

  const handleStartProgram = (program) => {
    setSelectedProgram(null);
    setActiveProgram(program);
  };

  if (activeProgram) {
    return <WorkoutView program={activeProgram} onBack={() => setActiveProgram(null)} />;
  }

  if (showAdmin) {
    return <AdminDashboard user={user} onBack={() => setShowAdmin(false)} />;
  }

  const px = mobile ? "16px" : "40px";
  const statInputStyle = { background: "#050810", border: "1px solid #1a2744", borderRadius: "8px", color: "#E2E8F0", fontSize: "14px", padding: "10px 12px", fontFamily: SANS, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 100%)", color: "#E2E8F0" }}>
      {showOnboarding && <OnboardingModal userName={user.name} onComplete={handleOnboardingComplete} />}
      {selectedProgram && <ProgramDetailModal program={selectedProgram} onClose={() => setSelectedProgram(null)} onStart={handleStartProgram} />}
      {showAIGenerator && <AIGeneratorModal user={user} onClose={() => setShowAIGenerator(false)} onStart={(p) => { handleStartProgram(p); setCurrentUserProgram(null); }} />}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2744", padding: `16px ${px}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#05081099", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#00FF87", fontFamily: MONO }}>{t("brand")}</div>
          {!mobile && <div style={{ fontSize: "11px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO }}>{t("tagline")}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: mobile ? "8px" : "12px" }}>
          {!mobile && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#E2E8F0", fontFamily: SANS }}>{user.name.toUpperCase()}</div>
              <div style={{ fontSize: "9px", color: "#00FF87", background: "#00FF8715", padding: "2px 8px", borderRadius: "4px", border: "1px solid #00FF8730", display: "inline-block", marginTop: "2px", fontFamily: MONO }}>{user.tier?.toUpperCase() || "STARTER"}</div>
            </div>
          )}
          <button onClick={onToggleLang} style={{ background: "#1a274430", border: "1px solid #1a2744", padding: "7px 10px", cursor: "pointer", color: "#00FF87", fontSize: "11px", fontFamily: MONO, borderRadius: "6px", letterSpacing: "2px", fontWeight: "700" }}>{lang === "en" ? "ES" : "EN"}</button>
          {user.role === "admin" && (
            <button onClick={() => setShowAdmin(true)} style={{ background: "#00FF8712", border: "1px solid #00FF8740", padding: "8px 12px", cursor: "pointer", color: "#00FF87", fontSize: "12px", fontFamily: SANS, borderRadius: "6px", fontWeight: "600" }}>{t("admin")}</button>
          )}
          <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #1a2744", padding: "8px 12px", cursor: "pointer", color: "#4A5568", fontSize: "12px", fontFamily: SANS, borderRadius: "6px" }}>{t("logout")}</button>
        </div>
      </div>

      <div style={{ padding: `32px ${px} 40px`, maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "10px", fontFamily: MONO }}>{t("welcome_back")}</div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: "900", letterSpacing: "3px", margin: "0 0 8px", background: "linear-gradient(90deg, #E2E8F0, #718096)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: SANS }}>{user.name.toUpperCase()}</h1>
        <div style={{ fontSize: "12px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO }}>{t("matrix_ready")}</div>

        {/* Tier card + AI Generate */}
        <div style={{ marginTop: "28px", background: "linear-gradient(145deg, #0D1525, #111827)", border: "1px solid #1a2744", borderRadius: "12px", padding: mobile ? "20px" : "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4A5568", marginBottom: "6px", fontFamily: MONO }}>{t("current_tier")}</div>
            <div style={{ fontSize: "22px", fontWeight: "900", color: "#00FF87", fontFamily: SANS }}>{user.tier?.toUpperCase() || "STARTER"}</div>
            <div style={{ fontSize: "13px", color: "#718096", marginTop: "4px", fontFamily: SANS }}>{t("programs_matched", { n: filteredPrograms.length })}</div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => setShowOnboarding(true)} style={{ padding: "11px 18px", background: "transparent", border: "1px solid #00FF8730", borderRadius: "8px", cursor: "pointer", color: "#00FF87", fontSize: "12px", fontFamily: SANS }}>{t("retake_quiz")}</button>
            {currentUserProgram ? (
              <button
                onClick={() => setActiveProgram({
                  id: `saved-${currentUserProgram.id}`,
                  name: currentUserProgram.program_name,
                  category: currentUserProgram.category,
                  days_per_week: currentUserProgram.days_per_week,
                  weeks: currentUserProgram.weeks,
                  intensity: "AI-Generated",
                  description: currentUserProgram.program_data?.philosophy || "",
                  aiProgram: currentUserProgram.program_data,
                })}
                style={{ padding: "12px 22px", background: "#00FF8712", border: "1px solid #00FF8750", borderRadius: "8px", cursor: "pointer", color: "#00FF87", fontWeight: "700", fontSize: "13px", fontFamily: SANS }}
              >▶ Current Program</button>
            ) : (
              <button disabled style={{ padding: "12px 22px", background: "transparent", border: "1px solid #1a2744", borderRadius: "8px", cursor: "not-allowed", color: "#2a3a54", fontSize: "13px", fontFamily: SANS }}>▶ Current Program</button>
            )}
            <button onClick={() => setShowAIGenerator(true)} style={{ padding: "12px 24px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "800", fontSize: "14px", fontFamily: SANS }}>{t("ai_generate")}</button>
          </div>
        </div>

        {/* Current Program section */}
        {currentUserProgram && (
          <div style={{ marginTop: "24px", background: "linear-gradient(145deg, #0D1525, #111827)", border: "1px solid #00FF8730", borderRadius: "12px", padding: mobile ? "18px" : "22px 28px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#00FF87", fontFamily: MONO, marginBottom: "10px" }}>CURRENT PROGRAM</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#E2E8F0", fontFamily: SANS }}>{currentUserProgram.program_name}</div>
                <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px", fontFamily: SANS }}>{currentUserProgram.category} · {currentUserProgram.days_per_week} days/wk · {currentUserProgram.weeks} weeks</div>
              </div>
              <button
                onClick={() => {
                  const prog = {
                    id: `saved-${currentUserProgram.id}`,
                    name: currentUserProgram.program_name,
                    category: currentUserProgram.category,
                    days_per_week: currentUserProgram.days_per_week,
                    weeks: currentUserProgram.weeks,
                    intensity: "AI-Generated",
                    description: currentUserProgram.program_data?.philosophy || "",
                    aiProgram: currentUserProgram.program_data,
                  };
                  setActiveProgram(prog);
                }}
                style={{ padding: "11px 22px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "13px", fontFamily: SANS, whiteSpace: "nowrap" }}
              >Continue →</button>
            </div>
          </div>
        )}

        {/* Body Stats section */}
        <div style={{ marginTop: "24px", background: "linear-gradient(145deg, #0D1525, #111827)", border: "1px solid #1a2744", borderRadius: "12px", padding: mobile ? "18px" : "22px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#4A5568", fontFamily: MONO }}>BODY STATS</div>
            {!editingStats ? (
              <button onClick={() => { setEditingStats(true); setStatsForm(bodyStats || {}); }} style={{ background: "transparent", border: "1px solid #1a2744", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", color: "#718096", fontSize: "12px", fontFamily: SANS }}>Edit</button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={saveBodyStats} disabled={savingStats} style={{ background: "#00FF8715", border: "1px solid #00FF8740", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", color: "#00FF87", fontSize: "12px", fontFamily: SANS }}>{savingStats ? "Saving..." : "Save"}</button>
                <button onClick={() => setEditingStats(false)} style={{ background: "transparent", border: "1px solid #1a2744", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", color: "#4A5568", fontSize: "12px", fontFamily: SANS }}>Cancel</button>
              </div>
            )}
          </div>
          {editingStats ? (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px" }}>
              {[
                { key: "weight_lbs", label: "WEIGHT (lbs)", placeholder: "e.g. 185" },
                { key: "height_inches", label: "HEIGHT (in)", placeholder: "e.g. 70" },
                { key: "body_fat_pct", label: "BODY FAT %", placeholder: "e.g. 15" },
                { key: "age", label: "AGE", placeholder: "e.g. 28" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO, marginBottom: "6px" }}>{label}</div>
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={statsForm[key] || ""}
                    onChange={e => setStatsForm(f => ({ ...f, [key]: e.target.value }))}
                    style={statInputStyle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px" }}>
              {[
                { label: "WEIGHT", value: bodyStats?.weight_lbs ? `${bodyStats.weight_lbs} lbs` : "—", color: "#00FF87" },
                { label: "HEIGHT", value: bodyStats?.height_inches ? `${Math.floor(bodyStats.height_inches / 12)}'${Math.round(bodyStats.height_inches % 12)}"` : "—", color: "#00D4FF" },
                { label: "BODY FAT", value: bodyStats?.body_fat_pct ? `${bodyStats.body_fat_pct}%` : "—", color: "#A855F7" },
                { label: "AGE", value: bodyStats?.age || "—", color: "#FF6B35" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#050810", borderRadius: "10px", padding: "14px", border: "1px solid #1a2744", textAlign: "center" }}>
                  <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO, marginBottom: "6px" }}>{label}</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color, fontFamily: SANS }}>{value}</div>
                </div>
              ))}
            </div>
          )}
          {!bodyStats?.weight_lbs && !editingStats && (
            <div style={{ marginTop: "12px", fontSize: "13px", color: "#4A5568", fontFamily: SANS }}>No stats logged yet. Tap Edit to add your measurements.</div>
          )}
        </div>

        {/* Filters */}
        <div style={{ marginTop: "32px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {filterValues.map((f, i) => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "8px 14px", background: activeFilter === f ? "#00FF8715" : "transparent", border: `1px solid ${activeFilter === f ? "#00FF87" : "#1a2744"}`, borderRadius: "20px", cursor: "pointer", color: activeFilter === f ? "#00FF87" : "#4A5568", fontSize: "12px", fontFamily: SANS, transition: "all 0.2s" }}>{t(filterKeys[i])}</button>
          ))}
        </div>

        <div style={{ marginTop: "28px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#4A5568", marginBottom: "24px", fontFamily: MONO }}>
            {activeFilter === "All" ? t("all_programs") : t("programs_results", { category: activeFilter.toUpperCase(), n: filteredPrograms.length })}
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#4A5568", fontSize: "13px", fontFamily: SANS }}>{t("loading_programs")}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {filteredPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} onSelect={setSelectedProgram} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HybridMatrix() {
  const mobile = useIsMobile();
  const [lang, setLang] = useState(() => localStorage.getItem("hm_lang") || "en");
  const { t } = useTranslation(lang);

  const toggleLang = () => {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("hm_lang", next);
  };

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("hm_user");
      if (!u) return null;
      const parsed = JSON.parse(u);
      if (!parsed.name || parsed.name === parsed.email?.split("@")[0]) return null;
      return parsed;
    } catch { return null; }
  });
  const [authModal, setAuthModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAuthSuccess = (data) => {
    setUser({ id: data.user_id, name: data.resolvedName, tier: data.tier, role: data.account_type, onboarded: false });
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");
    setUser(null);
  };

  if (user) return (
    <LangContext.Provider value={lang}>
      <Dashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} lang={lang} onToggleLang={toggleLang} />
    </LangContext.Provider>
  );

  return (
    <LangContext.Provider value={lang}>
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 50%, #050810 100%)", fontFamily: "'Courier New', monospace", color: "#E2E8F0", overflowX: "hidden" }}>
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSuccess={handleAuthSuccess} />}

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: mobile ? "14px 16px" : "18px 40px", background: scrolled ? "rgba(5,8,16,0.95)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", borderBottom: scrolled ? "1px solid #1a274440" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s" }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "6px", color: "#00FF87", fontFamily: MONO }}>{t("brand")}</div>
          <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px", fontFamily: MONO }}>{t("tagline")}</div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={toggleLang} style={{ padding: "8px 12px", background: "#1a274430", border: "1px solid #1a2744", borderRadius: "6px", cursor: "pointer", color: "#00FF87", fontSize: "11px", fontFamily: MONO, letterSpacing: "2px", fontWeight: "700" }}>{lang === "en" ? "ES" : "EN"}</button>
          <button onClick={() => setAuthModal("login")} style={{ padding: "9px 20px", background: "transparent", border: "1px solid #1a2744", borderRadius: "6px", cursor: "pointer", color: "#718096", fontSize: "13px", fontFamily: SANS }}>{t("login")}</button>
          <button onClick={() => setAuthModal("register")} style={{ padding: "9px 20px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "6px", cursor: "pointer", color: "#050810", fontSize: "13px", fontWeight: "700", fontFamily: SANS }}>{t("start_free")}</button>
        </div>
      </nav>

      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: mobile ? "100px 16px 60px" : "120px 40px 80px" }}>
        <ParticleCanvas />
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "800px" }}>
          <div style={{ display: "inline-block", fontSize: "9px", letterSpacing: "5px", color: "#00FF87", border: "1px solid #00FF8730", padding: "6px 18px", borderRadius: "4px", marginBottom: "32px", background: "#00FF8708", fontFamily: MONO }}>{t("tagline_hero")}</div>
          <h1 style={{ fontSize: "clamp(42px, 8vw, 96px)", fontWeight: "900", letterSpacing: "6px", lineHeight: 1, margin: "0 0 24px", fontFamily: SANS }}>
            <span style={{ background: "linear-gradient(90deg, #00FF87, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("hero_title_1")}</span>
            <br />
            <span style={{ color: "#E2E8F0" }}>{t("hero_title_2")}</span>
          </h1>
          <p style={{ fontSize: "clamp(13px, 2vw, 16px)", color: "#718096", lineHeight: "1.8", maxWidth: "560px", margin: "0 auto 48px", fontFamily: SANS }}>{t("hero_sub")}</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setAuthModal("register")} style={{ padding: "16px 36px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "15px", fontFamily: SANS, boxShadow: "0 0 30px rgba(0,255,135,0.3)" }}>{t("start_for_free")}</button>
            <button onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "16px 36px", background: "transparent", border: "1px solid #1a2744", borderRadius: "8px", cursor: "pointer", color: "#718096", fontSize: "15px", fontFamily: SANS }}>{t("view_programs")}</button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a2744", borderBottom: "1px solid #1a2744", padding: "28px 40px", display: "flex", justifyContent: "center", gap: "clamp(30px, 6vw, 80px)", flexWrap: "wrap", background: "#05081080" }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900", color: "#00FF87", fontFamily: SANS }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px", marginTop: "4px", fontFamily: MONO }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div id="programs" style={{ padding: mobile ? "48px 16px" : "80px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "12px", fontFamily: MONO }}>{t("program_library")}</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "900", margin: "0 0 14px", color: "#E2E8F0", fontFamily: SANS }}>{t("browse_smarter")}</h2>
          <p style={{ fontSize: "14px", color: "#4A5568", fontFamily: SANS }}>{t("browse_sub")}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {[
            { id: 1, name: "HYBRID MATRIX 5-DAY", category: "Athletic", description: "The complete system. Strength, hypertrophy, and metabolic conditioning fused into the ultimate 5-day split.", intensity: "Very High", weeks: 12, days_per_week: 5, gender: "Both", tags: ["MET", "advanced"] },
            { id: 2, name: "FAT LOSS MET CIRCUIT", category: "Fat Loss", description: "Metabolic circuits engineered to torch fat while preserving lean muscle.", intensity: "High", weeks: 8, days_per_week: 4, gender: "Both", tags: ["circuits", "HIIT"] },
            { id: 3, name: "BEGINNER FOUNDATION", category: "General Fitness", description: "Build the foundation before you build the physique. Stability, movement quality, and neuromuscular efficiency first.", intensity: "Low", weeks: 4, days_per_week: 3, gender: "Both", tags: ["beginner", "corrective"] },
          ].map((p) => (
            <ProgramCard key={p.id} program={p} onSelect={() => setAuthModal("register")} />
          ))}
        </div>

        <div style={{ marginTop: "60px", textAlign: "center", padding: "60px 40px", background: "linear-gradient(145deg, #0D1525, #111827)", borderRadius: "16px", border: "1px solid #1a2744" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "16px", fontFamily: MONO }}>{t("get_started")}</div>
          <h3 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: "900", margin: "0 0 14px", color: "#E2E8F0", fontFamily: SANS }}>{t("your_results")}</h3>
          <p style={{ fontSize: "14px", color: "#718096", marginBottom: "32px", fontFamily: SANS }}>{t("your_results_sub")}</p>
          <button onClick={() => setAuthModal("register")} style={{ padding: "16px 40px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "700", fontSize: "15px", fontFamily: SANS, boxShadow: "0 0 30px rgba(0,255,135,0.2)" }}>{t("create_free")}</button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a2744", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#00FF87", fontFamily: MONO }}>{t("brand")}</div>
          <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", marginTop: "4px", fontFamily: MONO }}>{t("footer_sub")}</div>
        </div>
        <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", fontFamily: MONO }}>{t("footer_copy")}</div>
      </div>
    </div>
    </LangContext.Provider>
  );
}
