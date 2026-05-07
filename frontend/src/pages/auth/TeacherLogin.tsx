import { useState } from 'react';
import './Auth.css';

interface TeacherLoginProps {
    onSuccess: () => void;
    onBack: () => void;
}

export default function TeacherLogin({ onSuccess, onBack }: TeacherLoginProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/auth/teacher/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            
            if (data.success) {
                if (data.user) {
                    localStorage.setItem('userId', data.user.id);
                    localStorage.setItem('userName', data.user.fio);
                    localStorage.setItem('userEmail', data.user.email);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('traineeId', data.user.id);
                }
                onSuccess();
            } else {
                setError('Неверный пароль');
            }
        } catch (err) {
            setError('Ошибка подключения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-overlay"></div>
            <div className="auth-modal">
                <h1>Вход учителя</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                        required
                        autoFocus
                    />
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <button className="auth-btn auth-btn-back" onClick={onBack}>
                    ← Назад
                </button>
            </div>
        </>
    );
}