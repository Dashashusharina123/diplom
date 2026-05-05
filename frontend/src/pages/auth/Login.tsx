import { useState } from 'react';
import './Auth.css';

interface LoginProps {
    onSuccess: (id: number, name: string, email: string) => void;
    onBack: () => void;
    onRegister: () => void;
}

export default function Login({ onSuccess, onBack, onRegister }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            console.log('Ответ сервера:', data); // ← для отладки
            
            if (response.ok && data.token) {
                // Сохраняем токен
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userRole', data.user.role);
                
                // Перенаправление в зависимости от роли
                if (data.user.role === 'teacher') {
                    window.location.href = '/teacher/dashboard';
                } else {
                    // Успешный вход - вызываем onSuccess
                    onSuccess(data.user.id, data.user.name, data.user.email);
                }
            } else {
                setError(data.message || 'Неверный email или пароль');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="auth-overlay"></div>
            <div className="auth-modal">
                <h1>Вход для учеников</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="auth-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        className="auth-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        required
                    />
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <div className="auth-register-link">
                    Нет аккаунта?{' '}
                    <button onClick={onRegister}>Зарегистрироваться</button>
                </div>
                <button className="auth-btn auth-btn-back" onClick={onBack}>
                    Назад
                </button>
            </div>
        </>
    );
}