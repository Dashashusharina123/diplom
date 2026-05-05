import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import api from '../../services/api';
import './TraineePages.css';

interface Result {
    id: number;
    session_title: string;
    score: string;
    time: string;
    created_at: string;
}

interface MyResultsProps {
    onNavigate: (page: string) => void;
}

export default function MyResults({ onNavigate }: MyResultsProps) {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        Promise.all([
            api.auth.me(),
            api.results.getAll(),
        ]).then(([userData, allResults]) => {
            setUser(userData);
            const myResults = allResults.filter((r: any) => r.trainee_name === userData.name);
            setResults(myResults);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await api.auth.logout();
        onNavigate('traineeLogin');
    };

    const getScoreClass = (score: string) => {
        if (score.includes('/')) {
            const parts = score.split('/');
            const percent = parseInt(parts[0]) / parseInt(parts[1]);
            return percent >= 0.7 ? 'score-good' : 'score-bad';
        }
        return 'score-bad';
    };

    return (
        <Layout title="Мои результаты" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : results.length === 0 ? (
                <div className="empty-state">📭 У вас пока нет пройденных тестов</div>
            ) : (
                <table className="trainee-table">
                    <thead>
                        <tr>
                            <th>Тест</th>
                            <th>Результат</th>
                            <th>Время</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result) => (
                            <tr key={result.id}>
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
        </Layout>
    );
}