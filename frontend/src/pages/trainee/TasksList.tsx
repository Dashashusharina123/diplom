import { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import './TraineePages.css';

interface Task {
    id: number;
    title: string;
    description: string;
    created_at: string;
}

interface TasksListProps {
    onNavigate: (page: string) => void;
}

export default function TasksList({ onNavigate }: TasksListProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'learn' | 'test'>('learn');
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Состояние для тестирования
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [testCompleted, setTestCompleted] = useState(false);
    const [testScore, setTestScore] = useState(0);
    const [showResultMessage, setShowResultMessage] = useState(false);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [testTasks, setTestTasks] = useState<Task[]>([]);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [testResults, setTestResults] = useState<any>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
           const response = await fetch('http://localhost:8000/api/tasks/visible');
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:8000/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        onNavigate('traineeLogin');
    };

    // Пагинация для вкладки "Обучение"
    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const paginatedTasks = tasks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Начать тестирование (все задачи в случайном порядке)
    const handleStartTest = () => {
        const shuffled = [...tasks].sort(() => Math.random() - 0.5);
        setTestTasks(shuffled);
        setUserAnswers(new Array(shuffled.length).fill(-1));
        setCurrentTaskIndex(0);
        setSelectedTask(shuffled[0]);
        setSelectedAnswer(null);
        setTestCompleted(false);
        setTestScore(0);
        setShowResultMessage(false);
        setTestResults(null);
    };

    const handleAnswerSelect = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
        const newAnswers = [...userAnswers];
        newAnswers[currentTaskIndex] = answerIndex;
        setUserAnswers(newAnswers);
    };

    const nextTask = () => {
        if (currentTaskIndex < testTasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
            setSelectedTask(testTasks[currentTaskIndex + 1]);
            setSelectedAnswer(userAnswers[currentTaskIndex + 1]);
        } else {
            // Подсчёт результатов
            let correct = 0;
            userAnswers.forEach((answer, idx) => {
                // Временная логика: правильный ответ = 0 (Верно)
                // Позже можно будет привязать к полю в БД
                if (answer === 0) {
                    correct++;
                }
            });
            setTestScore(correct);
            setTestCompleted(true);
            
            // Сохраняем результат для передачи в документ
            const passed = correct / testTasks.length >= 0.7;
            const resultData = {
                date: new Date().toLocaleString(),
                score: correct,
                total: testTasks.length,
                percent: Math.round(correct / testTasks.length * 100),
                passed: passed,
                answers: userAnswers,
                tasks: testTasks.map(t => ({ id: t.id, title: t.title }))
            };
            
            setTestResults(resultData);
            
            // Сохраняем в localStorage
            const existingResults = localStorage.getItem('testResults');
            let results = existingResults ? JSON.parse(existingResults) : [];
            results.push(resultData);
            localStorage.setItem('testResults', JSON.stringify(results));
            
            setShowResultMessage(true);
            
            // Через 2 секунды переходим к заполнению документа
            setTimeout(() => {
                setShowResultMessage(false);
                // Передаём данные на страницу документа
                localStorage.setItem('currentTestResult', JSON.stringify(resultData));
                onNavigate('documentFill');
            }, 2000);
        }
    };

    const prevTask = () => {
        if (currentTaskIndex > 0) {
            setCurrentTaskIndex(currentTaskIndex - 1);
            setSelectedTask(testTasks[currentTaskIndex - 1]);
            setSelectedAnswer(userAnswers[currentTaskIndex - 1]);
        }
    };

    const cancelTest = () => {
        setSelectedTask(null);
        setTestTasks([]);
        setUserAnswers([]);
        setSelectedAnswer(null);
        setTestCompleted(false);
        setShowResultMessage(false);
        setTestResults(null);
    };

    // Вкладка "Обучение"
    const renderLearnTab = () => (
        <div>
            <div className="pagination-controls">
                <label>
                    Показывать по:
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </label>
                <span>Всего материалов: {tasks.length}</span>
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : paginatedTasks.length === 0 ? (
                <div className="empty-state">📭 Нет доступных материалов</div>
            ) : (
                <>
                    <div className="trainee-task-grid">
                        {paginatedTasks.map((task) => (
                            <div key={task.id} className="trainee-task-card">
                                <div className="trainee-task-title">{task.title}</div>
                                {task.description && (
                                    <div className="trainee-task-desc">{task.description}</div>
                                )}
                                <button 
                                    className="trainee-task-btn learn-btn" 
                                    onClick={() => alert(`Изучение материала: ${task.title}\n\n${task.description || 'Теоретический материал'}`)}
                                >
                                    Изучить
                                </button>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                .map((p, idx, arr) => (
                                    <span key={p}>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pagination-dots">...</span>}
                                        <button className={currentPage === p ? 'active' : ''} onClick={() => setCurrentPage(p)}>
                                            {p}
                                        </button>
                                    </span>
                                ))}
                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    // Вкладка "Тестирование"
    const renderTestTab = () => (
        <div>
            {!selectedTask && !testCompleted && testTasks.length === 0 ? (
                <div className="test-start-section">
                    <button className="test-start-btn-large" onClick={handleStartTest}>
                        Начать тестирование
                    </button>

                    <div className="test-tasks-list">
                        <h3>Темы для подготовки:</h3>
                        <div className="trainee-task-grid">
                            {tasks.map((task) => (
                                <div key={task.id} className="trainee-task-card test-task-card">
                                    <div className="trainee-task-title">{task.title}</div>
                                    {task.description && (
                                        <div className="trainee-task-desc">{task.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : selectedTask && !testCompleted ? (
                <div className="test-container">
                    <div className="test-card">
                        <div className="test-header">
                            <h2>Тестирование</h2>
                            <div className="test-progress">
                                Вопрос {currentTaskIndex + 1} из {testTasks.length}
                            </div>
                            <div className="test-progress-bar">
                                <div className="test-progress-fill" style={{ width: `${((currentTaskIndex + 1) / testTasks.length) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="test-question">
                            <h3>{selectedTask.title}</h3>
                            {selectedTask.description && (
                                <div className="test-question-desc">{selectedTask.description}</div>
                            )}
                            <div className="test-options">
                                <label className={`test-option ${selectedAnswer === 0 ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="answer"
                                        checked={selectedAnswer === 0}
                                        onChange={() => handleAnswerSelect(0)}
                                    />
                                    <span>Верно</span>
                                </label>
                                <label className={`test-option ${selectedAnswer === 1 ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="answer"
                                        checked={selectedAnswer === 1}
                                        onChange={() => handleAnswerSelect(1)}
                                    />
                                    <span>Неверно</span>
                                </label>
                            </div>
                        </div>
                        <div className="test-actions">
                            <button onClick={prevTask} disabled={currentTaskIndex === 0}>← Назад</button>
                            <button onClick={nextTask} disabled={selectedAnswer === null}>
                                {currentTaskIndex === testTasks.length - 1 ? 'Завершить' : 'Далее →'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            
            {/* Всплывающее сообщение о результате и перенаправлении */}
            {showResultMessage && (
                <div className="result-toast">
                    <div className={`result-toast-content ${testScore / testTasks.length >= 0.7 ? 'success' : 'fail'}`}>
                        <div className="result-toast-icon">
                            {testScore / testTasks.length >= 0.7 ? '' : ''}
                        </div>
                        <div className="result-toast-text">
                            <h4>{testScore / testTasks.length >= 0.7 ? 'Тест пройден!' : 'Тест завершён'}</h4>
                            <p>Результат: {testScore} / {testTasks.length} ({Math.round(testScore / testTasks.length * 100)}%)</p>
                            <p className="result-toast-note">Перенаправление на заполнение акта ГУ-23...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <Layout
            title="Мои задачи"
            role="trainee"
            onLogout={handleLogout}
            onNavigate={onNavigate}
        >
            <div className="tasks-tabs">
                <button
                    className={`tasks-tab ${activeTab === 'learn' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('learn');
                        cancelTest();
                    }}
                >
                    Обучение
                </button>
                <button
                    className={`tasks-tab ${activeTab === 'test' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('test');
                        cancelTest();
                    }}
                >
                    Тестирование
                </button>
            </div>

            {activeTab === 'learn' ? renderLearnTab() : renderTestTab()}
        </Layout>
    );
}