import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface DashboardProps {
    onNavigate: (page: string) => void;
}

export default function TeacherDashboard({ onNavigate }: DashboardProps) {
    const [stats, setStats] = useState({ traineesCount: 0, tasksCount: 0, resultsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const traineesRes = await fetch('http://localhost:8000/api/trainees');
                const tasksRes = await fetch('http://localhost:8000/api/tasks');
                const resultsRes = await fetch('http://localhost:8000/api/results');
                
                const trainees = await traineesRes.json();
                const tasks = await tasksRes.json();
                const results = await resultsRes.json();
                
                setStats({
                    traineesCount: trainees.length,
                    tasksCount: tasks.length,
                    resultsCount: results.length,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
    }, []);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/api/auth/teacher/logout', {
            method: 'POST',
            credentials: 'include'
        });
        onNavigate('teacherLogin');
    };

    if (loading) {
        return (
            <Layout 
                title="Панель учителя" 
                role="teacher" 
                onLogout={handleLogout}
                onNavigate={onNavigate}
            >
                <div className="loading">Загрузка...</div>
            </Layout>
        );
    }

    return (
        <Layout 
            title="Панель учителя" 
            role="teacher" 
            onLogout={handleLogout}
            onNavigate={onNavigate}
        >
            <div className="teacher-stats">
                <div className="teacher-stat-card" onClick={() => onNavigate('teacherTrainees')}>
                    <div className="teacher-stat-info">
                        <p>Ученики</p>
                        <h2>{stats.traineesCount}</h2>
                    </div>
                    <div className="teacher-stat-icon">👥</div>
                </div>

                <div className="teacher-stat-card" onClick={() => onNavigate('teacherTasks')}>
                    <div className="teacher-stat-info">
                        <p>Задачи</p>
                        <h2>{stats.tasksCount}</h2>
                    </div>
                    <div className="teacher-stat-icon">📝</div>
                </div>

                <div className="teacher-stat-card" onClick={() => onNavigate('teacherResults')}>
                    <div className="teacher-stat-info">
                        <p>Результаты</p>
                        <h2>{stats.resultsCount}</h2>
                    </div>
                    <div className="teacher-stat-icon">📈</div>
                </div>
            </div>
        </Layout>
    );
}