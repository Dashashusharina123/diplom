import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface Trainee {
    id: number;
    fio: string;
    group_name?: string;
    email: string;
    created_at: string;
}

interface TraineesListProps {
    onNavigate: (page: string) => void;
}

export default function TraineesList({ onNavigate }: TraineesListProps) {
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrainees = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/trainees', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }

                const data = await response.json();
                console.log('Ответ сервера:', data);
                
                // Берем массив из поля trainees
                let traineesArray = [];
                if (data.trainees && Array.isArray(data.trainees)) {
                    traineesArray = data.trainees;
                } else if (Array.isArray(data)) {
                    traineesArray = data;
                } else {
                    traineesArray = [];
                }
                
                setTrainees(traineesArray);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
                setError('Не удалось загрузить список учеников');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainees();
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
            <Layout title="Список учеников" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="loading">Загрузка...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Список учеников" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="empty-state" style={{ color: 'red', textAlign: 'center', padding: '40px' }}>
                    {error}
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Список учеников" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="teacher-card">
                <div className="teacher-card-header">
                    <h3 style={{ margin: 0, color: '#fff' }}>Всего учеников: {trainees.length}</h3>
                </div>

                {trainees.length === 0 ? (
                    <div className="empty-state">Нет зарегистрированных учеников</div>
                ) : (
                    <table className="teacher-table">
                        <thead>
                            <tr>
                                <th>ФИО</th>
                                <th>Группа</th>
                                <th>Email</th>
                                <th>Дата регистрации</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainees.map((trainee) => (
                                <tr key={trainee.id}>
                                    <td>{trainee.fio}</td>
                                    <td>{trainee.group_name || '—'}</td>
                                    <td>{trainee.email || '—'}</td>
                                    <td>{new Date(trainee.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
}