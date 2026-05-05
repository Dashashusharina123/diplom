import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface Task {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

interface TasksManagerProps {
    onNavigate: (page: string) => void;
}

export default function TasksManager({ onNavigate }: TasksManagerProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [form, setForm] = useState({ title: '', description: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadTasks = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/tasks');
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/api/auth/teacher/logout', {
            method: 'POST',
            credentials: 'include'
        });
        onNavigate('teacherLogin');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        if (!form.title.trim()) {
            setMessage({ type: 'error', text: 'Введите название задачи' });
            return;
        }
        
        try {
            const url = editingTask 
                ? `http://localhost:8000/api/tasks/${editingTask.id}`
                : 'http://localhost:8000/api/tasks';
            const method = editingTask ? 'PUT' : 'POST';
            
            const token = localStorage.getItem('token');
            
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(form)
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: editingTask ? 'Задача обновлена!' : 'Задача создана!' });
                setShowForm(false);
                setEditingTask(null);
                setForm({ title: '', description: '' });
                loadTasks();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Ошибка при сохранении' });
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            setMessage({ type: 'error', text: 'Ошибка подключения' });
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Удалить задачу?')) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`http://localhost:8000/api/tasks/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });
                loadTasks();
            } catch (error) {
                console.error('Ошибка удаления:', error);
            }
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setForm({ title: task.title, description: task.description || '' });
        setShowForm(true);
    };

    return (
        <Layout title="Управление задачами" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => {
                        setEditingTask(null);
                        setForm({ title: '', description: '' });
                        setShowForm(!showForm);
                        setMessage(null);
                    }}
                    className="teacher-add-btn"
                >
                    {showForm ? '− Отменить' : '+ Новая задача'}
                </button>
            </div>

            {message && (
                <div className={`task-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className="task-form-container">
                    <h3>{editingTask ? 'Редактировать задачу' : 'Новая задача'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Название задачи *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Введите название"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Описание</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Введите описание задачи"
                                rows={3}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {editingTask ? 'Сохранить' : 'Создать'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingTask(null);
                                    setForm({ title: '', description: '' });
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">📭 Нет задач. Создайте первую!</div>
            ) : (
                <div className="tasks-list">
                    {tasks.map((task) => (
                        <div key={task.id} className="task-item">
                            <div className="task-content">
                                <div className="task-title">{task.title}</div>
                                {task.description && <div className="task-desc">{task.description}</div>}
                                <div className="task-date">{new Date(task.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="task-actions">
                                <button onClick={() => handleEdit(task)} className="edit-btn" title="Редактировать">✏️</button>
                                <button onClick={() => handleDelete(task.id)} className="delete-btn" title="Удалить">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}