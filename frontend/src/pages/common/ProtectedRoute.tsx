import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    role: string;
    onUnauthorized: () => void;
}

export default function ProtectedRoute({ children, role, onUnauthorized }: ProtectedRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (role === 'teacher') {
                    // Проверка учителя через сессию
                    const response = await fetch('http://localhost:8000/api/auth/teacher/check', {
                        credentials: 'include'
                    });
                    const data = await response.json();
                    if (data.authenticated) {
                        setIsAuthenticated(true);
                    } else {
                        onUnauthorized();
                    }
                } else {
                    // Проверка ученика через токен
                    if (token) {
                        const response = await fetch('http://localhost:8000/api/me', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            setIsAuthenticated(true);
                        } else {
                            localStorage.removeItem('token');
                            onUnauthorized();
                        }
                    } else {
                        onUnauthorized();
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                onUnauthorized();
            }
        };
        
        checkAuth();
    }, [role, onUnauthorized]);

    if (isAuthenticated === null) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f0f2f5'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <div style={{ color: '#666' }}>Загрузка...</div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}