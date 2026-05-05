import Layout from '../common/Layout';
import './TraineePages.css';

interface DashboardProps {
    onNavigate: (page: string) => void;
}

export default function TraineeDashboard({ onNavigate }: DashboardProps) {
    const userName = localStorage.getItem('userName') || 'Ученик';
    const userEmail = localStorage.getItem('userEmail') || '';

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch('http://localhost:8000/api/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        localStorage.clear();
        onNavigate('traineeLogin');
    };

    return (
        <Layout title="Панель ученика" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="trainee-user-card">
                <div className="trainee-user-icon">👨‍🎓</div>
                <div className="trainee-user-info">
                    <h2>{userName}</h2>
                    <p>{userEmail}</p>
                </div>
            </div>
            <div className="trainee-stats">
                <div className="trainee-stat-card" onClick={() => onNavigate('traineeTasks')}>
                    <div className="trainee-stat-icon">📝</div>
                    <div className="trainee-stat-number">Задачи</div>
                    <div className="trainee-stat-label">Доступные задания</div>
                </div>
                <div className="trainee-stat-card" onClick={() => onNavigate('traineeResults')}>
                    <div className="trainee-stat-icon">📈</div>
                    <div className="trainee-stat-number">Результаты</div>
                    <div className="trainee-stat-label">Пройденные тесты</div>
                </div>
            </div>
        </Layout>
    );
}