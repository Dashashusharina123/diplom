import { ReactNode } from "react";
import "./Layout.css";

type Props = {
  children?: ReactNode;
  title?: string;
  role: "teacher" | "trainee";
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
  activePage?: string;
};

export default function Layout({ 
  children, 
  title, 
  role, 
  onLogout, 
  onNavigate = () => {},
  activePage = "dashboard"
}: Props) {
  const handleNavigate = (page: string) => {
    if (role === "teacher") {
      switch (page) {
        case "dashboard":
          onNavigate("teacherDashboard");
          break;
        case "trainees":
          onNavigate("teacherTrainees");
          break;
        case "tasks":
          onNavigate("teacherTasks");
          break;
        case "results":
          onNavigate("teacherResults");
          break;
      }
    } else {
      switch (page) {
        case "dashboard":
          onNavigate("traineeTasks");
          break;
        case "results":
          onNavigate("traineeResults");
          break;
      }
    }
  };

  const menuItems = role === "teacher" 
    ? [
        { id: "dashboard", label: "Панель" },
        { id: "trainees", label: "Ученики" },
        { id: "tasks", label: "Задачи" },
        { id: "results", label: "Результаты" },
      ]
    : [
        { id: "dashboard", label: "Задачи" },
        { id: "results", label: "Мои результаты" },
      ];

  // Если есть children, просто оборачиваем их в layout
  if (children) {
    return (
      <div className="layout-fullscreen">
        <aside className="layout-sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-text">Обучение ЖД</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => handleNavigate(item.id)}
              >
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={onLogout}>
              <span className="logout-text">Выйти</span>
            </button>
          </div>
        </aside>

        <main className="layout-main-fullscreen">
          <header className="layout-header">
            <h1>{title || (role === "teacher" ? "Панель учителя" : "Панель ученика")}</h1>
            <div className="user-badge">
              <span className="user-role">{role === "teacher" ? "Учитель" : "Ученик"}</span>
            </div>
          </header>
          <div className="layout-content-fullscreen">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Если нет children, показываем просто контент без заголовка
  return (
    <div className="layout-fullscreen">
      <aside className="layout-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">Обучение ЖД</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <span className="logout-text">Выйти</span>
          </button>
        </div>
      </aside>

      <main className="layout-main-fullscreen">
        <div className="layout-content-fullscreen">
          {children}
        </div>
      </main>
    </div>
  );
}