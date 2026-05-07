import { ReactNode, useEffect, useState } from "react";
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
  // Сразу берём из localStorage, чтобы не было задержки
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('userName') || (role === "teacher" ? "Преподаватель" : "Студент");
  });
  const [loaded, setLoaded] = useState<boolean>(() => {
    return !!localStorage.getItem('userName');
  });

  useEffect(() => {
    // Загружаем только если ещё нет данных в localStorage
    if (!loaded) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const displayName = data.fio || data.name || data.email?.split('@')[0] || (role === "teacher" ? "Преподаватель" : "Студент");
        
        setUserName(displayName);
        localStorage.setItem('userName', displayName);
        setLoaded(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const handleNavigate = (page: string) => {
    if (role === "teacher") {
      switch (page) {
        case "dashboard":
          onNavigate("teacherDashboard");
          break;

          case "groups":
            onNavigate("teacherGroups");
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

  const goToProfile = () => {
    // Переход в профиль только для ученика
    if (role === "trainee") {
      onNavigate("traineeProfile");
    }
  };

  const menuItems = role === "teacher" 
    ? [
        { id: "dashboard", label: "Панель" },
        { id: "groups", label: "Группы" },
        { id: "trainees", label: "Ученики" },
        { id: "tasks", label: "Задачи" },
        { id: "results", label: "Результаты" },
      ]
    : [
        { id: "dashboard", label: "Задачи" },
        { id: "results", label: "Мои результаты" },
      ];

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
          
          {/* Кнопка профиля ТОЛЬКО для ученика */}
          {role === "trainee" && (
            <button className="user-badge" onClick={goToProfile}>
              <span className="user-name">
                Ученик: {userName}
              </span>
            </button>
          )}
          
          {/* Для учителя просто отображаем имя без кнопки */}
          {role === "teacher" && (
            <div className="user-badge-static">
              <span className="user-name">
                Учитель
              </span>
            </div>
          )}
        </header>
        <div className="layout-content-fullscreen">
          {children}
        </div>
      </main>
    </div>
  );
}