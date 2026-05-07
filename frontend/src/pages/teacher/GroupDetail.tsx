import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface Trainee {
    id: number;
    fio: string;
    email: string;
    group_id?: number;
    created_at: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    is_visible: boolean;
    created_at: string;
}

interface GroupDetailProps {
    onNavigate: (page: string) => void;
    groupId: string;
}

export default function GroupDetail({ onNavigate, groupId }: GroupDetailProps) {
    const [group, setGroup] = useState<{ id: number; name: string } | null>(null);
    const [trainees, setTrainees] = useState<Trainee[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [allGroups, setAllGroups] = useState<{ id: number; name: string }[]>([]);
    const [editingTrainee, setEditingTrainee] = useState<number | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'students' | 'tasks'>('students');

    useEffect(() => {
        loadData();
    }, [groupId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const groupsRes = await fetch('http://localhost:8000/api/groups', {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const groupsData = await groupsRes.json();
            
            const currentGroup = groupsData.find((g: any) => g.id === parseInt(groupId));
            setGroup(currentGroup || null);
            setAllGroups(groupsData);
            
            const traineesRes = await fetch('http://localhost:8000/api/trainees', {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const traineesData = await traineesRes.json();
            
            let traineesArray = [];
            if (traineesData.trainees) {
                traineesArray = traineesData.trainees;
            } else if (Array.isArray(traineesData)) {
                traineesArray = traineesData;
            }
            
            const groupTrainees = traineesArray.filter((t: any) => t.group_id === parseInt(groupId));
            setTrainees(groupTrainees);
            
            const tasksRes = await fetch('http://localhost:8000/api/tasks', {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const tasksData = await tasksRes.json();
            setAllTasks(tasksData);
            
            const groupTasksRes = await fetch(`http://localhost:8000/api/groups/${groupId}/tasks`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' }
            });
            const groupTasksData = await groupTasksRes.json();
            setTasks(groupTasksData);
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            setMessage({ type: 'error', text: 'Ошибка загрузки данных' });
        } finally {
            setLoading(false);
        }
    };

    const assignTask = async (taskId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/groups/${groupId}/assign-task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ task_id: taskId })
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Задача назначена группе' });
                loadData();
                setTimeout(() => setMessage(null), 3000);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Ошибка назначения' });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage({ type: 'error', text: 'Ошибка назначения задачи' });
        }
    };

    const removeTask = async (taskId: number) => {
        if (!confirm('Удалить задачу из группы?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/groups/${groupId}/remove-task`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ task_id: taskId })
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Задача удалена из группы' });
                loadData();
                setTimeout(() => setMessage(null), 3000);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Ошибка удаления' });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage({ type: 'error', text: 'Ошибка удаления задачи' });
        }
    };

    const removeFromGroup = async (traineeId: number) => {
        if (!confirm('Удалить ученика из группы?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/trainees/${traineeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ group_id: null })
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Ученик удалён из группы' });
                loadData();
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage({ type: 'error', text: 'Ошибка удаления' });
        }
    };

    const changeGroup = async (traineeId: number, newGroupId: number) => {
        if (!newGroupId) {
            setMessage({ type: 'error', text: 'Выберите группу' });
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/trainees/${traineeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ group_id: newGroupId })
            });
            
            if (response.ok) {
                setMessage({ type: 'success', text: 'Группа изменена' });
                setEditingTrainee(null);
                loadData();
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage({ type: 'error', text: 'Ошибка изменения группы' });
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:8000/api/auth/teacher/logout', {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.clear();
        onNavigate('teacherLogin');
    };

    if (loading) {
        return (
            <Layout title="Группа" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="loading">Загрузка...</div>
            </Layout>
        );
    }

    return (
        <Layout title={`Группа: ${group?.name || 'Группа'}`} role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="teacher-card">
                <div className="teacher-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('students')}
                        >
                            Ученики ({trainees.length})
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tasks')}
                        >
                            Задачи ({tasks.length})
                        </button>
                    </div>
                    <button className="back-btn" onClick={() => onNavigate('teacherGroups')}>
                        Назад к группам
                    </button>
                </div>

                {message && (
                    <div className={`task-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'students' ? (
                    <>
                        {trainees.length === 0 ? (
                            <div className="empty-state">В этой группе нет учеников</div>
                        ) : (
                            <table className="teacher-table">
                                <thead>
                                    <tr>
                                        <th>ФИО</th>
                                        <th>Email</th>
                                        <th>Дата регистрации</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trainees.map((trainee) => (
                                        <tr key={trainee.id}>
                                            <td>{trainee.fio}</td>
                                            <td>{trainee.email}</td>
                                            <td>{new Date(trainee.created_at).toLocaleDateString()}</td>
                                            <td>
                                                {editingTrainee === trainee.id ? (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        <select
                                                            value={selectedGroupId}
                                                            onChange={(e) => setSelectedGroupId(e.target.value)}
                                                            style={{ padding: '5px', borderRadius: '5px' }}
                                                        >
                                                            <option value="">Выбрать группу</option>
                                                            {allGroups.filter(g => g.id !== parseInt(groupId)).map(g => (
                                                                <option key={g.id} value={g.id}>{g.name}</option>
                                                            ))}
                                                        </select>
                                                        <button 
                                                            className="save-btn"
                                                            onClick={() => changeGroup(trainee.id, parseInt(selectedGroupId))}
                                                        >
                                                            Сохранить
                                                        </button>
                                                        <button 
                                                            className="cancel-btn"
                                                            onClick={() => setEditingTrainee(null)}
                                                        >
                                                            Отмена
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        <button 
                                                            className="edit-btn"
                                                            onClick={() => {
                                                                setEditingTrainee(trainee.id);
                                                                setSelectedGroupId('');
                                                            }}
                                                        >
                                                            Перевести в другую группу
                                                        </button>
                                                        <button 
                                                            className="delete-btn"
                                                            onClick={() => removeFromGroup(trainee.id)}
                                                        >
                                                            Удалить из группы
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                ) : (
                    <div style={{ padding: '20px' }}>
                        <div className="assigned-tasks">
                            <h3>Назначенные задачи</h3>
                            {tasks.length === 0 ? (
                                <div className="empty-state">Нет назначенных задач</div>
                            ) : (
                                <div className="tasks-list">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="task-item" style={{ justifyContent: 'space-between' }}>
                                            <div>
                                                <strong>{task.title}</strong>
                                                {task.description && <p className="task-desc">{task.description}</p>}
                                            </div>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => removeTask(task.id)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="available-tasks" style={{ marginTop: '30px' }}>
                            <h3>Доступные задачи</h3>
                            {allTasks.filter(t => !tasks.some(gt => gt.id === t.id)).length === 0 ? (
                                <div className="empty-state">Нет доступных задач</div>
                            ) : (
                                <div className="tasks-list">
                                    {allTasks.filter(t => !tasks.some(gt => gt.id === t.id)).map((task) => (
                                        <div key={task.id} className="task-item" style={{ justifyContent: 'space-between' }}>
                                            <div>
                                                <strong>{task.title}</strong>
                                                {task.description && <p className="task-desc">{task.description}</p>}
                                            </div>
                                            <button 
                                                className="save-btn"
                                                onClick={() => assignTask(task.id)}
                                            >
                                                Назначить
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}