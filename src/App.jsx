import { useState, useEffect, useRef } from "react";

const API = "https://web-production-1d446.up.railway.app";

const STATS = [
  { value: "39", label: "PROGRAMS" },
  { value: "480+", label: "EXERCISES" },
  { value: "5", label: "TIERS" },
  { value: "EN/ES", label: "BILINGUAL" },
];

const ONBOARDING_QUESTIONS = [
  {
    id: "goal",
    question: "What is your primary goal?",
    options: ["Fat Loss", "Muscle & Strength", "Athletic Performance", "General Fitness", "Glutes & Lower Body"],
  },
  {
    id: "experience",
    question: "What is your training experience?",
    options: ["Beginner (0-1 year)", "Intermediate (1-3 years)", "Advanced (3+ years)"],
  },
  {
    id: "days",
    question: "How many days per week can you train?",
    options: ["3 days", "4 days", "5 days", "6 days"],
  },
  {
    id: "gender",
    question: "Which program library fits you best?",
    options: ["Men's Programs", "Women's Programs", "Both"],
  },
  {
    id: "limitation",
    question: "Any physical limitations or injuries?",
    options: ["None", "Lower back issues", "Knee issues", "Shoulder issues", "Other / Multiple"],
  },
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
      localStorage.setItem("hm_user", JSON.stringify({ id: data.user_id, name: displayName, tier: data.tier, email: form.email, onboarded: false }));
      onSuccess({ ...data, resolvedName: displayName });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(145deg, #0A0F1E, #0D1525)", border: "1px solid #1a2744", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "420px", fontFamily: "'Courier New', monospace" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#00FF87", marginBottom: "6px" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "11px", color: "#4A5568", letterSpacing: "3px" }}>CORE ENGINE v2.0</div>
        </div>
        <div style={{ display: "flex", marginBottom: "28px", border: "1px solid #1a2744", borderRadius: "8px", overflow: "hidden" }}>
          {["login", "register"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: "12px", background: tab === t ? "#00FF8715" : "transparent", border: "none", cursor: "pointer", color: tab === t ? "#00FF87" : "#4A5568", fontSize: "10px", letterSpacing: "3px", fontFamily: "'Courier New', monospace", borderBottom: tab === t ? "2px solid #00FF87" : "2px solid transparent" }}>{t.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {tab === "register" && <input name="full_name" placeholder="FULL NAME" value={form.full_name} onChange={handle} style={inputStyle} />}
          <input name="email" placeholder="EMAIL" type="email" value={form.email} onChange={handle} style={inputStyle} />
          <input name="password" placeholder="PASSWORD" type="password" value={form.password} onChange={handle} onKeyDown={(e) => e.key === "Enter" && submit()} style={inputStyle} />
        </div>
        {error && <div style={{ marginTop: "14px", color: "#FF4444", fontSize: "11px", letterSpacing: "1px" }}>⚠ {error}</div>}
        <button onClick={submit} disabled={loading} style={{ marginTop: "24px", width: "100%", padding: "14px", background: loading ? "#1a2744" : "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", color: "#050810", fontWeight: "900", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Courier New', monospace" }}>
          {loading ? "PROCESSING..." : tab === "register" ? "CREATE ACCOUNT" : "ENTER MATRIX"}
        </button>
        <button onClick={onClose} style={{ marginTop: "14px", width: "100%", padding: "10px", background: "transparent", border: "1px solid #1a2744", borderRadius: "8px", cursor: "pointer", color: "#4A5568", fontSize: "10px", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>CANCEL</button>
      </div>
    </div>
  );
}

function OnboardingModal({ userName, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;
  const select = (option) => {
    const newAnswers = { ...answers, [q.id]: option };
    setAnswers(newAnswers);
    if (isLast) { onComplete(newAnswers); } else { setStep(step + 1); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "linear-gradient(145deg, #0A0F1E, #0D1525)", border: "1px solid #1a2744", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "500px", fontFamily: "'Courier New', monospace" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#00FF87", marginBottom: "8px" }}>PERSONALIZING YOUR MATRIX</div>
          <div style={{ fontSize: "14px", color: "#E2E8F0", letterSpacing: "2px", fontWeight: "900" }}>WELCOME, {userName.toUpperCase()}</div>
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
          {ONBOARDING_QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= step ? "#00FF87" : "#1a2744", transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px", marginBottom: "12px" }}>QUESTION {step + 1} OF {ONBOARDING_QUESTIONS.length}</div>
        <div style={{ fontSize: "16px", fontWeight: "900", color: "#E2E8F0", letterSpacing: "1px", marginBottom: "24px", lineHeight: 1.4 }}>{q.question}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.options.map((option) => (
            <button key={option} onClick={() => select(option)} style={{ padding: "14px 20px", background: answers[q.id] === option ? "#00FF8715" : "#050810", border: `1px solid ${answers[q.id] === option ? "#00FF87" : "#1a2744"}`, borderRadius: "8px", cursor: "pointer", color: answers[q.id] === option ? "#00FF87" : "#718096", fontSize: "11px", letterSpacing: "2px", fontFamily: "'Courier New', monospace", textAlign: "left", transition: "all 0.2s" }}>{option}</button>
          ))}
        </div>
        <div style={{ marginTop: "24px", fontSize: "9px", color: "#4A5568", textAlign: "center", letterSpacing: "2px" }}>YOUR ANSWERS PERSONALIZE YOUR PROGRAM LIBRARY</div>
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

function WorkoutView({ program, exercises, onBack }) {
  const color = getCategoryColor(program.category);
  const [completedSets, setCompletedSets] = useState({});

  const setsRepsMap = {
    "Hypertrophy": { sets: 4, reps: "8-12", rest: "60-90 sec" },
    "Strength": { sets: 4, reps: "4-6", rest: "2-3 min" },
    "Fat Loss": { sets: 3, reps: "15-20", rest: "30-45 sec" },
    "Athletic": { sets: 3, reps: "6-10", rest: "90 sec" },
    "General Fitness": { sets: 3, reps: "10-15", rest: "60 sec" },
    "Glutes": { sets: 4, reps: "12-15", rest: "60 sec" },
  };

  const prescription = setsRepsMap[program.category] || { sets: 3, reps: "10-12", rest: "60 sec" };

  const programExercises = exercises.slice(0, Math.min(8, exercises.length));

  const toggleSet = (exIdx, setIdx) => {
    const key = `${exIdx}-${setIdx}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalSets = programExercises.length * prescription.sets;
  const doneSets = Object.values(completedSets).filter(Boolean).length;
  const progress = Math.round((doneSets / totalSets) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 100%)", fontFamily: "'Courier New', monospace", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a2744", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#05081099", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "3px", color: color, marginBottom: "4px" }}>{program.category?.toUpperCase()} — WEEK 1 DAY 1</div>
          <div style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "2px", color: "#E2E8F0" }}>{program.name}</div>
        </div>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid #1a2744", padding: "8px 16px", cursor: "pointer", color: "#4A5568", fontSize: "9px", letterSpacing: "2px", fontFamily: "'Courier New', monospace", borderRadius: "6px" }}>← BACK</button>
      </div>

      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>

        {/* Progress bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4A5568" }}>WORKOUT PROGRESS</div>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: color }}>{progress}% COMPLETE</div>
          </div>
          <div style={{ background: "#1a2744", borderRadius: "4px", height: "6px" }}>
            <div style={{ background: `linear-gradient(90deg, ${color}, #00D4FF)`, height: "100%", borderRadius: "4px", width: `${progress}%`, transition: "width 0.3s" }} />
          </div>
        </div>

        {/* Prescription */}
        <div style={{ background: "linear-gradient(145deg, #0D1525, #111827)", border: `1px solid ${color}30`, borderRadius: "12px", padding: "20px", marginBottom: "32px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {[{ label: "SETS", value: prescription.sets }, { label: "REPS", value: prescription.reps }, { label: "REST", value: prescription.rest }, { label: "EXERCISES", value: programExercises.length }].map((m) => (
            <div key={m.label}>
              <div style={{ fontSize: "8px", color: "#4A5568", letterSpacing: "2px" }}>{m.label}</div>
              <div style={{ fontSize: "18px", fontWeight: "900", color: color, marginTop: "2px" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Exercise list */}
        <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#4A5568", marginBottom: "16px" }}>EXERCISES — TAP SETS TO LOG COMPLETION</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {programExercises.map((ex, exIdx) => (
            <div key={ex.id} style={{ background: "linear-gradient(145deg, #080D1A, #0A0F1E)", border: "1px solid #1a2744", borderRadius: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "8px", color: "#4A5568", letterSpacing: "2px", marginBottom: "4px" }}>{ex.body_part} · {ex.equipment}</div>
                  <div style={{ fontSize: "14px", fontWeight: "900", letterSpacing: "1px", color: "#E2E8F0" }}>{ex.name}</div>
                </div>
                {ex.video_url && (
                  <video src={ex.video_url} controls preload="none" style={{ width: "120px", height: "80px", borderRadius: "6px", border: `1px solid ${color}40`, objectFit: "cover", background: "#050810" }} />
                )}
              </div>

              {/* Set tracking */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", marginRight: "4px" }}>{prescription.reps} REPS:</div>
                {Array.from({ length: prescription.sets }).map((_, setIdx) => {
                  const key = `${exIdx}-${setIdx}`;
                  const done = completedSets[key];
                  return (
                    <button key={setIdx} onClick={() => toggleSet(exIdx, setIdx)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${done ? color : "#1a2744"}`, background: done ? `${color}20` : "#050810", cursor: "pointer", color: done ? color : "#4A5568", fontSize: "11px", fontWeight: "900", fontFamily: "'Courier New', monospace", transition: "all 0.2s" }}>
                      {done ? "✓" : setIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {progress === 100 && (
          <div style={{ marginTop: "32px", textAlign: "center", padding: "40px", background: "linear-gradient(145deg, #0D1525, #111827)", border: `1px solid ${color}40`, borderRadius: "16px" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🏆</div>
            <div style={{ fontSize: "14px", fontWeight: "900", color: color, letterSpacing: "3px", marginBottom: "8px" }}>WORKOUT COMPLETE!</div>
            <div style={{ fontSize: "11px", color: "#718096", letterSpacing: "1px" }}>Day 1 of {program.weeks * program.days_per_week} total sessions done.</div>
            <button onClick={onBack} style={{ marginTop: "24px", padding: "14px 32px", background: `linear-gradient(90deg, ${color}, #00D4FF)`, border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "900", fontSize: "11px", letterSpacing: "3px", fontFamily: "'Courier New', monospace" }}>BACK TO PROGRAMS</button>
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

function Dashboard({ user, onLogout, onUpdateUser }) {
  const [programs, setPrograms] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeProgram, setActiveProgram] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(!user.onboarded);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Fat Loss", "Hypertrophy", "Strength", "Athletic", "General Fitness", "Glutes"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, exRes] = await Promise.all([
          fetch(`${API}/api/v1/programs`),
          fetch(`${API}/api/v1/exercises`),
        ]);
        const progData = await progRes.json();
        const exData = await exRes.json();
        setPrograms(progData.programs || []);
        setFilteredPrograms(progData.programs || []);
        setExercises(exData.exercises || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    return <WorkoutView program={activeProgram} exercises={exercises} onBack={() => setActiveProgram(null)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 100%)", fontFamily: "'Courier New', monospace", color: "#E2E8F0" }}>
      {showOnboarding && <OnboardingModal userName={user.name} onComplete={handleOnboardingComplete} />}
      {selectedProgram && <ProgramDetailModal program={selectedProgram} onClose={() => setSelectedProgram(null)} onStart={handleStartProgram} />}

      <div style={{ borderBottom: "1px solid #1a2744", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#05081099", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#00FF87" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "11px", color: "#4A5568", letterSpacing: "2px" }}>CORE ENGINE v2.0</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#E2E8F0", letterSpacing: "1px" }}>{user.name.toUpperCase()}</div>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#00FF87", background: "#00FF8715", padding: "2px 8px", borderRadius: "4px", border: "1px solid #00FF8730", display: "inline-block", marginTop: "2px" }}>{user.tier?.toUpperCase() || "STARTER"}</div>
          </div>
          <button onClick={onLogout} style={{ background: "transparent", border: "1px solid #1a2744", padding: "8px 16px", cursor: "pointer", color: "#4A5568", fontSize: "9px", letterSpacing: "2px", fontFamily: "'Courier New', monospace", borderRadius: "6px" }}>LOGOUT</button>
        </div>
      </div>

      <div style={{ padding: "60px 40px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "10px" }}>WELCOME BACK</div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "900", letterSpacing: "3px", margin: "0 0 8px", background: "linear-gradient(90deg, #E2E8F0, #718096)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user.name.toUpperCase()}</h1>
        <div style={{ fontSize: "12px", color: "#4A5568", letterSpacing: "2px" }}>YOUR TRAINING MATRIX IS READY</div>

        <div style={{ marginTop: "40px", background: "linear-gradient(145deg, #0D1525, #111827)", border: "1px solid #1a2744", borderRadius: "12px", padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4A5568", marginBottom: "6px" }}>CURRENT TIER</div>
            <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "3px", color: "#00FF87" }}>{user.tier?.toUpperCase() || "STARTER"}</div>
            <div style={{ fontSize: "10px", color: "#718096", marginTop: "4px" }}>{filteredPrograms.length} programs matched to your goals</div>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => setShowOnboarding(true)} style={{ padding: "12px 20px", background: "transparent", border: "1px solid #00FF8730", borderRadius: "8px", cursor: "pointer", color: "#00FF87", fontSize: "10px", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>RETAKE QUIZ →</button>
            <button style={{ padding: "14px 28px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "900", fontSize: "11px", letterSpacing: "3px", fontFamily: "'Courier New', monospace" }}>UPGRADE TIER →</button>
          </div>
        </div>

        <div style={{ marginTop: "40px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "8px 16px", background: activeFilter === f ? "#00FF8715" : "transparent", border: `1px solid ${activeFilter === f ? "#00FF87" : "#1a2744"}`, borderRadius: "20px", cursor: "pointer", color: activeFilter === f ? "#00FF87" : "#4A5568", fontSize: "9px", letterSpacing: "2px", fontFamily: "'Courier New', monospace", transition: "all 0.2s" }}>{f.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ marginTop: "30px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#4A5568", marginBottom: "24px" }}>
            {activeFilter === "All" ? "ALL PROGRAMS" : `${activeFilter.toUpperCase()} PROGRAMS`} — {filteredPrograms.length} RESULTS
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#4A5568", letterSpacing: "3px", fontSize: "11px" }}>LOADING PROGRAMS...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
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
    setUser({ id: data.user_id, name: data.resolvedName, tier: data.tier, onboarded: false });
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");
    setUser(null);
  };

  if (user) return <Dashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} />;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #050810 0%, #080D1A 50%, #050810 100%)", fontFamily: "'Courier New', monospace", color: "#E2E8F0", overflowX: "hidden" }}>
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSuccess={handleAuthSuccess} />}

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: "18px 40px", background: scrolled ? "rgba(5,8,16,0.95)" : "transparent", backdropFilter: scrolled ? "blur(10px)" : "none", borderBottom: scrolled ? "1px solid #1a274440" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s" }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "6px", color: "#00FF87" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px" }}>CORE ENGINE v2.0</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setAuthModal("login")} style={{ padding: "9px 20px", background: "transparent", border: "1px solid #1a2744", borderRadius: "6px", cursor: "pointer", color: "#718096", fontSize: "9px", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>LOGIN</button>
          <button onClick={() => setAuthModal("register")} style={{ padding: "9px 20px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "6px", cursor: "pointer", color: "#050810", fontSize: "9px", fontWeight: "900", letterSpacing: "2px", fontFamily: "'Courier New', monospace" }}>START FREE</button>
        </div>
      </nav>

      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "120px 40px 80px" }}>
        <ParticleCanvas />
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "800px" }}>
          <div style={{ display: "inline-block", fontSize: "9px", letterSpacing: "6px", color: "#00FF87", border: "1px solid #00FF8730", padding: "6px 18px", borderRadius: "4px", marginBottom: "32px", background: "#00FF8708" }}>SCIENCE-BASED · AI POWERED · BILINGUAL EN/ES</div>
          <h1 style={{ fontSize: "clamp(42px, 8vw, 96px)", fontWeight: "900", letterSpacing: "6px", lineHeight: 1, margin: "0 0 24px" }}>
            <span style={{ background: "linear-gradient(90deg, #00FF87, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HYBRID</span>
            <br />
            <span style={{ color: "#E2E8F0" }}>MATRIX</span>
          </h1>
          <p style={{ fontSize: "clamp(13px, 2vw, 16px)", color: "#718096", lineHeight: "1.8", maxWidth: "560px", margin: "0 auto 48px", letterSpacing: "1px" }}>Your body adapts to everything. Your program should too. AI-driven training built from real science.</p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setAuthModal("register")} style={{ padding: "16px 36px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "900", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Courier New', monospace", boxShadow: "0 0 30px rgba(0,255,135,0.3)" }}>START FOR FREE →</button>
            <button onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "16px 36px", background: "transparent", border: "1px solid #1a2744", borderRadius: "8px", cursor: "pointer", color: "#718096", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Courier New', monospace" }}>VIEW PROGRAMS</button>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a2744", borderBottom: "1px solid #1a2744", padding: "28px 40px", display: "flex", justifyContent: "center", gap: "clamp(30px, 6vw, 80px)", flexWrap: "wrap", background: "#05081080" }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: "900", color: "#00FF87", letterSpacing: "2px" }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div id="programs" style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "12px" }}>PROGRAM LIBRARY</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "900", letterSpacing: "3px", margin: "0 0 14px", color: "#E2E8F0" }}>BROWSE FREE. TRAIN SMARTER.</h2>
          <p style={{ fontSize: "12px", color: "#4A5568", letterSpacing: "1px" }}>Sign up free. Answer 5 questions. We match you to the right program instantly.</p>
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
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "16px" }}>GET STARTED TODAY</div>
          <h3 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: "900", letterSpacing: "2px", margin: "0 0 14px", color: "#E2E8F0" }}>YOUR PROGRAM. YOUR RESULTS.</h3>
          <p style={{ fontSize: "12px", color: "#718096", marginBottom: "32px", letterSpacing: "1px" }}>Answer 5 questions. We match you to the right program instantly.</p>
          <button onClick={() => setAuthModal("register")} style={{ padding: "16px 40px", background: "linear-gradient(90deg, #00FF87, #00D4FF)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#050810", fontWeight: "900", fontSize: "12px", letterSpacing: "3px", fontFamily: "'Courier New', monospace", boxShadow: "0 0 30px rgba(0,255,135,0.2)" }}>CREATE FREE ACCOUNT →</button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1a2744", padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#00FF87" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", marginTop: "4px" }}>SCIENCE-BASED · AI POWERED · EN/ES</div>
        </div>
        <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px" }}>© 2026 HYBRID MATRIX. ALL RIGHTS RESERVED.</div>
      </div>
    </div>
  );
}
