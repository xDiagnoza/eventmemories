import { useState, useRef, useCallback, useEffect } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://nokmdtuukkgmvizdtnua.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bYuthBjlzvcoxPI3bEFXZA_tiWPTxNo";
const BUCKET_NAME = "event-photos";
const DASHBOARD_PASSWORD = "miri2024";
const USE_MOCK = false;

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
async function uploadPhoto(file, sessionId) {
    const ext = file.name.split(".").pop();
    const filename = `${sessionId}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filename}?upload=true`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": file.type,
                "x-upsert": "true",
            },
            body: file,
        }
    );
    if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
    }
    return filename;
}

async function listPhotos() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET_NAME}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1000, offset: 0, prefix: "" }),
  });
  if (!res.ok) throw new Error("Eroare");
  return await res.json();
}

function getPublicUrl(filename) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

const MOCK_PHOTOS = Array.from({ length: 18 }, (_, i) => ({
  name: `session_inv${i % 6}_${Date.now()}_photo${i}.jpg`,
  created_at: new Date(Date.now() - i * 180000).toISOString(),
  metadata: { size: Math.floor(Math.random() * 4000000 + 800000) },
}));

// ─── FLOATING PETALS ─────────────────────────────────────────────────────────
const PETAL_COUNT = 18;
function Petals() {
  const petals = Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 12 + 8,
    delay: Math.random() * 12,
    duration: Math.random() * 8 + 10,
    opacity: Math.random() * 0.25 + 0.08,
    rotate: Math.random() * 360,
    symbol: ["❀", "✿", "❁", "✾"][Math.floor(Math.random() * 4)],
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <style>{`
        @keyframes petalFall {
          0% { transform: translateY(-40px) rotate(0deg) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg) translateX(40px); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes progressGlow {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes photoReveal {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .petal { animation: petalFall linear infinite; }
        .fade-up { animation: fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-1 { animation: fadeUp 0.9s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-2 { animation: fadeUp 0.9s 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-3 { animation: fadeUp 0.9s 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-4 { animation: fadeUp 0.9s 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .photo-reveal { animation: photoReveal 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .shimmer { animation: shimmer 2.5s ease-in-out infinite; }
        .dropzone-hover:hover { border-color: #b8795a !important; background: rgba(212,163,115,0.06) !important; }
        .nav-link:hover { color: #b8795a !important; }
        .btn-primary:hover:not(:disabled) { background: #8a5a3a !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(184,121,90,0.35) !important; }
        .btn-secondary:hover { background: rgba(212,163,115,0.12) !important; }
        .photo-card:hover img { transform: scale(1.06); }
        .photo-card:hover .photo-overlay { opacity: 1 !important; }
        input:focus { border-color: #b8795a !important; box-shadow: 0 0 0 3px rgba(184,121,90,0.15) !important; outline: none; }
      `}</style>
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            position: "absolute",
            left: p.left,
            top: "-20px",
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            color: ["#c9897a", "#d4a373", "#e8c4b8", "#b5776a"][p.id % 4],
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
}

// ─── FONTS ───────────────────────────────────────────────────────────────────
function FontLoader() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  cream: "#fdf8f2",
  parchment: "#f5ede0",
  rose: "#b8795a",
  roseLight: "#d4a373",
  rosePale: "#f0ddd2",
  ink: "#3a2820",
  inkMid: "#7a5c50",
  inkLight: "#b09080",
  gold: "#c9a96e",
  goldLight: "#e8d5b0",
  white: "#fffcf8",
  border: "rgba(184,121,90,0.2)",
};

const font = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Lato', Helvetica, sans-serif",
};

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
function Divider({ style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", ...style }}>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${T.goldLight})` }} />
      <span style={{ color: T.gold, fontSize: "16px", opacity: 0.7 }}>❧</span>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, transparent, ${T.goldLight})` }} />
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ view, setView, authed }) {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 32px",
      background: "rgba(253,248,242,0.88)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <div
        onClick={() => setView("upload")}
        style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start" }}
      >
        <span style={{ fontFamily: font.display, fontSize: "20px", fontWeight: 400, color: T.ink, fontStyle: "italic", letterSpacing: "0.01em" }}>
          EventMemories
        </span>
        <span style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: T.inkLight, fontFamily: font.body, marginTop: "-1px" }}>
          amintiri pentru totdeauna
        </span>
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button
          className="nav-link"
          onClick={() => setView("upload")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: font.body, fontSize: "12px", letterSpacing: "0.12em",
            textTransform: "uppercase", color: view === "upload" ? T.rose : T.inkMid,
            padding: "6px 14px", transition: "color 0.2s",
            borderBottom: view === "upload" ? `1px solid ${T.rose}` : "1px solid transparent",
          }}
        >
          Invitați
        </button>
        <button
          className="nav-link"
          onClick={() => setView(authed ? "dashboard" : "login")}
          style={{
            background: view === "dashboard" ? T.rose : "none",
            border: `1px solid ${view === "dashboard" ? T.rose : T.border}`,
            borderRadius: "40px",
            cursor: "pointer",
            fontFamily: font.body, fontSize: "12px", letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: view === "dashboard" ? T.white : T.inkMid,
            padding: "6px 18px", transition: "all 0.2s",
          }}
        >
          ♡ Miri
        </button>
      </div>
    </nav>
  );
}

// ─── UPLOAD PAGE ─────────────────────────────────────────────────────────────
function UploadPage() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const sessionId = useRef(`inv_${Math.random().toString(36).slice(2, 8)}`);

  const addFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((p) => [...p, ...valid]);
    valid.forEach((f) => {
      const r = new FileReader();
      r.onload = (e) => setPreviews((p) => [...p, e.target.result]);
      r.readAsDataURL(f);
    });
  };

  const removeFile = (i) => {
    setFiles((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, []);

  const handleUpload = async () => {
    setUploading(true); setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        if (USE_MOCK) await new Promise((r) => setTimeout(r, 500));
        else await uploadPhoto(files[i], sessionId.current);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setDone(true);
    } catch {
      setError("Ceva n-a mers. Te rugăm să încerci din nou.");
    } finally {
      setUploading(false);
    }
  };

  if (done) return (
    <div style={{ maxWidth: "460px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <div className="fade-up" style={{ fontSize: "56px", marginBottom: "24px" }}>🌸</div>
      <h2 className="fade-up-1" style={{ fontFamily: font.display, fontSize: "36px", fontWeight: 400, fontStyle: "italic", color: T.ink, marginBottom: "12px" }}>
        Mulțumim din suflet!
      </h2>
      <Divider style={{ margin: "20px 0" }} />
      <p className="fade-up-2" style={{ fontFamily: font.body, color: T.inkMid, fontSize: "15px", lineHeight: 1.8, marginBottom: "32px" }}>
        Cele {files.length} amintiri ale tale au ajuns în siguranță.<br />
        Mirii le vor privi cu drag și recunoștință.
      </p>
      <button
        className="btn-secondary"
        onClick={() => { setFiles([]); setPreviews([]); setDone(false); setProgress(0); }}
        style={{
          background: "none", border: `1px solid ${T.border}`, borderRadius: "40px",
          padding: "12px 32px", fontFamily: font.body, fontSize: "12px",
          letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkMid,
          cursor: "pointer", transition: "all 0.2s",
        }}
      >
        Adaugă mai multe
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "60px 24px 80px", position: "relative", zIndex: 1 }}>
      {/* HERO */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontFamily: font.body, fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "16px" }}>
          ✦ &nbsp; un dar fotografic &nbsp; ✦
        </div>
        <h1 style={{
          fontFamily: font.display, fontSize: "clamp(38px, 9vw, 64px)",
          fontWeight: 400, fontStyle: "italic", lineHeight: 1.1,
          color: T.ink, marginBottom: "20px", letterSpacing: "-0.01em",
        }}>
          Împărtășește<br />amintiri frumoase
        </h1>
        <Divider style={{ margin: "20px auto", maxWidth: "200px" }} />
        <p style={{ fontFamily: font.body, color: T.inkMid, fontSize: "15px", lineHeight: 1.8, fontWeight: 300 }}>
          Încarcă pozele tale din această zi specială.<br />
          Mirii le vor primi ca pe cel mai prețios cadou.
        </p>
      </div>

      {/* DROPZONE */}
      <div
        className="fade-up-2 dropzone-hover"
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragging ? T.rose : T.border}`,
          borderRadius: "16px",
          padding: "48px 32px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? `rgba(212,163,115,0.06)` : T.white,
          transition: "all 0.25s",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0, borderRadius: "16px",
          background: `radial-gradient(ellipse at 50% 0%, rgba(212,163,115,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{ fontSize: "40px", marginBottom: "14px" }}>📷</div>
        <div style={{ fontFamily: font.display, fontSize: "18px", fontStyle: "italic", color: T.ink, marginBottom: "8px" }}>
          Adaugă pozele tale
        </div>
        <div style={{ fontFamily: font.body, fontSize: "12px", color: T.inkLight, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          trage aici sau apasă pentru a selecta
        </div>
        <div style={{ fontFamily: font.body, fontSize: "11px", color: T.inkLight, marginTop: "8px" }}>
          JPG · PNG · HEIC &nbsp;·&nbsp; max 20MB per poză
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
      </div>

      {/* PREVIEW GRID */}
      {previews.length > 0 && (
        <div className="fade-up-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
          {previews.map((src, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: "10px", overflow: "hidden", position: "relative", background: T.parchment }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{
                    position: "absolute", top: "6px", right: "6px",
                    background: "rgba(58,40,32,0.75)", color: "#fff",
                    border: "none", borderRadius: "50%", width: "22px", height: "22px",
                    fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >×</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PROGRESS */}
      {uploading && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ height: "3px", background: T.rosePale, borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: `linear-gradient(90deg, ${T.rose}, ${T.gold}, ${T.rose})`,
              backgroundSize: "200% 100%",
              animation: "progressGlow 1.5s linear infinite",
              borderRadius: "2px", transition: "width 0.3s",
            }} />
          </div>
          <div style={{ textAlign: "center", fontFamily: font.body, fontSize: "12px", color: T.inkLight, marginTop: "8px" }}>
            Se încarcă {progress}%...
          </div>
        </div>
      )}

      {error && (
        <div style={{ fontFamily: font.body, fontSize: "13px", color: "#a33", textAlign: "center", marginBottom: "12px" }}>{error}</div>
      )}

      {/* UPLOAD BTN */}
      <button
        className="btn-primary fade-up-4"
        disabled={!files.length || uploading}
        onClick={handleUpload}
        style={{
          width: "100%",
          background: !files.length || uploading
            ? T.rosePale
            : `linear-gradient(135deg, ${T.rose} 0%, #a06040 100%)`,
          color: !files.length || uploading ? T.inkLight : T.white,
          border: "none", borderRadius: "50px",
          padding: "16px 32px",
          fontFamily: font.body, fontSize: "13px", letterSpacing: "0.14em",
          textTransform: "uppercase", cursor: !files.length || uploading ? "not-allowed" : "pointer",
          transition: "all 0.25s", boxShadow: files.length && !uploading ? `0 4px 16px rgba(184,121,90,0.25)` : "none",
        }}
      >
        {uploading ? `Se încarcă... ${progress}%` : files.length > 0 ? `✦ Trimite ${files.length} ${files.length === 1 ? "poză" : "poze"} ✦` : "✦ Trimite pozele ✦"}
      </button>

      {files.length === 0 && (
        <p style={{ textAlign: "center", fontFamily: font.body, fontSize: "12px", color: T.inkLight, marginTop: "16px", lineHeight: 1.7 }}>
          Pozele sunt private și accesibile doar mirilor. ♡
        </p>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (pw === DASHBOARD_PASSWORD) { onLogin(); }
    else {
      setErr("Parolă incorectă.");
      setPw("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 1 }}>
      <div className="fade-up" style={{
        width: "100%", maxWidth: "380px",
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: "20px",
        padding: "52px 44px",
        boxShadow: "0 8px 48px rgba(184,121,90,0.10)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>💍</div>
        <h2 style={{ fontFamily: font.display, fontSize: "28px", fontWeight: 400, fontStyle: "italic", color: T.ink, marginBottom: "8px" }}>
          Spațiul mirilor
        </h2>
        <Divider style={{ margin: "16px 0" }} />
        <p style={{ fontFamily: font.body, fontSize: "13px", color: T.inkMid, marginBottom: "28px", lineHeight: 1.7 }}>
          Introdu parola pentru a vedea<br />toate amintirile voastre.
        </p>
        <input
          type="password"
          placeholder="Parola secretă..."
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          autoFocus
          style={{
            width: "100%", border: `1px solid ${T.border}`, borderRadius: "50px",
            padding: "13px 20px", fontSize: "14px",
            fontFamily: font.body, background: T.cream,
            color: T.ink, boxSizing: "border-box", marginBottom: "10px",
            textAlign: "center", letterSpacing: "0.1em",
            transition: "all 0.2s",
            transform: shake ? "translateX(-4px)" : "none",
          }}
        />
        {err && <div style={{ fontFamily: font.body, fontSize: "12px", color: "#a33", marginBottom: "10px" }}>{err}</div>}
        <button
          className="btn-primary"
          onClick={attempt}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${T.rose} 0%, #a06040 100%)`,
            color: T.white, border: "none", borderRadius: "50px",
            padding: "14px 24px", fontFamily: font.body, fontSize: "12px",
            letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.25s", boxShadow: `0 4px 16px rgba(184,121,90,0.25)`,
          }}
        >
          ♡ Intră
        </button>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ number, label, icon, delay }) {
  return (
    <div className={`fade-up-${delay}`} style={{
      background: T.white, border: `1px solid ${T.border}`,
      borderRadius: "16px", padding: "24px 20px", textAlign: "center",
      boxShadow: "0 2px 16px rgba(184,121,90,0.07)",
    }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontFamily: font.display, fontSize: "40px", fontWeight: 400, color: T.ink, lineHeight: 1, marginBottom: "6px" }}>
        {number}
      </div>
      <div style={{ fontFamily: font.body, fontSize: "11px", color: T.inkLight, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ─── PHOTO CARD ───────────────────────────────────────────────────────────────
function PhotoCard({ src, meta, onClick, delay }) {
  return (
    <div
      className="photo-card"
      onClick={onClick}
      style={{
        aspectRatio: "1", borderRadius: "12px", overflow: "hidden",
        cursor: "pointer", position: "relative", background: T.parchment,
        boxShadow: "0 2px 12px rgba(58,40,32,0.08)",
        animation: `photoReveal 0.5s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
      }}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)", display: "block" }} />
      <div
        className="photo-overlay"
        style={{
          position: "absolute", inset: 0, opacity: 0,
          background: "linear-gradient(to top, rgba(58,40,32,0.5) 0%, transparent 60%)",
          transition: "opacity 0.3s", display: "flex", alignItems: "flex-end", padding: "10px 12px",
        }}
      >
        <span style={{ fontFamily: font.body, fontSize: "11px", color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>{meta}</span>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (USE_MOCK) { await new Promise((r) => setTimeout(r, 900)); setPhotos(MOCK_PHOTOS); }
        else { const data = await listPhotos(); setPhotos(data || []); }
      } catch { setPhotos(USE_MOCK ? MOCK_PHOTOS : []); }
      finally { setLoading(false); }
    })();
  }, []);

  const uploaderCount = (() => {
    const s = new Set(photos.map((p) => { const pts = p.name.split("_"); return pts[0] + "_" + pts[1]; }));
    return s.size;
  })();

  const totalMB = photos.reduce((a, p) => a + (p.metadata?.size || 0), 0) / 1024 / 1024;

  const downloadAll = async () => {
    setDownloading(true);
    await new Promise((r) => setTimeout(r, 1500));
    alert("În producție: se descarcă un ZIP cu toate pozele.");
    setDownloading(false);
  };

  return (
    <>
      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(30,18,12,0.95)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: "20px", right: "24px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontSize: "32px", cursor: "pointer" }}>×</button>
          <img
            src={USE_MOCK ? `https://picsum.photos/seed/${lightbox + 10}/900/900` : getPublicUrl(photos[lightbox].name)}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "88vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 20px 80px rgba(0,0,0,0.6)" }}
          />
          <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", fontFamily: font.body, fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontFamily: font.body, fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: T.gold, marginBottom: "14px" }}>
            ✦ &nbsp; galeria voastră &nbsp; ✦
          </div>
          <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 6vw, 54px)", fontWeight: 400, fontStyle: "italic", color: T.ink, marginBottom: "12px", lineHeight: 1.1 }}>
            Amintirile de la nuntă
          </h1>
          <Divider style={{ maxWidth: "260px", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: font.body, fontSize: "14px", color: T.inkMid, fontWeight: 300 }}>
            Toate momentele prețioase, adunate cu drag de invitații voștri.
          </p>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          <StatCard number={photos.length} label="Amintiri primite" icon="🌸" delay={1} />
          <StatCard number={uploaderCount} label="Inimi contribuite" icon="♡" delay={2} />
          <StatCard number={`${totalMB.toFixed(1)}`} label="MB de amintiri" icon="✦" delay={3} />
        </div>

        {/* DOWNLOAD BTN */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <button
            className="btn-primary"
            onClick={downloadAll}
            disabled={downloading || photos.length === 0}
            style={{
              background: downloading || photos.length === 0 ? T.rosePale : `linear-gradient(135deg, ${T.rose} 0%, #a06040 100%)`,
              color: downloading || photos.length === 0 ? T.inkLight : T.white,
              border: "none", borderRadius: "50px",
              padding: "14px 36px", fontFamily: font.body, fontSize: "12px",
              letterSpacing: "0.14em", textTransform: "uppercase",
              cursor: downloading || photos.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.25s", boxShadow: `0 4px 16px rgba(184,121,90,0.2)`,
            }}
          >
            {downloading ? "Se pregătește..." : "↓ Descarcă toate pozele (ZIP)"}
          </button>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div className="shimmer" style={{ fontFamily: font.display, fontSize: "22px", fontStyle: "italic", color: T.inkLight }}>
              Se încarcă amintirile voastre...
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🌿</div>
            <div style={{ fontFamily: font.display, fontSize: "20px", fontStyle: "italic", color: T.inkMid }}>Nicio poză încă. În curând...</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {photos.map((photo, i) => (
              <PhotoCard
                key={photo.name}
                src={USE_MOCK ? `https://picsum.photos/seed/${i + 20}/400/400` : getPublicUrl(photo.name)}
                meta={photo.created_at ? new Date(photo.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }) : ""}
                onClick={() => setLightbox(i)}
                delay={Math.min(i * 0.04, 0.6)}
              />
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <Divider style={{ marginTop: "48px" }} />
        )}
      </div>
    </>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("upload");
  const [authed, setAuthed] = useState(false);

  const handleSetView = (v) => {
    if (v === "dashboard" && !authed) setView("login");
    else setView(v);
  };

  return (
    <div style={{
      fontFamily: font.body,
      background: `radial-gradient(ellipse at 20% 0%, rgba(212,163,115,0.12) 0%, transparent 50%),
                   radial-gradient(ellipse at 80% 100%, rgba(184,121,90,0.08) 0%, transparent 50%),
                   ${T.cream}`,
      minHeight: "100vh",
      color: T.ink,
    }}>
      <FontLoader />
      <Petals />
      <Nav view={view} setView={handleSetView} authed={authed} />

      {view === "upload" && <UploadPage />}
      {view === "login" && <LoginPage onLogin={() => { setAuthed(true); setView("dashboard"); }} />}
      {view === "dashboard" && <Dashboard />}
    </div>
  );
}
