import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Users,
  Network,
  CalendarRange,
  BookOpen,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  LogOut,
  Github,
  Trello
} from "lucide-react";
import "./AdminLayout.css";

function AdminLayout() {
  const username = localStorage.getItem("username");
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <div className="logo-icons">
              <Trello className="logo-icon jira-icon" size={24} />
              <Github className="logo-icon github-icon" size={24} />
            </div>
            <div className="logo-text">
              <h2 className="logo-title">Jira & GitHub</h2>
              <span className="logo-subtitle">Tool Support</span>
            </div>
          </div>

          <nav className="nav-menu">
            <Link 
              to="users" 
              className={`nav-item ${location.pathname.includes('users') ? 'active' : ''}`}
            >
              <span className="nav-icon"><Users size={20} /></span>
              <span>Users</span>
            </Link>
            <Link 
              to="groups" 
              className={`nav-item ${location.pathname.includes('groups') ? 'active' : ''}`}
            >
              <span className="nav-icon"><Network size={20} /></span>
              <span>Groups</span>
            </Link>
            <Link 
              to="semester" 
              className={`nav-item ${location.pathname.includes('semester') ? 'active' : ''}`}
            >
              <span className="nav-icon"><CalendarRange size={20} /></span>
              <span>Semester</span>
            </Link>
            <Link 
              to="course" 
              className={`nav-item ${location.pathname.includes('course') ? 'active' : ''}`}
            >
              <span className="nav-icon"><BookOpen size={20} /></span>
              <span>Course</span>
            </Link>
            <Link 
              to="lecturer" 
              className={`nav-item ${location.pathname.includes('lecturer') ? 'active' : ''}`}
            >
              <span className="nav-icon"><Briefcase size={20} /></span>
              <span>Manager Lecturer</span>
            </Link>
            <Link 
              to="student" 
              className={`nav-item ${location.pathname.includes('student') ? 'active' : ''}`}
            >
              <span className="nav-icon"><GraduationCap size={20} /></span>
              <span>Manager Student</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <ShieldCheck size={22} className="user-icon" />
            <span className="username">{username || "Admin"}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
