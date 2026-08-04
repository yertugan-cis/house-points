import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Rows3,
  ShieldCheck,
  Search,
  Trash2,
  Crown,
  CalendarDays,
  Snowflake,
  PawPrint,
  LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const NAVY = "#003057";
const RED = "#E4392E";
const HOUSE_ICONS = { polar: Snowflake, caribou: PawPrint, wolves: PawPrint };

// Outlined maple leaf, repeated as a tiled background image so each row can
// animate its background-position instead of animating many DOM nodes.
const MAPLE_LEAF_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="110" viewBox="0 0 120 110">
  <path d="M60 6 L68 28 L88 16 L82 38 L104 34 L88 50 L108 60 L86 64 L96 84 L74 76 L72 100 L60 82 L48 100 L46 76 L24 84 L34 64 L12 60 L32 50 L16 34 L38 38 L32 16 L52 28 Z"
    fill="none" stroke="#E4392E" stroke-width="3" stroke-linejoin="round"/>
</svg>`);
const MAPLE_LEAF_URL = `url("data:image/svg+xml,${MAPLE_LEAF_SVG}")`;

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
            top: `${i * 20}%`,
            left: 0,
            right: 0,
            height: "22%",
            backgroundImage: MAPLE_LEAF_URL,
            backgroundRepeat: "repeat-x",
            backgroundSize: "120px 110px",
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

const CREST_IMAGES = {
  polar: "/crests/polar.png",
  caribou: "/crests/caribou.png",
  wolves: "/crests/wolves.png",
};

function HouseCrest({ house, size = 90 }) {
  const src = CREST_IMAGES[house.id];
  if (!src) return null;
  return <img src={src} alt={house.name} style={{ width: size, height: "auto" }} />;
}

function Hero({ profile, houses }) {
  return (
    <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
      <MapleBackground />
      <div className="relative px-8 py-10 flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <p className="text-xs tracking-widest text-blue-200 font-medium mb-1">WELCOME TO</p>
          <h1 className="text-3xl font-bold text-white leading-tight">
            CIS House Hub, {profile.full_name?.split(" ")[0]}
          </h1>
        </div>
        <div className="flex gap-3">
          {houses.map((h) => (
            <HouseCrest key={h.id} house={h} size={110} />
          ))}
        </div>
      </div>
    </div>
  );
}

const iso = (d) => d.toISOString().slice(0, 10);
const inRange = (dateStr, from, to) => dateStr >= from && dateStr <= to;
const monthRange = (d) => {
  const y = d.getFullYear(), m = d.getMonth();
  return [iso(new Date(y, m, 1)), iso(new Date(y, m + 1, 0))];
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
function LoginScreen({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Students log in with a plain username Mr. Koch gives them; we map it to
    // the email-shaped identity Supabase Auth expects behind the scenes.
    const email = username.includes("@") ? username : `${username}@housepoints.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Incorrect username or password.");
      return;
    }
    onLoggedIn();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: NAVY }}>
            <ShieldCheck size={16} className="text-white" />
          </div>
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
// Top nav
// ---------------------------------------------------------------------------
function TopNav({ view, setView, profile }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "houses", label: "Houses", icon: Rows3 },
    ...(profile.role === "admin" ? [{ id: "admin", label: "Admin", icon: ShieldCheck }] : []),
  ];
  const initials = profile.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?";
  return (
    <div className="flex items-center justify-between px-6 py-3" style={{ background: NAVY }}>
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 120 110">
          <path d="M60 6 L68 28 L88 16 L82 38 L104 34 L88 50 L108 60 L86 64 L96 84 L74 76 L72 100 L60 82 L48 100 L46 76 L24 84 L34 64 L12 60 L32 50 L16 34 L38 38 L32 16 L52 28 Z" fill="none" stroke={RED} strokeWidth="6" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-semibold text-white tracking-wide">CANADIAN INTERNATIONAL SCHOOL</span>
      </div>
      <div className="flex items-center gap-6 text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`flex items-center gap-1.5 pb-0.5 border-b-2 ${
              view === t.id ? "text-white font-medium border-white" : "border-transparent text-blue-200 hover:text-white"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: RED }}>
          {initials}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1 text-xs text-blue-200 hover:text-white">
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

function HouseCard({ house, month, year, leading }) {
  const Icon = HOUSE_ICONS[house.id] || PawPrint;
  return (
    <div className="rounded-xl p-4 relative border border-slate-200" style={{ background: `${house.color_bg}22` }}>
      {leading && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: NAVY }}>
          <Crown size={11} className="text-white" />
          <span className="text-[10px] text-white font-medium">Leading</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: house.color_bg }}>
          <Icon size={13} style={{ color: house.color_text }} />
        </div>
        <span className="text-sm font-medium" style={{ color: NAVY }}>{house.name}</span>
      </div>
      <div className="flex gap-5">
        <div>
          <p className="text-xl font-medium" style={{ color: NAVY }}>{month}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">this month</p>
        </div>
        <div>
          <p className="text-xl font-medium" style={{ color: NAVY }}>{year}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">this year</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard — reads from the public_entries view (name + points only)
// ---------------------------------------------------------------------------
function Dashboard({ profile, houses, profiles, publicEntries, events, settings }) {
  const today = new Date();
  const [mFrom, mTo] = monthRange(today);
  const yFrom = settings.academic_year_start || `${today.getFullYear()}-09-01`;
  const yTo = settings.academic_year_end || `${today.getFullYear() + 1}-08-31`;

  const totals = useMemo(() => {
    const byHouseMonth = {}, byHouseYear = {}, byStudentMonth = {}, byStudentYear = {};
    for (const h of houses) {
      byHouseMonth[h.id] = publicEntries.filter((e) => e.house_id === h.id && inRange(e.date, mFrom, mTo)).reduce((a, e) => a + e.points, 0);
      byHouseYear[h.id] = publicEntries.filter((e) => e.house_id === h.id && inRange(e.date, yFrom, yTo)).reduce((a, e) => a + e.points, 0);
    }
    for (const s of profiles.filter((p) => p.role === "student")) {
      byStudentMonth[s.id] = publicEntries.filter((e) => e.student_id === s.id && inRange(e.date, mFrom, mTo)).reduce((a, e) => a + e.points, 0);
      byStudentYear[s.id] = publicEntries.filter((e) => e.student_id === s.id && inRange(e.date, yFrom, yTo)).reduce((a, e) => a + e.points, 0);
    }
    return { byHouseMonth, byHouseYear, byStudentMonth, byStudentYear };
  }, [publicEntries, houses, profiles]);

  const leadingHouse = houses.length
    ? houses.reduce((a, b) => (totals.byHouseMonth[a.id] > totals.byHouseMonth[b.id] ? a : b))
    : null;

  const topByHouse = houses.map((h) => {
    const studentsInHouse = profiles.filter((p) => p.role === "student" && p.house_id === h.id);
    const top = studentsInHouse.reduce(
      (best, s) => (totals.byStudentYear[s.id] > (best ? totals.byStudentYear[best.id] : -Infinity) ? s : best),
      null
    );
    return { house: h, student: top };
  });

  const myRecent = publicEntries
    .filter((e) => e.student_id === profile.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  const [year, month] = [today.getFullYear(), today.getMonth()];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDates = new Set(events.map((e) => e.date));

  return (
    <div>
      <Hero profile={profile} houses={houses} />
      <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {houses.map((h) => (
          <HouseCard key={h.id} house={h} month={totals.byHouseMonth[h.id] || 0} year={totals.byHouseYear[h.id] || 0} leading={leadingHouse?.id === h.id} />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-[1fr,60px,60px] gap-2 text-[11px] text-slate-400 pb-2 border-b border-slate-200">
          <span>Top scorer by house</span>
          <span className="text-right">Month</span>
          <span className="text-right">Year</span>
        </div>
        {topByHouse.map(({ house, student }) => (
          <div key={house.id} className="grid grid-cols-[1fr,60px,60px] items-center gap-2 py-2 border-b border-slate-200 last:border-0 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: house.color_bg }} />
              <span>{student ? student.full_name : "—"} · {house.name}</span>
            </div>
            <span className="text-right font-medium text-emerald-600">+{student ? totals.byStudentMonth[student.id] || 0 : 0}</span>
            <span className="text-right font-medium text-slate-800">+{student ? totals.byStudentYear[student.id] || 0 : 0}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.3fr,1fr] gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium bg-slate-200">
              {profile.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-slate-500">
                {houses.find((h) => h.id === profile.house_id)?.name} · Grade {profile.grade}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white rounded-lg p-2.5 border border-slate-200">
              <p className="text-[11px] text-slate-500 mb-1">This month</p>
              <p className="text-lg font-medium text-emerald-600">+{totals.byStudentMonth[profile.id] || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-slate-200">
              <p className="text-[11px] text-slate-500 mb-1">This year</p>
              <p className="text-lg font-medium">+{totals.byStudentYear[profile.id] || 0}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mb-1">Recent entries</p>
          {myRecent.length === 0 && <p className="text-xs text-slate-400 py-2">No entries yet.</p>}
          {myRecent.map((e) => (
            <div key={e.id} className="flex justify-between py-2 border-t border-slate-200 text-sm">
              <span className="text-slate-500">{e.date.slice(5)}</span>
              <span className={e.points >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {e.points >= 0 ? "+" : ""}{e.points}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {today.toLocaleString("en-US", { month: "long", year: "numeric" })}
            </span>
            <CalendarDays size={16} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isEvent = eventDates.has(dateStr);
              return (
                <div key={day} className={`text-center text-xs py-1 rounded-full ${isEvent ? "text-white font-medium" : "text-slate-600"}`} style={isEvent ? { background: RED } : {}}>
                  {day}
                </div>
              );
            })}
          </div>
          {events.map((ev) => (
            <p key={ev.id} className="text-[11px] text-slate-400 mt-2">{ev.date.slice(5)} — {ev.title}</p>
          ))}
          {events.length === 0 && <p className="text-[11px] text-slate-400 mt-2">No events scheduled.</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Houses page — name + points only, never the reason
// ---------------------------------------------------------------------------
function HousesPage({ houses, publicEntries }) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        {houses.map((h) => {
          const Icon = HOUSE_ICONS[h.id] || PawPrint;
          const list = publicEntries.filter((e) => e.house_id === h.id).sort((a, b) => (a.date < b.date ? 1 : -1));
          return (
            <div key={h.id}>
              <div className="flex items-center gap-2 rounded-t-lg px-3 py-2.5" style={{ background: h.color_bg }}>
                <Icon size={14} style={{ color: h.color_text }} />
                <span className="text-sm font-medium" style={{ color: h.color_text }}>{h.name}</span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-lg max-h-96 overflow-y-auto">
                {list.map((e) => (
                  <div key={e.id} className="flex justify-between px-3 py-2.5 border-b border-slate-100 last:border-0 text-sm">
                    <span>{e.full_name}</span>
                    <span className={e.points >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                      {e.points >= 0 ? "+" : ""}{e.points}
                    </span>
                  </div>
                ))}
                {list.length === 0 && <p className="text-xs text-slate-400 px-3 py-3">No entries yet.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin page (Mr. Koch) — full point_entries table, with reasons
// ---------------------------------------------------------------------------
function AdminPage({ profile, profiles, categories, houses, refreshEntries }) {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || null);
  const [customPoints, setCustomPoints] = useState("");
  const [recentAdmin, setRecentAdmin] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    const { data } = await supabase
      .from("point_entries")
      .select("id, points, created_at, student:profiles!point_entries_student_id_fkey(full_name), category:categories(label)")
      .order("created_at", { ascending: false })
      .limit(6);
    setRecentAdmin(data || []);
  }

  const matches = query.length
    ? profiles.filter((p) => p.role === "student" && p.full_name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const isCustom = selectedCategory?.id === "custom";
  const points = isCustom ? Number(customPoints) || 0 : selectedCategory?.default_points || 0;

  async function addEntry() {
    if (!selectedStudent || !selectedCategory) return;
    setBusy(true);
    await supabase.from("point_entries").insert({
      student_id: selectedStudent.id,
      category_id: isCustom ? null : selectedCategory.id,
      points,
      created_by: profile.id,
    });
    setBusy(false);
    setSelectedStudent(null);
    setQuery("");
    loadRecent();
    refreshEntries();
  }

  async function removeEntry(id) {
    await supabase.from("point_entries").delete().eq("id", id);
    loadRecent();
    refreshEntries();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: NAVY }}>
          <ShieldCheck size={14} className="text-white" />
        </div>
        <span className="text-sm font-medium">Admin — Add new entry</span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <p className="text-[11px] text-slate-400 mb-1.5">Student</p>
        <div className="relative mb-3.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-slate-400" />
            <input
              value={selectedStudent ? selectedStudent.full_name : query}
              onChange={(e) => { setQuery(e.target.value); setSelectedStudent(null); }}
              placeholder="Type a name..."
              className="text-sm outline-none flex-1 bg-transparent"
            />
          </div>
          {matches.length > 0 && !selectedStudent && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden z-10">
              {matches.map((s) => {
                const house = houses.find((h) => h.id === s.house_id);
                return (
                  <button key={s.id} onClick={() => { setSelectedStudent(s); setQuery(s.full_name); }} className="w-full flex justify-between px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <span>{s.full_name}</span>
                    <span className="text-xs text-slate-400">{house?.name} · Gr {s.grade}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mb-1.5">Category</p>
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c)}
              className={`text-xs px-2.5 py-1.5 rounded-full border`}
              style={selectedCategory?.id === c.id ? { background: `${NAVY}15`, color: NAVY, borderColor: NAVY } : { borderColor: "#e2e8f0", color: "#475569" }}
            >
              {c.label} <span className={c.default_points >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>{c.default_points >= 0 ? "+" : ""}{c.default_points}</span>
            </button>
          ))}
          <button onClick={() => setSelectedCategory({ id: "custom", label: "Custom" })} className="text-xs px-2.5 py-1.5 rounded-full border border-dashed border-slate-300 text-slate-400">
            + Custom
          </button>
        </div>
        {isCustom && (
          <input type="number" value={customPoints} onChange={(e) => setCustomPoints(e.target.value)} placeholder="Points (use minus for deductions)" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3.5 outline-none" />
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedStudent ? `${selectedStudent.full_name.split(" ")[0]} · ${selectedCategory?.label}` : "Select a student to continue"}
          </span>
          <button onClick={addEntry} disabled={!selectedStudent || busy} className="text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-40" style={{ background: NAVY }}>
            {busy ? "Saving..." : `Add ${points >= 0 ? "+" : ""}${points}`}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-1.5">Just added</p>
      {recentAdmin.map((e) => (
        <div key={e.id} className="flex justify-between items-center py-2 border-t border-slate-200 text-sm">
          <span>{e.student?.full_name} · {e.category?.label ?? "Custom"}</span>
          <div className="flex items-center gap-2.5">
            <span className={e.points >= 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>{e.points >= 0 ? "+" : ""}{e.points}</span>
            <Trash2 size={13} className="text-slate-400 cursor-pointer" onClick={() => removeEntry(e.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App root — handles session, loads reference data, routes views
// ---------------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [houses, setHouses] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [publicEntries, setPublicEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState({});
  const [view, setView] = useState("dashboard");
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
    const [{ data: me }, { data: hs }, { data: ps }, { data: cats }, { data: entries }, { data: evs }, { data: sett }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("houses").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("categories").select("*"),
      supabase.from("public_entries").select("*"),
      supabase.from("events").select("*").order("date"),
      supabase.from("settings").select("*"),
    ]);
    setProfile(me);
    setHouses(hs || []);
    setProfiles(ps || []);
    setCategories(cats || []);
    setPublicEntries(entries || []);
    setEvents(evs || []);
    setSettings(Object.fromEntries((sett || []).map((s) => [s.key, s.value])));
    setLoading(false);
  }

  async function refreshEntries() {
    const { data } = await supabase.from("public_entries").select("*");
    setPublicEntries(data || []);
  }

  if (!session) return <LoginScreen onLoggedIn={() => {}} />;
  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      <TopNav view={view} setView={setView} profile={profile} />
      {view === "dashboard" && (
        <Dashboard profile={profile} houses={houses} profiles={profiles} publicEntries={publicEntries} events={events} settings={settings} />
      )}
      {view === "houses" && <HousesPage houses={houses} publicEntries={publicEntries} />}
      {view === "admin" && profile.role === "admin" && (
        <AdminPage profile={profile} profiles={profiles} categories={categories} houses={houses} refreshEntries={refreshEntries} />
      )}
    </div>
  );
}
