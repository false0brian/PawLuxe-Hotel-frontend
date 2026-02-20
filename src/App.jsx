import { useMemo, useState } from "react";
import OwnerLivePanel from "./components/OwnerLivePanel";
import StaffBoard from "./components/StaffBoard";
import AdminHealthPanel from "./components/AdminHealthPanel";
import { useAppStore } from "./store/appStore";

const TABS = [
  { id: "owner", label: "Owner" },
  { id: "staff", label: "Staff" },
  { id: "admin", label: "Admin" },
];

export default function App() {
  const [tab, setTab] = useState("owner");
  const role = useAppStore((s) => s.role);
  const userId = useAppStore((s) => s.userId);
  const sessionToken = useAppStore((s) => s.sessionToken);
  const setRole = useAppStore((s) => s.setRole);
  const setUserId = useAppStore((s) => s.setUserId);
  const setSessionToken = useAppStore((s) => s.setSessionToken);

  const content = useMemo(() => {
    if (tab === "owner") return <OwnerLivePanel />;
    if (tab === "staff") return <StaffBoard />;
    return <AdminHealthPanel />;
  }, [tab]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="kicker">PawLuxe Hotel</p>
          <h1>Live Ops Console MVP</h1>
          <p>예약-권한-라이브-운영기록을 한 흐름으로 검증하는 통합 화면</p>
        </div>
        <div className="auth-bar">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">owner</option>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
            <option value="system">system</option>
          </select>
          <input placeholder="x-user-id" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <input
            placeholder="x-session-token(optional)"
            value={sessionToken}
            onChange={(e) => setSessionToken(e.target.value)}
          />
        </div>
      </header>
      <nav className="tabs">
        {TABS.map((it) => (
          <button key={it.id} className={tab === it.id ? "active" : ""} onClick={() => setTab(it.id)}>
            {it.label}
          </button>
        ))}
      </nav>
      {content}
    </main>
  );
}
