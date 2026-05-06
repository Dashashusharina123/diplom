import React, { useEffect, useState, useRef } from 'react';
import Layout from '../common/Layout';
import './TeacherPages.css';

interface Result {
    id: number;
    trainee_name: string;
    session_title: string;
    score: string;
    time: string;
    teacher_comment?: string;
    created_at: string;
}

interface Document {
    id: number;
    result_id: number;
    data: string;
    train: string;
    vagon: string;
    station_from: string;
    station_to: string;
    chief: string;
    conductor: string;
    seat: string;
    linen_issued: string;
    passenger: string;
    type?: string;
}

interface ResultsViewProps {
    onNavigate: (page: string) => void;
}

export default function ResultsView({ onNavigate }: ResultsViewProps) {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [showDocModal, setShowDocModal] = useState(false);
    
    // Состояния для редактирования комментария
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [savingComments, setSavingComments] = useState<Set<number>>(new Set());
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchResults();
    }, []);

    useEffect(() => {
        // Автофокус на textarea при начале редактирования
        if (editingCommentId !== null && textareaRef.current) {
            textareaRef.current.focus();
            // Устанавливаем курсор в конец текста
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
        }
    }, [editingCommentId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/results', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Results:', data);
            setResults(data);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка загрузки результатов');
        } finally {
            setLoading(false);
        }
    };

    const fetchDocument = async (resultId: number, resultName: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/documents/ly23/${resultId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success && data.data) {
                setSelectedDoc({ ...data.data, type: 'ЛУ-23' });
                setShowDocModal(true);
            } else {
                alert(`Акт ЛУ-23 для "${resultName}" не найден`);
            }
        } catch (error) {
            console.error('Ошибка загрузки документа:', error);
            alert('Ошибка при загрузке документа');
        }
    };

    // Начать редактирование комментария
    const startEditing = (result: Result) => {
        // Очищаем предыдущий таймаут если есть
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        setEditingCommentId(result.id);
        setEditingCommentText(result.teacher_comment || '');
    };

    // Сохранить комментарий
    const saveComment = async (resultId: number, commentText: string) => {
        // Проверяем, что комментарий изменился
        const originalResult = results.find(r => r.id === resultId);
        if (originalResult && originalResult.teacher_comment === commentText) {
            setEditingCommentId(null);
            return;
        }
        
        if (savingComments.has(resultId)) return;
        
        setSavingComments(prev => new Set(prev).add(resultId));
        
        try {
            const response = await fetch(`http://localhost:8000/api/results/${resultId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ comment: commentText })
            });
            
            if (response.ok) {
                // Обновить локальный список
                setResults(prev => prev.map(r => 
                    r.id === resultId 
                        ? { ...r, teacher_comment: commentText }
                        : r
                ));
            } else {
                const errorData = await response.json();
                console.error('Ошибка сохранения:', errorData);
                alert('Ошибка при сохранении комментария');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Ошибка соединения с сервером');
        } finally {
            setSavingComments(prev => {
                const newSet = new Set(prev);
                newSet.delete(resultId);
                return newSet;
            });
            setEditingCommentId(null);
        }
    };

    // Обработчик потери фокуса
    const handleBlur = (resultId: number) => {
        // Используем таймаут, чтобы не конфликтовать с кликом на другие элементы
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            if (editingCommentId === resultId) {
                saveComment(resultId, editingCommentText);
            }
        }, 200);
    };

    // Обработчик нажатия Enter (сохранить и выйти)
    const handleKeyDown = (e: React.KeyboardEvent, resultId: number) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveComment(resultId, editingCommentText);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            setEditingCommentId(null);
            setEditingCommentText('');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8000/api/auth/teacher/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
        localStorage.clear();
        onNavigate('teacherLogin');
    };

    const filteredResults = results.filter(r =>
        r.trainee_name?.toLowerCase().includes(filter.toLowerCase()) ||
        r.session_title?.toLowerCase().includes(filter.toLowerCase())
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
        <Layout title="Результаты тестов" role="teacher" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="teacher-card">
                <div className="teacher-card-header">
                    <input
                        type="text"
                        placeholder="Поиск по ученику или сессии..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                
                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : filteredResults.length === 0 ? (
                    <div className="empty-state">Нет результатов</div>
                ) : (
                    <div className="table-responsive">
                        <table className="teacher-table">
  <thead>
    <tr>
      <th>Ученик</th>
      <th>Сессия</th>
      <th>Результат</th>
      <th>Время</th>
      <th>Дата</th>
      <th>Документ</th>
      <th style={{ width: '30%' }}>Комментарий</th>
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

        <td>
          <button
            className="view-docs-btn"
            onClick={() => fetchDocument(result.id, result.trainee_name)}
          >
            Смотреть акт
          </button>
        </td>

        <td>
          {editingCommentId === result.id ? (
            <div className="comment-edit-container">
              <textarea
                ref={textareaRef}
                className="comment-textarea-inline"
                value={editingCommentText}
                onChange={(e) => setEditingCommentText(e.target.value)}
                onBlur={() => handleBlur(result.id)}
                onKeyDown={(e) => handleKeyDown(e, result.id)}
                placeholder="Введите комментарий..."
                rows={2}
                disabled={savingComments.has(result.id)}
                style={{ width: '100%' }}
              />

              {savingComments.has(result.id) && (
                <div className="comment-saving"></div>
              )}
            </div>
          ) : (
            <div
              className="comment-display"
              onClick={() => startEditing(result)}
              style={{ cursor: 'pointer' }}
            >
              {result.teacher_comment ? (
                <div className="comment-text">
                  {result.teacher_comment}
                </div>
              ) : (
                <div className="comment-placeholder">
                  Добавьте комментарий
                </div>
              )}
            </div>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
                    </div>
                )}
            </div>

            {/* Модальное окно просмотра документа */}
            {showDocModal && selectedDoc && (
                <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
                    <div className="modal-content-doc" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Акт ЛУ-23</h3>
                            <button className="modal-close" onClick={() => setShowDocModal(false)}>✖</button>
                        </div>
                        <div className="modal-body-doc">
                            <div className="doc-preview">
                                <div className="doc-title-preview">АКТ о браке в работе (ЛУ-23)</div>
                                
                                <div className="doc-row">
                                    <span className="doc-label">Дата:</span>
                                    <span className="doc-value">{selectedDoc.data || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Номер поезда:</span>
                                    <span className="doc-value">{selectedDoc.train || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Номер вагона:</span>
                                    <span className="doc-value">{selectedDoc.vagon || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Станция отправления:</span>
                                    <span className="doc-value">{selectedDoc.station_from || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Станция назначения:</span>
                                    <span className="doc-value">{selectedDoc.station_to || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Начальник поезда:</span>
                                    <span className="doc-value">{selectedDoc.chief || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Проводник:</span>
                                    <span className="doc-value">{selectedDoc.conductor || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Место:</span>
                                    <span className="doc-value">{selectedDoc.seat || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Выдано белья:</span>
                                    <span className="doc-value">{selectedDoc.linen_issued || '________'}</span>
                                </div>
                                <div className="doc-row">
                                    <span className="doc-label">Пассажир:</span>
                                    <span className="doc-value">{selectedDoc.passenger || '________'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="print-btn" onClick={() => window.print()}>Печать</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}