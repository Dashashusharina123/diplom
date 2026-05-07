import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface DashboardProps {
    onNavigate: (page: string) => void;
}

interface TopStudent {
    id: number;
    name: string;
    score: number;
    percentage: number;
}

export default function TeacherDashboard({ onNavigate }: DashboardProps) {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTests: 0,
        averageScore: 0,
        passedCount: 0,
        failedCount: 0,
        passRate: 0
    });
    const [subjectStats, setSubjectStats] = useState<{ name: string; value: number }[]>([]);
    const [topStudent, setTopStudent] = useState<TopStudent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Получаем учеников
                const traineesRes = await fetch('http://localhost:8000/api/trainees', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const trainees = await traineesRes.json();
                
                // Получаем результаты
                const resultsRes = await fetch('http://localhost:8000/api/results', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const results = await resultsRes.json();
                
                console.log('Results:', results); // Для отладки
                
                const totalStudents = trainees.length;
                const totalTests = results.length;
                
                let totalScore = 0;
                let passedCount = 0;
                let failedCount = 0;
                
                const subjectMap: { [key: string]: { total: number; count: number } } = {};
                const studentScores: Map<string, { name: string; totalPercent: number; count: number }> = new Map();
                
                results.forEach((result: any) => {
                    const scoreStr = result.score;
                    console.log('Score string:', scoreStr); // Для отладки
                    
                    if (scoreStr && scoreStr.includes('/')) {
                        const [correct, total] = scoreStr.split('/').map(Number);
                        const percent = (correct / total) * 100;
                        
                        totalScore += percent;
                        if (percent >= 70) {
                            passedCount++;
                        } else {
                            failedCount++;
                        }
                        
                        // Статистика по ученикам
                        const studentName = result.trainee_name || result.name;
                        if (studentName) {
                            const key = studentName;
                            if (!studentScores.has(key)) {
                                studentScores.set(key, { name: studentName, totalPercent: 0, count: 0 });
                            }
                            const student = studentScores.get(key)!;
                            student.totalPercent += percent;
                            student.count++;
                        }
                        
                        const taskTitle = result.session_title || result.task_title || 'Тест';
                        if (!subjectMap[taskTitle]) {
                            subjectMap[taskTitle] = { total: 0, count: 0 };
                        }
                        subjectMap[taskTitle].total += percent;
                        subjectMap[taskTitle].count++;
                    }
                });
                
                const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
                const passRate = results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0;
                
                // Находим лучшего студента
                let bestStudent: TopStudent | null = null;
                studentScores.forEach((student, key) => {
                    const avgPercent = student.totalPercent / student.count;
                    if (!bestStudent || avgPercent > bestStudent.percentage) {
                        bestStudent = {
                            id: 0,
                            name: student.name,
                            score: Math.round(avgPercent),
                            percentage: avgPercent
                        };
                    }
                });
                
                console.log('Best student:', bestStudent); // Для отладки
                setTopStudent(bestStudent);
                
                const subjectStatsData = Object.entries(subjectMap)
                    .map(([name, data]) => ({
                        name: name.length > 20 ? name.substring(0, 17) + '...' : name,
                        value: Math.round(data.total / data.count)
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);
                
                setStats({
                    totalStudents,
                    totalTests,
                    averageScore,
                    passedCount,
                    failedCount,
                    passRate
                });
                setSubjectStats(subjectStatsData);
                setError('');
                
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
                setError('Не удалось загрузить статистику');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/api/auth/teacher/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.clear();
        onNavigate('teacherLogin');
    };

    if (loading) {
        return (
            <Layout title="Панель учителя" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="loading">Загрузка статистики...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Панель учителя" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="error-message">{error}</div>
            </Layout>
        );
    }

    return (
        <Layout title="Панель учителя" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="teacher-dashboard">
                {/* Карточки статистики */}
                <div className="stats-grid">
                    
                    <div className="stat-card" onClick={() => onNavigate('teacherResults')}>
                        <div className="stat-info">
                            <h3>{stats.totalTests}</h3>
                            <p>Пройдено тестов</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.averageScore}%</h3>
                            <p>Средний балл</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-info">
                            <h3>{stats.passRate}%</h3>
                            <p>Успеваемость</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-row">
                    <div className="dashboard-card">
                        <h3>Успеваемость</h3>
                        <div className="pie-container">
                            <div className="pie-chart">
                                <div className="pie-segment" style={{
                                    background: `conic-gradient(
                                        #4caf50 0deg ${stats.passRate * 3.6}deg,
                                        #f44336 ${stats.passRate * 3.6}deg 360deg
                                    )`
                                }}>
                                    <div className="pie-inner">
                                        <span className="pie-percent">{stats.passRate}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pie-legend">
                                <div className="legend-item">
                                    <span className="legend-dot success"></span>
                                    <span>Сдали ({stats.passedCount})</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot danger"></span>
                                    <span>Не сдали ({stats.failedCount})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </div>
        </Layout>
    );
}