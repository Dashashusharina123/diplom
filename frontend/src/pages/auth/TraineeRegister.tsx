import { useState } from 'react';
import './Auth.css';

interface TraineeRegisterProps {
    onBack: () => void;
    onSuccess: () => void;
}

export default function TraineeRegister({ onBack, onSuccess }: TraineeRegisterProps) {
    const [form, setForm] = useState({ fio: '', title: '', email: '', password: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/auth/trainee/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fio: form.fio, 
                    title: form.title,
                    email: form.email,
                    password: form.password 
                })
            });
            const data = await response.json();
            
            if (data.success || data.data) {
                setMessage({
                    type: 'success',
                    text: data.is_new ? '✅ Регистрация успешна!' : 'ℹ️ Ученик уже существует'
                });
                if (data.is_new) {
                    setForm({ fio: '', title: '', email: '', password: '' });
                    setTimeout(() => {
                        onSuccess();
                    }, 1500);
                } else {
                    setTimeout(() => {
                        onSuccess();
                    }, 1500);
                }
            } else {
                setMessage({ type: 'error', text: data.message || 'Ошибка регистрации' });
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
                        type="text"
                        className="auth-input"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Группа / Должность"
                    />
                    <input
                        type="email"
                        className="auth-input"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email *"
                        required
                    />
                    <input
                        type="password"
                        className="auth-input"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Пароль (мин. 6 символов) *"
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