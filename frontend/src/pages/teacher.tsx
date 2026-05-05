import { useState } from "react";
import "../teacher.css";
import { api } from "../services/api";

type Props = {
    onSuccess: () => void;
    onBack: () => void;
};

const Teacher = ({ onSuccess, onBack }: Props) => {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!password) {
            setError("Введите пароль");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await api.teacherLogin(password);
            
            if (response.success) {
                onSuccess();
            } else {
                setError(response.message || "Неверный пароль");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Ошибка соединения с сервером");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <>
            <div className="teacher-overlay"></div>
            <div className="teacher-modal">
                <h1 className="teacher-title">Вход</h1>
                
                <input
                    className="teacher-input"
                    type="password"
                    placeholder="Пароль..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                />
                
                {error && (
                    <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}
                
                <button 
                    className="teacher-btn" 
                    onClick={handleLogin} 
                    disabled={loading}
                >
                    {loading ? "Проверка..." : "Продолжить"}
                </button>
                
                <button 
                    className="teacher-btn-back" 
                    onClick={onBack}
                    disabled={loading}
                >
                    ← Назад
                </button>
            </div>
        </>
    );
};

export default Teacher;