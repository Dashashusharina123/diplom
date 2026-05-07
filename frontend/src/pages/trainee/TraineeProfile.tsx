import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './../teacher/TeacherPages.css';

interface TraineeProfileProps {
    onNavigate: (page: string) => void;
}

interface ProfileData {
    id: number;
    email: string;
    fio: string | null;
    title: string | null;
    role: string;
    group_id?: number;
    group?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface Group {
    id: number;
    name: string;
}

interface UserStats {
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    success_rate: number;
    average_score_percent: number;
    average_score_5: number;
    best_result: string;
    worst_result: string;
}

export default function TraineeProfile({ onNavigate }: TraineeProfileProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const [formData, setFormData] = useState({
        email: '',
        fio: '',
        group_id: ''
    });
    
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        Promise.all([fetchProfile(), fetchGroups(), fetchStats()]);
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/profile', {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Profile data:', data);
                setProfile(data);
                setFormData({
                    email: data.email || '',
                    fio: data.fio || '',
                    group_id: data.group_id ? String(data.group_id) : ''
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/groups/select');
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Ошибка загрузки групп:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const response = await fetch(`http://localhost:8000/api/users/${userId}/stats`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    fio: formData.fio,
                    group_id: formData.group_id ? parseInt(formData.group_id) : null
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: data.message });
                setProfile(prev => prev ? {
                    ...prev,
                    email: data.user.email,
                    fio: data.user.fio,
                    group_id: data.user.group_id,
                    group: groups.find(g => g.id === data.user.group_id)
                } : null);
                localStorage.setItem('userName', data.user.fio || data.user.name);
                setEditing(false);
                setTimeout(() => setMessage(null), 3000);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Ошибка обновления' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка подключения' });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setMessage({ type: 'error', text: 'Пароли не совпадают' });
            return;
        }
        
        if (passwordData.new_password.length < 6) {
            setMessage({ type: 'error', text: 'Пароль должен быть не менее 6 символов' });
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                    new_password_confirmation: passwordData.new_password_confirmation
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                setMessage({ type: 'success', text: 'Пароль успешно изменён' });
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
                setShowPasswordForm(false);
                setTimeout(() => setMessage(null), 3000);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Ошибка смены пароля' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Ошибка подключения' });
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:8000/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.clear();
        onNavigate('traineeLogin');
    };

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return '#4caf50';
        if (score >= 3.5) return '#8bc34a';
        if (score >= 2.5) return '#ffc107';
        return '#f44336';
    };

    const getScoreText = (score: number) => {
        if (score >= 4.5) return 'Отлично';
        if (score >= 3.5) return 'Хорошо';
        if (score >= 2.5) return 'Удовлетворительно';
        return 'Плохо';
    };

    if (loading) {
        return (
            <Layout title="Профиль" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="loading">Загрузка...</div>
            </Layout>
        );
    }

    if (!profile) {
        return (
            <Layout title="Профиль" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="empty-state">Ошибка загрузки профиля</div>
            </Layout>
        );
    }

    return (
        <Layout title="Профиль" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="profile-container-full">
                <div className="profile-card-full">
                    {/* Шапка профиля */}

                    {/* ЛИЧНАЯ ИНФОРМАЦИЯ */}
                    <div className="profile-content-full">
                        {!editing ? (
                            <>
                                <h2 className="section-title-full">Личная информация</h2>
                                <div className="info-grid-full">
                                    <div className="info-row-full">
                                        <div className="info-label-full">Email:</div>
                                        <div className="info-value-full">{profile.email}</div>
                                    </div>
                                    {profile.fio && (
                                        <div className="info-row-full">
                                            <div className="info-label-full">ФИО:</div>
                                            <div className="info-value-full">{profile.fio}</div>
                                        </div>
                                    )}
                                    <div className="info-row-full">
                                        <div className="info-label-full">Группа:</div>
                                        <div className="info-value-full">
                                            {profile.group?.name || 'Не указана'}
                                        </div>
                                    </div>
                                    <div className="info-row-full">
                                        <div className="info-label-full">Дата регистрации:</div>
                                        <div className="info-value-full">
                                            {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="profile-actions-full">
                                    <button className="edit-profile-btn-full" onClick={() => setEditing(true)}>
                                        Редактировать профиль
                                    </button>
                                    <button className="change-password-btn-full" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                                        {showPasswordForm ? 'Отменить' : 'Сменить пароль'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="profile-form-full">
                                <h2 className="section-title-full">Редактирование профиля</h2>
                                
                                <div className="form-group-full">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group-full">
                                    <label>ФИО</label>
                                    <input
                                        type="text"
                                        value={formData.fio}
                                        onChange={(e) => setFormData({ ...formData, fio: e.target.value })}
                                        placeholder="Иванов Иван Иванович"
                                    />
                                </div>
                                
                                <div className="form-group-full">
                                    <label>Группа</label>
                                    <select
                                        className="auth-input"
                                        value={formData.group_id}
                                        onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#333', color: '#fff', border: '1px solid #444' }}
                                    >
                                        <option value="">Выберите группу</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-actions-full">
                                    <button type="submit" className="save-btn-full">Сохранить</button>
                                    <button type="button" className="cancel-btn-full" onClick={() => setEditing(false)}>
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        )}

                        {showPasswordForm && (
                            <form onSubmit={handleUpdatePassword} className="password-form-full">
                                <h2 className="section-title-full">Смена пароля</h2>
                                
                                <div className="form-group-full">
                                    <label>Текущий пароль</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group-full">
                                    <label>Новый пароль</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group-full">
                                    <label>Подтверждение пароля</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="form-actions-full">
                                    <button type="submit" className="save-btn-full">Сменить пароль</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* СТАТИСТИКА */}
                    {stats && stats.total_tests > 0 && (
                        <div className="stats-section-full">
                            <h2 className="stats-title-full">Статистика обучения</h2>
                            
                            <div className="stats-grid-full">
                                <div className="stat-card-full">
                                    <div className="stat-value-full">{stats.total_tests}</div>
                                    <div className="stat-label-full">Всего тестов</div>
                                </div>
                                <div className="stat-card-full success">
                                    <div className="stat-value-full">{stats.passed_tests}</div>
                                    <div className="stat-label-full">Успешно</div>
                                </div>
                                <div className="stat-card-full danger">
                                    <div className="stat-value-full">{stats.failed_tests}</div>
                                    <div className="stat-label-full">Неудачно</div>
                                </div>
                            </div>

                            {/* Средний балл с круговой диаграммой */}
                            <div className="average-score-full">
                                <div 
                                    className="average-score-circle-full"
                                    style={{
                                        background: `conic-gradient(
                                            ${getScoreColor(stats.average_score_5)} 0deg ${(stats.average_score_5 / 5) * 360}deg,
                                            #444 ${(stats.average_score_5 / 5) * 360}deg 360deg
                                        )`
                                    }}
                                >
                                    <div className="average-score-inner-full">
                                        <span className="average-score-value-full">{stats.average_score_5.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="average-score-info-full">
                                    <div 
                                        className="average-score-text-full"
                                        style={{ color: getScoreColor(stats.average_score_5) }}
                                    >
                                        {getScoreText(stats.average_score_5)}
                                    </div>
                                    <div className="average-score-percent-full">
                                        Средний балл: {stats.average_score_percent}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {stats && stats.total_tests === 0 && (
                        <div className="stats-section-full empty-stats-full">
                            <p>Нет пройденных тестов</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}