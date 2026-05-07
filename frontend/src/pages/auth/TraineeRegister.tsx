import { useState, useEffect } from 'react';
import './Auth.css';

interface TraineeRegisterProps {
    onBack: () => void;
    onSuccess: () => void;
}

interface Group {
    id: number;
    name: string;
}

export default function TraineeRegister({ onBack, onSuccess }: TraineeRegisterProps) {
    const [form, setForm] = useState({ fio: '', email: '', password: '', group_id: '' });
    const [groups, setGroups] = useState<Group[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/groups/select');
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error('Ошибка загрузки групп:', error);
            setMessage({ type: 'error', text: 'Ошибка загрузки списка групп' });
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (!form.group_id) {
            setMessage({ type: 'error', text: 'Выберите группу' });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/auth/trainee/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fio: form.fio, 
                    email: form.email,
                    password: form.password,
                    group_id: parseInt(form.group_id)
                })
            });
            const data = await response.json();
            
            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Регистрация успешна!'
                });
                setForm({ fio: '', email: '', password: '', group_id: '' });
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.errors?.email?.[0] || data.error || 'Ошибка регистрации' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ошибка подключения к серверу' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-overlay"></div>
            <div className="auth-modal" style={{ minHeight: '550px' }}>
                <h1>Регистрация ученика</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="auth-input"
                        value={form.fio}
                        onChange={(e) => setForm({ ...form, fio: e.target.value })}
                        placeholder="ФИО *"
                        required
                    />
                    <input
                        type="email"
                        className="auth-input"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email *"
                        required
                    />
                    
                    <select
                        className="auth-input"
                        value={form.group_id}
                        onChange={(e) => setForm({ ...form, group_id: e.target.value })}
                        required
                        disabled={loadingGroups}
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="">{loadingGroups ? 'Загрузка групп...' : 'Выберите группу'}</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                    
                    <input
                        type="password"
                        className="auth-input"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Пароль (мин. 6 символов)"
                        required
                        minLength={6}
                    />
                    
                    {message && (
                        <div className="auth-message" style={{ 
                            color: message.type === 'success' ? '#4caf50' : '#f44336',
                            marginBottom: '10px',
                            fontSize: '14px'
                        }}>
                            {message.text}
                        </div>
                    )}
                    
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <button className="auth-btn auth-btn-back" onClick={onBack}>
                    Назад ко входу
                </button>
            </div>
        </>
    );
}