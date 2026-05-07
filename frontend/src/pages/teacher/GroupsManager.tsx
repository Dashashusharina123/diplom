import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface Group {
    id: number;
    name: string;
    users_count?: number;
    created_at: string;
}

interface GroupsManagerProps {
    onNavigate: (page: string) => void;
}

export default function GroupsManager({ onNavigate }: GroupsManagerProps) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/groups', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки групп:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Введите название группы' });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const url = editingGroup 
                ? `http://localhost:8000/api/groups/${editingGroup.id}`
                : 'http://localhost:8000/api/groups';
            const method = editingGroup ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: editingGroup ? 'Группа обновлена!' : 'Группа создана!' });
                setShowForm(false);
                setEditingGroup(null);
                setFormData({ name: '' });
                loadGroups();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Ошибка при сохранении' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка подключения' });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (confirm(`Удалить группу "${name}"?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8000/api/groups/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage({ type: 'success', text: 'Группа удалена' });
                    loadGroups();
                    setTimeout(() => setMessage(null), 3000);
                } else {
                    setMessage({ type: 'error', text: data.error || 'Ошибка удаления' });
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Ошибка подключения' });
            }
        }
    };

    const handleGroupClick = (groupId: number) => {
        onNavigate(`groupDetail/${groupId}`);
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
            <Layout title="Управление группами" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="loading">Загрузка...</div>
            </Layout>
        );
    }

    return (
        <Layout title="Управление группами" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="teacher-card">
                <div className="teacher-card-header">
                    <button
                        onClick={() => {
                            setEditingGroup(null);
                            setFormData({ name: '' });
                            setShowForm(!showForm);
                            setMessage(null);
                        }}
                        className="teacher-add-btn"
                    >
                        {showForm ? '− Отменить' : '+ Новая группа'}
                    </button>
                </div>

                {message && (
                    <div className={`task-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="task-form-container">
                        <h3>{editingGroup ? 'Редактировать группу' : 'Новая группа'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Название группы *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Например: ТП-21"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">
                                    {editingGroup ? 'Сохранить' : 'Создать'}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingGroup(null);
                                        setFormData({ name: '' });
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {groups.length === 0 ? (
                    <div className="empty-state">Нет групп. Создайте первую!</div>
                ) : (
                    <div className="tasks-list">
                        {groups.map((group) => (
                            <div 
                                key={group.id} 
                                className="task-item group-item-clickable"
                                onClick={() => handleGroupClick(group.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="task-content">
                                    <div className="task-title">
                                        {group.name}
                                    </div>
                                </div>
                                <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => {
                                            setEditingGroup(group);
                                            setFormData({ name: group.name });
                                            setShowForm(true);
                                        }} 
                                        className="edit-btn"
                                    >
                                        ред.
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(group.id, group.name)} 
                                        className="delete-btn"
                                    >
                                        удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}