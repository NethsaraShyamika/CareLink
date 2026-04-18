// ─── DoctorSidebar.jsx ────────────────────────────────────────────────────────
// Shared sidebar component for all Doctor portal pages.
// Usage:
//   import DoctorSidebar from "./DoctorSidebar";
//   <DoctorSidebar activeNav="appointments" doctorProfile={profile} pendingCount={3} />

import { useNavigate, useLocation } from "react-router-dom";

const SIDEBAR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .ds-sidebar {
    width: 260px;
    flex-shrink: 0;
    background: #ffffff;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100vh;
    position: sticky;
    top: 0;
    font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
  }

  .ds-brand {
    padding: 22px 20px 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #F3F4F6;
  }

  .ds-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
  }

  .ds-app-name {
    font-size: 15px;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.4px;
    line-height: 1.2;
  }

  .ds-app-role {
    font-size: 11px;
    color: #9CA3AF;
    font-weight: 500;
    margin-top: 2px;
  }

  .ds-nav {
    flex: 1;
    padding: 18px 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .ds-section-label {
    font-size: 10px;
    font-weight: 700;
    color: #9CA3AF;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0 10px 6px;
  }

  .ds-nav-items {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ds-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    color: #6B7280;
    font-size: 13.5px;
    font-weight: 500;
    transition: background 0.15s, color 0.15s;
    user-select: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
  }

  .ds-nav-item:hover {
    background: #F9FAFB;
    color: #111827;
  }

  .ds-nav-item.active {
    background: #E0E7FF;
    color: #4F46E5;
    font-weight: 700;
  }

  .ds-nav-badge {
    margin-left: auto;
    background: #4F46E5;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    border-radius: 99px;
    padding: 2px 8px;
    min-width: 22px;
    text-align: center;
    line-height: 1.5;
  }

  .ds-nav-badge.warning {
    background: #F59E0B;
  }

  .ds-bottom {
    border-top: 1px solid #F3F4F6;
    padding: 16px 14px 20px;
  }

  .ds-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #F9FAFB;
    border-radius: 12px;
    padding: 10px 12px;
    margin-bottom: 10px;
    border: 1px solid #E5E7EB;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
  }

  .ds-user-card:hover {
    background: #E0E7FF;
    border-color: #A5B4FC;
  }

  .ds-user-card:active {
    transform: scale(0.98);
  }

  .ds-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #E0E7FF;
    color: #4F46E5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .ds-user-name {
    font-size: 13px;
    font-weight: 700;
    color: #111827;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ds-user-spec {
    font-size: 11px;
    color: #9CA3AF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ds-online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22C55E;
    flex-shrink: 0;
    margin-left: auto;
    box-shadow: 0 0 0 2.5px #fff, 0 0 0 4px #dcfce7;
  }

  .ds-logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    background: #FEE2E2;
    color: #991B1B;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: background 0.15s;
    font-family: inherit;
  }

  .ds-logout-btn:hover {
    background: #FECACA;
  }

  @media (max-width: 768px) {
    .ds-sidebar {
      display: none;
    }
  }
`;

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  home: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  ),
  calendar: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
    </svg>
  ),
  users: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  video: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  ),
  rx: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
  ),
  settings: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  profile: (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
};

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, badge, badgeWarning, onClick }) {
  return (
    <button className={`ds-nav-item${active ? " active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span className={`ds-nav-badge${badgeWarning ? " warning" : ""}`}>{badge}</span>
      )}
    </button>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function DoctorSidebar({ activeNav, doctorProfile, pendingCount = 0, confirmedCount = 0 }) {
  const navigate = useNavigate();

  const doctorName = doctorProfile
    ? `Dr. ${doctorProfile.firstName || ""} ${doctorProfile.lastName || ""}`.trim()
    : "Dr. —";
  const doctorInitials = doctorProfile?.firstName && doctorProfile?.lastName
    ? `${doctorProfile.firstName[0]}${doctorProfile.lastName[0]}`
    : "DR";
  const doctorSpec = doctorProfile?.specialization || "Doctor";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <style>{SIDEBAR_CSS}</style>
      <aside className="ds-sidebar">
        {/* Brand */}
        <div className="ds-brand">
          <div className="ds-logo">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v14M3 10h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="ds-app-name">MediConnect</div>
            <div className="ds-app-role">Doctor Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="ds-nav">
          {/* Overview */}
          <div>
            <div className="ds-section-label">Overview</div>
            <div className="ds-nav-items">
              <NavItem
                icon={Icons.home}
                label="Dashboard"
                active={activeNav === "dashboard"}
                onClick={() => navigate("/doctor/dashboard")}
              />
              <NavItem
                icon={Icons.calendar}
                label="Appointments"
                active={activeNav === "appointments"}
                badge={pendingCount}
                badgeWarning={true}
                onClick={() => navigate("/doctor/appointments")}
              />
              <NavItem
                icon={Icons.users}
                label="My Patients"
                active={activeNav === "patients"}
                onClick={() => navigate("/doctor/patients")}
              />
            </div>
          </div>

          {/* Consultations */}
          <div>
            <div className="ds-section-label">Consultations</div>
            <div className="ds-nav-items">
              <NavItem
                icon={Icons.video}
                label="Video Sessions"
                active={activeNav === "video"}
                badge={confirmedCount}
                onClick={() => window.open("/video?role=doctor", "_blank")}
              />
              <NavItem
                icon={Icons.rx}
                label="Prescriptions"
                active={activeNav === "prescriptions"}
                onClick={() => navigate("/doctor/prescriptions")}
              />
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="ds-section-label">Account</div>
            <div className="ds-nav-items">
              <NavItem
                icon={Icons.profile}
                label="My Profile"
                active={activeNav === "profile"}
                onClick={() => navigate("/doctor/profile")}
              />
              <NavItem
                icon={Icons.settings}
                label="Settings"
                active={activeNav === "settings"}
                onClick={() => navigate("/doctor/settings")}
              />
            </div>
          </div>
        </nav>

        {/* Bottom user card + logout */}
        <div className="ds-bottom">
          <div className="ds-user-card" onClick={() => navigate("/doctor/profile")}>
            <div className="ds-avatar">{doctorInitials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="ds-user-name">{doctorName}</div>
              <div className="ds-user-spec">{doctorSpec}</div>
            </div>
            <div className="ds-online-dot" />
          </div>
          <button className="ds-logout-btn" onClick={handleLogout}>
            {Icons.logout}
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}