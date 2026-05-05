import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface Result {
    id: number;
    trainee_name: string;
    session_title: string;
    score: string;
    time: string;
    created_at: string;
}

interface ResultsViewProps {
    onNavigate: (page: string) => void;
}

export default function ResultsView({ onNavigate }: ResultsViewProps) {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/results');
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const handleLogout = async () => {
        await fetch('http://localhost:8000/api/auth/teacher/logout', {
            method: 'POST',
            credentials: 'include'
        });
        onNavigate('teacherLogin');
    };

    const filteredResults = results.filter(r =>
        r.trainee_name.toLowerCase().includes(filter.toLowerCase()) ||
        r.session_title.toLowerCase().includes(filter.toLowerCase())
    );

    const getScoreClass = (score: string) => {
        if (score.includes('/')) {
            const parts = score.split('/');
            const percent = parseInt(parts[0]) / parseInt(parts[1]);
            return percent >= 0.7 ? 'score-good' : 'score-bad';
        }
        return 'score-bad';
    };

    return (
        <Layout 
            title="Результаты тестов" 
            role="teacher" 
            onLogout={handleLogout}
            onNavigate={onNavigate}
        >
            <div className="teacher-card">
                <div className="teacher-card-header">
                    <input
                        type="text"
                        placeholder="🔍 Поиск по ученику или сессии..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                
                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : filteredResults.length === 0 ? (
                    <div className="empty-state">📭 Нет результатов</div>
                ) : (
                    <table className="teacher-table">
                        <thead>
                            <tr>
                                <th>Ученик</th>
                                <th>Сессия</th>
                                <th>Результат</th>
                                <th>Время</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((result) => (
                                <tr key={result.id}>
                                    <td>{result.trainee_name}</td>
                                    <td>{result.session_title}</td>
                                    <td>
                                        <span className={`score-badge ${getScoreClass(result.score)}`}>
                                            {result.score}
                                        </span>
                                    </td>
                                    <td>{result.time}</td>
                                    <td>{new Date(result.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
}