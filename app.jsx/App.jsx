import { useState, useEffect, useRef } from "react";

const API = "https://web-production-1d446.up.railway.app";

const SAMPLE_PROGRAMS = [
  {
    id: 1,
    name: "HYBRID MATRIX 5-DAY",
    category: "Advanced",
    duration: "12 weeks",
    days: 5,
    goal: "Muscle & Strength",
    tag: "FLAGSHIP",
    tagColor: "#00FF87",
    description: "The complete system. Strength, hypertrophy, and metabolic conditioning fused into the ultimate 5-day split.",
    exercises: 24,
  },
  {
    id: 2,
    name: "FAT LOSS MET CIRCUIT",
    category: "Intermediate",
    duration: "8 weeks",
    days: 4,
    goal: "Fat Loss",
    tag: "POPULAR",
    tagColor: "#00D4FF",
    description: "Metabolic circuits engineered to torch fat while preserving lean muscle. Every set has a purpose.",
    exercises: 18,
  },
  {
    id: 3,
    name: "HIT ECCENTRIC 30-10-30",
    category: "Advanced",
    duration: "6 weeks",
    days: 3,
    goal: "Hypertrophy",
    tag: "INTENSE",
    tagColor: "#FF6B35",
    description: "One set. True failure. Maximum overload, minimum time. This is high intensity training distilled to its purest form.",
    exercises: 12,
  },
  {
    id: 4,
    name: "BEGINNER FOUNDATION",
    category: "Beginner",
    duration: "4 weeks",
    days: 3,
    goal: "Strength Base",
    tag: "START HERE",
    tagColor: "#A855F7",
    description: "Build the foundation before you build the physique. Stability, movement quality, and neuromuscular efficiency first.",
    exercises: 15,
  },
  {
    id: 5,
    name: "STRENGTH HYPERTROPHY",
    category: "Intermediate",
    duration: "10 weeks",
    days: 4,
    goal: "Size & Strength",
    tag: "PROVEN",
    tagColor: "#00FF87",
    description: "Upper/lower split combining heavy compound lifts with hypertrophy accessory work.",
    exercises: 20,
  },
  {
    id: 6,
    name: "CORRECTIVE STABILIZATION",
    category: "Beginner",
    duration: "4 weeks",
    days: 3,
    goal: "Movement Quality",
    tag: "CORRECTIVE",
    tagColor: "#00D4FF",
    description: "Fix how you move before you train hard. Corrective protocols that address dysfunction and build pain-free performance.",
    exercises: 10,
  },
];

const STATS = [
  { value: "39", label: "PROGRAMS" },
  { value: "480+", label: "EXERCISES" },
  { value: "5", label: "TIERS" },
  { value: "EN/ES", label: "BILINGUAL" },
];

// ─── PARTICLE BACKGROUND ───────────────────────────────────────────
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
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}

// ─── AUTH MODAL ────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onSuccess }) {
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "register"
        ? `${API}/api/v1/auth/register`
        : `${API}/api/v1/auth/login`;
      const body = tab === "register"
        ? { email: form.email, password: form.password, full_name: form.full_name }
        : { email: form.email, password: form.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");
      localStorage.setItem("hm_token", data.access_token);
      localStorage.setItem("hm_user", JSON.stringify({
        id: data.user_id,
        name: form.full_name || form.email.split("@")[0],
        tier: data.tier,
        email: form.email,
      }));
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "linear-gradient(145deg, #0A0F1E, #0D1525)",
        border: "1px solid #1a2744",
        borderRadius: "16px", padding: "40px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 0 60px rgba(0,255,135,0.08)",
        fontFamily: "'Courier New', monospace",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "6px", color: "#00FF87", marginBottom: "6px" }}>
            HYBRID MATRIX
          </div>
          <div style={{ fontSize: "11px", color: "#4A5568", letterSpacing: "3px" }}>
            CORE ENGINE v2.0
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "28px", border: "1px solid #1a2744", borderRadius: "8px", overflow: "hidden" }}>
          {["login", "register"].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
              flex: 1, padding: "12px",
              background: tab === t ? "#00FF8715" : "transparent",
              border: "none", cursor: "pointer",
              color: tab === t ? "#00FF87" : "#4A5568",
              fontSize: "10px", letterSpacing: "3px",
              fontFamily: "'Courier New', monospace",
              borderBottom: tab === t ? "2px solid #00FF87" : "2px solid transparent",
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {tab === "register" && (
            <input
              name="full_name" placeholder="FULL NAME"
              value={form.full_name} onChange={handle}
              style={inputStyle}
            />
          )}
          <input
            name="email" placeholder="EMAIL" type="email"
            value={form.email} onChange={handle}
            style={inputStyle}
          />
          <input
            name="password" placeholder="PASSWORD" type="password"
            value={form.password} onChange={handle}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ marginTop: "14px", color: "#FF4444", fontSize: "11px", letterSpacing: "1px" }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{
          marginTop: "24px", width: "100%", padding: "14px",
          background: loading ? "#1a2744" : "linear-gradient(90deg, #00FF87, #00D4FF)",
          border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer",
          color: "#050810", fontWeight: "900", fontSize: "12px",
          letterSpacing: "3px", fontFamily: "'Courier New', monospace",
          transition: "opacity 0.2s",
        }}>
          {loading ? "PROCESSING..." : tab === "register" ? "CREATE ACCOUNT" : "ENTER MATRIX"}
        </button>

        <button onClick={onClose} style={{
          marginTop: "14px", width: "100%", padding: "10px",
          background: "transparent", border: "1px solid #1a2744",
          borderRadius: "8px", cursor: "pointer",
          color: "#4A5568", fontSize: "10px", letterSpacing: "2px",
          fontFamily: "'Courier New', monospace",
        }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "13px 16px",
  background: "#050810",
  border: "1px solid #1a2744",
  borderRadius: "8px",
  color: "#E2E8F0",
  fontSize: "11px",
  letterSpacing: "2px",
  fontFamily: "'Courier New', monospace",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// ─── PROGRAM CARD ──────────────────────────────────────────────────
function ProgramCard({ program, onSelect, isLocked }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(program)}
      style={{
        background: hovered
          ? "linear-gradient(145deg, #0D1525, #111827)"
          : "linear-gradient(145deg, #080D1A, #0A0F1E)",
        border: `1px solid ${hovered ? program.tagColor + "40" : "#1a2744"}`,
        borderRadius: "12px",
        padding: "24px",
        cursor: "pointer",
        transition: "all 0.25s",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered ? `0 0 30px ${program.tagColor}15` : "none",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Glow line top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: hovered ? `linear-gradient(90deg, transparent, ${program.tagColor}, transparent)` : "transparent",
        transition: "all 0.3s",
      }} />

      {/* Tag */}
      <div style={{
        display: "inline-block",
        padding: "3px 10px",
        border: `1px solid ${program.tagColor}50`,
        borderRadius: "4px",
        fontSize: "8px", letterSpacing: "3px",
        color: program.tagColor,
        marginBottom: "14px",
        background: `${program.tagColor}10`,
      }}>
        {program.tag}
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          fontSize: "16px", opacity: 0.4,
        }}>🔒</div>
      )}

      <div style={{
        fontSize: "15px", fontWeight: "900",
        letterSpacing: "2px", color: "#E2E8F0",
        marginBottom: "10px", lineHeight: 1.3,
      }}>
        {program.name}
      </div>

      <div style={{
        fontSize: "10px", color: "#718096",
        lineHeight: "1.7", marginBottom: "18px",
      }}>
        {program.description}
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {[
          { label: "LEVEL", value: program.category },
          { label: "DURATION", value: program.duration },
          { label: "DAYS/WK", value: program.days },
          { label: "GOAL", value: program.goal },
        ].map((m) => (
          <div key={m.label}>
            <div style={{ fontSize: "8px", color: "#4A5568", letterSpacing: "2px" }}>{m.label}</div>
            <div style={{ fontSize: "10px", color: program.tagColor, fontWeight: "700", letterSpacing: "1px" }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050810 0%, #080D1A 100%)",
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0",
    }}>
      {/* Nav */}
      <div style={{
        borderBottom: "1px solid #1a2744",
        padding: "20px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#05081099",
        backdropFilter: "blur(10px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#00FF87" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "11px", color: "#4A5568", letterSpacing: "2px" }}>CORE ENGINE v2.0</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#E2E8F0", letterSpacing: "1px" }}>{user.name.toUpperCase()}</div>
            <div style={{
              fontSize: "9px", letterSpacing: "2px",
              color: "#00FF87",
              background: "#00FF8715",
              padding: "2px 8px", borderRadius: "4px",
              border: "1px solid #00FF8730",
              display: "inline-block", marginTop: "2px",
            }}>
              {user.tier?.toUpperCase() || "STARTER"}
            </div>
          </div>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid #1a2744",
            padding: "8px 16px", cursor: "pointer",
            color: "#4A5568", fontSize: "9px", letterSpacing: "2px",
            fontFamily: "'Courier New', monospace", borderRadius: "6px",
          }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div style={{ padding: "60px 40px 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "10px" }}>
          WELCOME BACK
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 4vw, 48px)",
          fontWeight: "900", letterSpacing: "3px",
          margin: "0 0 8px",
          background: "linear-gradient(90deg, #E2E8F0, #718096)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          {user.name.toUpperCase()}
        </h1>
        <div style={{ fontSize: "12px", color: "#4A5568", letterSpacing: "2px" }}>
          YOUR TRAINING MATRIX IS READY
        </div>

        {/* Tier card */}
        <div style={{
          marginTop: "40px",
          background: "linear-gradient(145deg, #0D1525, #111827)",
          border: "1px solid #1a2744",
          borderRadius: "12px", padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "20px",
        }}>
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "3px", color: "#4A5568", marginBottom: "6px" }}>
              CURRENT TIER
            </div>
            <div style={{
              fontSize: "22px", fontWeight: "900", letterSpacing: "3px",
              color: "#00FF87",
            }}>
              {user.tier?.toUpperCase() || "STARTER"}
            </div>
            <div style={{ fontSize: "10px", color: "#718096", marginTop: "4px" }}>
              Free access — upgrade to unlock all programs
            </div>
          </div>
          <button style={{
            padding: "14px 28px",
            background: "linear-gradient(90deg, #00FF87, #00D4FF)",
            border: "none", borderRadius: "8px", cursor: "pointer",
            color: "#050810", fontWeight: "900",
            fontSize: "11px", letterSpacing: "3px",
            fontFamily: "'Courier New', monospace",
          }}>
            UPGRADE TIER →
          </button>
        </div>

        {/* Programs grid */}
        <div style={{ marginTop: "50px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#4A5568", marginBottom: "24px" }}>
            YOUR PROGRAMS
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {SAMPLE_PROGRAMS.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                isLocked={p.id > 2}
                onSelect={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────
export default function HybridMatrix() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("hm_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAuthSuccess = (data) => {
    const stored = localStorage.getItem("hm_user");
    setUser(stored ? JSON.parse(stored) : { name: "Athlete", tier: data.tier });
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("hm_token");
    localStorage.removeItem("hm_user");
    setUser(null);
  };

  if (user) return <Dashboard user={user} onLogout={handleLogout} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #050810 0%, #080D1A 50%, #050810 100%)",
      fontFamily: "'Courier New', monospace",
      color: "#E2E8F0",
      overflowX: "hidden",
    }}>
      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }} onClick={() => setSelectedProgram(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "linear-gradient(145deg, #0A0F1E, #0D1525)",
            border: `1px solid ${selectedProgram.tagColor}40`,
            borderRadius: "16px", padding: "40px",
            maxWidth: "500px", width: "100%",
            fontFamily: "'Courier New', monospace",
            boxShadow: `0 0 60px ${selectedProgram.tagColor}15`,
          }}>
            <div style={{
              fontSize: "8px", letterSpacing: "4px",
              color: selectedProgram.tagColor, marginBottom: "16px",
            }}>
              {selectedProgram.tag}
            </div>
            <h2 style={{
              fontSize: "22px", fontWeight: "900",
              letterSpacing: "2px", margin: "0 0 16px",
              color: "#E2E8F0",
            }}>
              {selectedProgram.name}
            </h2>
            <p style={{ fontSize: "12px", color: "#718096", lineHeight: "1.8", marginBottom: "28px" }}>
              {selectedProgram.description}
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "12px", marginBottom: "32px",
            }}>
              {[
                { label: "LEVEL", value: selectedProgram.category },
                { label: "DURATION", value: selectedProgram.duration },
                { label: "DAYS/WEEK", value: selectedProgram.days },
                { label: "EXERCISES", value: selectedProgram.exercises },
              ].map((m) => (
                <div key={m.label} style={{
                  background: "#050810", borderRadius: "8px",
                  padding: "14px", border: "1px solid #1a2744",
                }}>
                  <div style={{ fontSize: "8px", color: "#4A5568", letterSpacing: "2px" }}>{m.label}</div>
                  <div style={{ fontSize: "16px", fontWeight: "900", color: selectedProgram.tagColor, marginTop: "4px" }}>{m.value}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedProgram(null); setAuthModal("register"); }} style={{
              width: "100%", padding: "14px",
              background: `linear-gradient(90deg, ${selectedProgram.tagColor}, #00D4FF)`,
              border: "none", borderRadius: "8px", cursor: "pointer",
              color: "#050810", fontWeight: "900",
              fontSize: "11px", letterSpacing: "3px",
              fontFamily: "'Courier New', monospace",
            }}>
              START THIS PROGRAM →
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        padding: "18px 40px",
        background: scrolled ? "rgba(5,8,16,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid #1a274440" : "none",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        transition: "all 0.3s",
      }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "6px", color: "#00FF87" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px" }}>CORE ENGINE v2.0</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setAuthModal("login")} style={{
            padding: "9px 20px",
            background: "transparent",
            border: "1px solid #1a2744",
            borderRadius: "6px", cursor: "pointer",
            color: "#718096", fontSize: "9px", letterSpacing: "2px",
            fontFamily: "'Courier New', monospace",
            transition: "all 0.2s",
          }}>
            LOGIN
          </button>
          <button onClick={() => setAuthModal("register")} style={{
            padding: "9px 20px",
            background: "linear-gradient(90deg, #00FF87, #00D4FF)",
            border: "none",
            borderRadius: "6px", cursor: "pointer",
            color: "#050810", fontSize: "9px",
            fontWeight: "900", letterSpacing: "2px",
            fontFamily: "'Courier New', monospace",
          }}>
            START FREE
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        position: "relative", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        padding: "120px 40px 80px",
      }}>
        <ParticleCanvas />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "800px" }}>
          <div style={{
            display: "inline-block",
            fontSize: "9px", letterSpacing: "6px", color: "#00FF87",
            border: "1px solid #00FF8730", padding: "6px 18px",
            borderRadius: "4px", marginBottom: "32px",
            background: "#00FF8708",
          }}>
            SCIENCE-BASED · AI POWERED · BILINGUAL EN/ES
          </div>

          <h1 style={{
            fontSize: "clamp(42px, 8vw, 96px)",
            fontWeight: "900", letterSpacing: "6px",
            lineHeight: 1, margin: "0 0 24px",
          }}>
            <span style={{
              background: "linear-gradient(90deg, #00FF87, #00D4FF)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>HYBRID</span>
            <br />
            <span style={{ color: "#E2E8F0" }}>MATRIX</span>
          </h1>

          <p style={{
            fontSize: "clamp(13px, 2vw, 16px)",
            color: "#718096", lineHeight: "1.8",
            maxWidth: "560px", margin: "0 auto 48px",
            letterSpacing: "1px",
          }}>
            Your body adapts to everything. Your program should too.
            AI-driven training built from real science — because your life
            is dynamic, and your training should be too.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setAuthModal("register")} style={{
              padding: "16px 36px",
              background: "linear-gradient(90deg, #00FF87, #00D4FF)",
              border: "none", borderRadius: "8px", cursor: "pointer",
              color: "#050810", fontWeight: "900",
              fontSize: "12px", letterSpacing: "3px",
              fontFamily: "'Courier New', monospace",
              boxShadow: "0 0 30px rgba(0,255,135,0.3)",
            }}>
              START FOR FREE →
            </button>
            <button
              onClick={() => document.getElementById("programs").scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "16px 36px",
                background: "transparent",
                border: "1px solid #1a2744", borderRadius: "8px", cursor: "pointer",
                color: "#718096", fontSize: "12px", letterSpacing: "3px",
                fontFamily: "'Courier New', monospace",
              }}>
              VIEW PROGRAMS
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{
        borderTop: "1px solid #1a2744", borderBottom: "1px solid #1a2744",
        padding: "28px 40px",
        display: "flex", justifyContent: "center", gap: "clamp(30px, 6vw, 80px)",
        flexWrap: "wrap",
        background: "#05081080",
      }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: "900", color: "#00FF87", letterSpacing: "2px",
            }}>{s.value}</div>
            <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "3px", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* PROGRAMS SECTION */}
      <div id="programs" style={{ padding: "80px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "12px" }}>
            PROGRAM LIBRARY
          </div>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 40px)",
            fontWeight: "900", letterSpacing: "3px",
            margin: "0 0 14px", color: "#E2E8F0",
          }}>
            BROWSE FREE. TRAIN SMARTER.
          </h2>
          <p style={{ fontSize: "12px", color: "#4A5568", letterSpacing: "1px" }}>
            Sign up free to start. Upgrade anytime to unlock the full library.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {SAMPLE_PROGRAMS.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              isLocked={false}
              onSelect={setSelectedProgram}
            />
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: "60px", textAlign: "center",
          padding: "60px 40px",
          background: "linear-gradient(145deg, #0D1525, #111827)",
          borderRadius: "16px",
          border: "1px solid #1a2744",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "200px", height: "1px",
            background: "linear-gradient(90deg, transparent, #00FF87, transparent)",
          }} />
          <div style={{ fontSize: "9px", letterSpacing: "5px", color: "#00FF87", marginBottom: "16px" }}>
            GET STARTED TODAY
          </div>
          <h3 style={{
            fontSize: "clamp(20px, 3vw, 32px)",
            fontWeight: "900", letterSpacing: "2px",
            margin: "0 0 14px", color: "#E2E8F0",
          }}>
            YOUR PROGRAM. YOUR RESULTS.
          </h3>
          <p style={{ fontSize: "12px", color: "#718096", marginBottom: "32px", letterSpacing: "1px" }}>
            Free starter tier includes 2 programs. No credit card required.
          </p>
          <button onClick={() => setAuthModal("register")} style={{
            padding: "16px 40px",
            background: "linear-gradient(90deg, #00FF87, #00D4FF)",
            border: "none", borderRadius: "8px", cursor: "pointer",
            color: "#050810", fontWeight: "900",
            fontSize: "12px", letterSpacing: "3px",
            fontFamily: "'Courier New', monospace",
            boxShadow: "0 0 30px rgba(0,255,135,0.2)",
          }}>
            CREATE FREE ACCOUNT →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        borderTop: "1px solid #1a2744",
        padding: "32px 40px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "16px",
      }}>
        <div>
          <div style={{ fontSize: "8px", letterSpacing: "5px", color: "#00FF87" }}>HYBRID MATRIX</div>
          <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px", marginTop: "4px" }}>
            SCIENCE-BASED · AI POWERED · EN/ES
          </div>
        </div>
        <div style={{ fontSize: "9px", color: "#4A5568", letterSpacing: "2px" }}>
          © 2026 HYBRID MATRIX. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}
