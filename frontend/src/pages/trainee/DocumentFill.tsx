import { useState, useEffect } from 'react';
import Layout from '../common/Layout';
import './DocumentFill.css';

interface DocumentFillProps {
    onNavigate: (page: string) => void;
}

export default function DocumentFill({ onNavigate }: DocumentFillProps) {
    const [testResult, setTestResult] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        data: '',
        train: '',
        vagon: '',
        station_from: '',
        station_to: '',
        chief: '',
        conductor: '',
        seat: '',
        linen_issued: '',
        passenger: ''
    });

    useEffect(() => {
        const result = localStorage.getItem('currentTestResult');
        if (result) {
            const parsed = JSON.parse(result);
            setTestResult(parsed);
            
            const today = new Date().toISOString().split('T')[0];
            setFormData(prev => ({
                ...prev,
                data: today
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        try {
            const currentTime = new Date().toLocaleTimeString();
            const scoreValue = testResult ? `${testResult.score}/${testResult.total}` : '0/0';
            
            let resultId = null;
            const resultResponse = await fetch('http://localhost:8000/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    user_id: userId ? parseInt(userId) : null,
                    task_id: testResult?.tasks?.[0]?.id || null,
                    score: scoreValue,
                    time: currentTime
                })
            });
            
            if (resultResponse.ok) {
                const resultData = await resultResponse.json();
                resultId = resultData.id;
                console.log('Результат создан, ID:', resultId);
            }
            
            const response = await fetch('http://localhost:8000/api/documents/ly23', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    result_id: resultId,
                    data: formData.data,
                    train: formData.train,
                    vagon: formData.vagon,
                    station_from: formData.station_from,
                    station_to: formData.station_to,
                    chief: formData.chief,
                    conductor: formData.conductor,
                    seat: formData.seat,
                    linen_issued: formData.linen_issued,
                    passenger: formData.passenger
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка сохранения');
            }
            
            setShowSuccess(true);
            setTimeout(() => {
                onNavigate('traineeResults');
            }, 2000);
            
        } catch (err: any) {
            console.error('Ошибка сохранения:', err);
            setError(err.message || 'Ошибка при сохранении документа');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch('http://localhost:8000/api/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        localStorage.clear();
        onNavigate('traineeLogin');
    };

    // Функция для предпросмотра документа
    const renderDocumentPreview = () => {
        return (
            <div className="document-preview">
                <div className="doc-form-number">Форма ЛУ-23</div>
                <div className="doc-title">Акт о браке в работе</div>
                
                <div className="doc-row">
                    <span className="doc-label">Дата:</span>
                    <span className="doc-value">{formData.data || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Номер поезда:</span>
                    <span className="doc-value">{formData.train || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Номер вагона:</span>
                    <span className="doc-value">{formData.vagon || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Станция отправления:</span>
                    <span className="doc-value">{formData.station_from || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Станция назначения:</span>
                    <span className="doc-value">{formData.station_to || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Начальник поезда:</span>
                    <span className="doc-value">{formData.chief || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Проводник:</span>
                    <span className="doc-value">{formData.conductor || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Место:</span>
                    <span className="doc-value">{formData.seat || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Выдано белья:</span>
                    <span className="doc-value">{formData.linen_issued || '________'}</span>
                </div>
                <div className="doc-row">
                    <span className="doc-label">Пассажир:</span>
                    <span className="doc-value">{formData.passenger || '________'}</span>
                </div>
                
                <div className="doc-signatures">
                    <div className="doc-signature-line">
                        <span>Начальник поезда: ______________</span>
                        <span>Проводник: ______________</span>
                    </div>
                    <div className="doc-signature-line">
                        <span>Дата: {formData.data || new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (showSuccess) {
        return (
            <Layout title="Успех" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✓</div>
                        <h2>Акт ЛУ-23 успешно сохранён!</h2>
                        <p>Перенаправление к результатам...</p>
                        <button onClick={() => onNavigate('traineeResults')}>Перейти сейчас</button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Оформление акта ЛУ-23" role="trainee" onLogout={handleLogout} onNavigate={onNavigate}>
            <div className="document-fill-container">
                <div className="document-fill-content">
                    {/* Левая часть - форма */}
                    <div className="fill-form-panel">
                        <h3>Заполнение формы ЛУ-23</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Дата *</label>
                                <input type="date" name="data" value={formData.data} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Номер поезда *</label>
                                <input type="text" name="train" value={formData.train} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Номер вагона *</label>
                                <input type="text" name="vagon" value={formData.vagon} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Станция отправления *</label>
                                <input type="text" name="station_from" value={formData.station_from} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Станция назначения *</label>
                                <input type="text" name="station_to" value={formData.station_to} onChange={handleChange} required />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Начальник поезда</label>
                                <input type="text" name="chief" value={formData.chief} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Проводник</label>
                                <input type="text" name="conductor" value={formData.conductor} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Место</label>
                                <input type="text" name="seat" value={formData.seat} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Выдано белья</label>
                                <input type="text" name="linen_issued" value={formData.linen_issued} onChange={handleChange} />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Пассажир</label>
                            <input type="text" name="passenger" value={formData.passenger} onChange={handleChange} />
                        </div>

                        {testResult && (
                            <div className="test-result-info">
                                <p>📊 Результат тестирования: {testResult.score}/{testResult.total} ({testResult.percent}%)</p>
                            </div>
                        )}
                        
                        {error && <div className="error-message">{error}</div>}
                        
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => onNavigate('traineeTasks')}>
                                Отмена
                            </button>
                            <button type="button" className="submit-btn" onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Сохранение...' : 'Сохранить акт'}
                            </button>
                        </div>
                    </div>

                    {/* Правая часть - предпросмотр документа */}
                    <div className="document-preview-panel">
                        <h3>Предпросмотр документа</h3>
                        <div className="preview-scroll">
                            {renderDocumentPreview()}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}