import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    title: string;
    role: 'teacher' | 'trainee';
    onLogout: () => void;
    onNavigate: (page: string) => void;
}

export default function Layout({ children, title, role, onLogout, onNavigate }: LayoutProps) {
    const tabs = role === 'teacher' 
        ? [
            { id: 'teacherDashboard', label: '📊 Панель' },
            { id: 'teacherTrainees', label: '👥 Ученики' },
            { id: 'teacherTasks', label: '📝 Задачи' },
            { id: 'teacherResults', label: '📈 Результаты' },
        ]
        : [
            { id: 'traineeDashboard', label: '📊 Панель' },
            { id: 'traineeTasks', label: '📝 Задачи' },
            { id: 'traineeResults', label: '📈 Мои результаты' },
        ];

    const getCurrentTab = () => {
        const path = window.location.pathname;
        if (role === 'teacher') {
            if (path.includes('/teacher/dashboard')) return 'teacherDashboard';
            if (path.includes('/teacher/trainees')) return 'teacherTrainees';
            if (path.includes('/teacher/tasks')) return 'teacherTasks';
            if (path.includes('/teacher/results')) return 'teacherResults';
        } else {
            if (path.includes('/trainee/dashboard')) return 'traineeDashboard';
            if (path.includes('/trainee/tasks')) return 'traineeTasks';
            if (path.includes('/trainee/results')) return 'traineeResults';
        }
        return role === 'teacher' ? 'teacherDashboard' : 'traineeDashboard';
    };

    const activeTab = getCurrentTab();

    return (
        <div className={role === 'teacher' ? 'teacher-container' : 'trainee-container'}>
            <header className={role === 'teacher' ? 'teacher-header' : 'trainee-header'}>
                <h1>{title}</h1>
                <button onClick={onLogout}>🚪 Выйти</button>
            </header>
            
            <nav className={role === 'teacher' ? 'teacher-nav' : 'trainee-nav'}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? 'active' : ''}
                        onClick={() => onNavigate(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            
            <div className={role === 'teacher' ? 'teacher-content' : 'trainee-content'}>
                {children}
            </div>
        </div>
    );
}