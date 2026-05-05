import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TraineePages.css';

interface Task {
    id: number;
    title: string;
    description: string;
}

interface TasksListProps {
    onNavigate: (page: string) => void;
}

export default function TasksList({ onNavigate }: TasksListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/tasks');
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error('Ошибка загрузки задач:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:8000/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        onNavigate('traineeLogin');
    };

    const startTest = (task: Task) => {
        alert(`Начало теста: ${task.title}\nФункция в разработке`);
    };

    return (
        <Layout 
            title="Мои задачи" 
            role="trainee" 
            onLogout={handleLogout}
            onNavigate={onNavigate}
        >
            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">📭 Нет доступных задач</div>
            ) : (
                <div className="trainee-task-grid">
                    {tasks.map((task) => (
                        <div key={task.id} className="trainee-task-card">
                            <div className="trainee-task-title">{task.title}</div>
                            {task.description && (
                                <div className="trainee-task-desc">{task.description}</div>
                            )}
                            <button className="trainee-task-btn" onClick={() => startTest(task)}>
                                Начать тест →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}