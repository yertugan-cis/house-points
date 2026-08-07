import React, { useEffect, useState } from "react";
import { MessageSquare, Bell, Settings } from "lucide-react";
import { supabase } from "./supabaseClient";

const NAVY = "#003057";

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = username.includes("@") ? username : `${username}@housepoints.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError("Incorrect username or password.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-5">
          <img src="/crests/leaf-mark.png" alt="" className="h-6" />
          <span className="text-sm font-medium">CIS Astana — House Points</span>
        </div>
        <label className="block text-xs text-slate-500 mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none"
          placeholder="e.g. madina.k"
        />
        <label className="block text-xs text-slate-500 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white text-sm font-medium rounded-lg py-2 disabled:opacity-50"
          style={{ background: NAVY }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top nav — matches the CIS Brightspace-style header
// ---------------------------------------------------------------------------
function TopNav({ profile }) {
  const initials = profile.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?";
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100">
      <div className="flex items-center gap-3">
        <img src="/crests/leaf-mark.png" alt="" className="h-9" />
        <div className="leading-tight">
          <p className="text-sm font-bold" style={{ color: NAVY }}>
            CANADIAN<br />INTERNATIONAL<br />SCHOOL
          </p>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">ASTANA</p>
        </div>
        <div className="flex items-center gap-5 ml-8 text-sm text-slate-600">
          <span className="cursor-pointer hover:text-slate-900">Calendar</span>
          <span className="cursor-pointer hover:text-slate-900">Announcements</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <MessageSquare size={18} className="text-slate-400" />
        <div className="relative">
          <Bell size={18} className="text-slate-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: "#9c2b4e" }}>
            {initials}
          </div>
          <span className="text-sm text-slate-700">{profile.full_name}</span>
        </div>
        <Settings size={18} className="text-slate-400" />
        <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-400 hover:text-slate-600 ml-2">
          Sign out
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animated maple leaf background — tiled from the real logo leaf, alternating
// scroll direction row by row.
// ---------------------------------------------------------------------------
function MapleBackground() {
  const rows = 6;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: NAVY }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={i % 2 === 0 ? "leaf-row-right" : "leaf-row-left"}
          style={{
            position: "absolute",
            top: `${i * 18}%`,
            left: 0,
            right: 0,
            height: "20%",
            backgroundImage: `url("/crests/maple-leaf.png")`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "90px 95px",
            backgroundPosition: "0 center",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero — the whole first screen for now, no tables/points yet
// ---------------------------------------------------------------------------
function Hero({ profile, houses }) {
  return (
    <div className="relative flex-1 overflow-hidden flex items-center">
      <MapleBackground />
      <div className="relative px-10 w-full flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <p className="text-xs tracking-widest text-blue-200 font-medium mb-2">WELCOME TO</p>
          <h1 className="text-5xl font-bold text-white leading-tight">
            CIS House Hub, {profile.full_name?.split(" ")[0]}
          </h1>
        </div>
        <div className="flex gap-4">
          {houses.map((h) => (
            <img key={h.id} src={`/crests/${h.id}.png`} alt={h.name} className="w-40" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    loadAll();
  }, [session]);

  async function loadAll() {
    setLoading(true);
    const [{ data: me }, { data: hs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("houses").select("*"),
    ]);
    setProfile(me);
    setHouses(hs || []);
    setLoading(false);
  }

  if (!session) return <LoginScreen />;
  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
      <TopNav profile={profile} />
      <Hero profile={profile} houses={houses} />
    </div>
  );
}
