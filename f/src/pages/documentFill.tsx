// frontend/src/pages/DocumentFill.tsx

import { useState, useRef } from "react";
import { api } from "../services/api";
import "../doc.css";

type Props = {
  traineeName: string;
  sessionTitle: string;
  score: string;
  resultId: number;
  traineeId: number;
  taskId: number;
  onBack: () => void;
  onComplete: () => void;
};

const DocumentFill = ({ 
  traineeName, 
  sessionTitle, 
  score, 
  resultId, 
  traineeId, 
  taskId,
  onBack, 
  onComplete 
}: Props) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  // Поля должны точно соответствовать таблице document__g_y_s
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],  // дата
    train: "",           // поезд
    vagon: "",           // вагон
    station_from: "",    // станция отправления
    station_to: "",      // станция назначения
    station_code: "",    // код станции
    section: "",         // перегон
    participants: traineeName,  // участники
    carrier: "",         // перевозчик
    shipment: "",        // отправка
    cargo_receive: new Date().toISOString().split('T')[0], // дата приема груза
    cargo: sessionTitle, // груз
    description: `Тест по теме "${sessionTitle}" пройден с результатом ${score}.` // описание
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    try {
      const saveData = {
        result_id: resultId,
        trainee_id: traineeId,
        task_id: taskId,
        ...formData
      };
      
      console.log("Отправляемые данные:", saveData);
      
      const response = await api.saveDocumentGY(saveData);
      console.log("Ответ сервера:", response);
      
      setSaved(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      console.error("Ошибка:", err);
      setError(err.message || "Ошибка при сохранении документа");
      alert(`Ошибка: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Форма ГУ-23</title>
              <style>
                body { font-family: 'Times New Roman', serif; margin: 40px; }
                .paper-document { max-width: 800px; margin: 0 auto; }
                .paper-form-number { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
                .paper-title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 30px; }
                .paper-line { margin-bottom: 12px; display: flex; flex-wrap: wrap; align-items: baseline; }
                .paper-label { margin-right: 5px; }
                .paper-value { display: inline-block; }
                .paper-section { margin: 20px 0; }
                .paper-section-title { font-weight: bold; margin-bottom: 8px; }
                .paper-textarea { border: 1px solid #000; padding: 15px; min-height: 100px; margin-top: 8px; white-space: pre-wrap; }
                .paper-signatures { margin-top: 40px; display: flex; justify-content: space-between; }
                .paper-signature { border-bottom: 1px solid #000; min-width: 200px; display: inline-block; height: 25px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const renderDocument = () => (
    <div className="paper-document" ref={printRef}>
      <div className="paper-form-number">Форма ГУ–23</div>
      <div className="paper-title">АКТ ОБЩЕЙ ФОРМЫ</div>
      
      <div className="paper-line">
        <span className="paper-label">Станция, код</span>
        <span className="paper-value">{formData.station_from} {formData.station_code ? `(${formData.station_code})` : ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Поезд №</span>
        <span className="paper-value">{formData.train}</span>
        <span className="paper-label">на перегоне</span>
        <span className="paper-value">{formData.section}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">«</span>
        <span className="paper-value">{formData.data}</span>
        <span className="paper-label">» г.</span>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Настоящий акт составлен в присутствии следующих лиц:</div>
        <div className="paper-value">{formData.participants}</div>
        <div className="paper-note" style={{ fontSize: '11px', marginLeft: '20px' }}>(фамилия, должность)</div>
      </div>

      <div className="paper-line">
        <span className="paper-label">Перевозчик</span>
        <span className="paper-value">{formData.carrier}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Станция отправления</span>
        <span className="paper-value">{formData.station_from}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Станция назначения</span>
        <span className="paper-value">{formData.station_to}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Отправка №</span>
        <span className="paper-value">{formData.shipment}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">дата приема груза к перевозке</span>
        <span className="paper-value">«{formData.cargo_receive}» г.</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Вагон, контейнер №</span>
        <span className="paper-value">{formData.vagon}</span>
        <span className="paper-label">наименование груза</span>
        <span className="paper-value">{formData.cargo}</span>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Описание обстоятельств, вызвавших составление акта:</div>
        <div className="paper-textarea">{formData.description}</div>
      </div>

      <div className="paper-signatures">
        <div className="paper-signature-line">
          <span className="paper-label">Подписи:</span>
          <span className="paper-signature"></span>
          <span className="paper-signature"></span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="document-fill-container">
      <div className="document-fill-header">
        <button className="back-btn" onClick={onBack}>← Назад к тесту</button>
        <h1>Оформление акта ГУ-23</h1>
      </div>

      {error && (
        <div className="error-message" style={{ background: '#ff4444', color: 'white', padding: '10px', margin: '10px', borderRadius: '8px' }}>
          Ошибка: {error}
        </div>
      )}

      <div className="document-fill-content">
        <div className="fill-form-panel">
          <h3>Заполнение документа</h3>
          
          <div className="form-section">
            <h4>Основные данные</h4>
            
            <div className="form-group">
              <label>Станция, код</label>
              <input 
                type="text" 
                placeholder="Наименование станции" 
                value={formData.station_from} 
                onChange={(e) => handleChange("station_from", e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Код станции" 
                value={formData.station_code} 
                onChange={(e) => handleChange("station_code", e.target.value)} 
                style={{ marginTop: '8px' }} 
              />
            </div>

            <div className="form-group">
              <label>Поезд №</label>
              <input 
                type="text" 
                placeholder="Номер поезда" 
                value={formData.train} 
                onChange={(e) => handleChange("train", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Перегон</label>
              <input 
                type="text" 
                placeholder="Название перегона" 
                value={formData.section} 
                onChange={(e) => handleChange("section", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Дата составления</label>
              <input 
                type="date" 
                value={formData.data} 
                onChange={(e) => handleChange("data", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Составитель (ФИО, должность)</label>
              <input 
                type="text" 
                value={formData.participants} 
                onChange={(e) => handleChange("participants", e.target.value)} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Данные о перевозке</h4>
            
            <div className="form-group">
              <label>Перевозчик</label>
              <input 
                type="text" 
                placeholder="Наименование перевозчика" 
                value={formData.carrier} 
                onChange={(e) => handleChange("carrier", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Станция отправления</label>
              <input 
                type="text" 
                placeholder="Станция отправления" 
                value={formData.station_from} 
                onChange={(e) => handleChange("station_from", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Станция назначения</label>
              <input 
                type="text" 
                placeholder="Станция назначения" 
                value={formData.station_to} 
                onChange={(e) => handleChange("station_to", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Отправка №</label>
              <input 
                type="text" 
                placeholder="Номер отправки" 
                value={formData.shipment} 
                onChange={(e) => handleChange("shipment", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Дата приема груза</label>
              <input 
                type="date" 
                value={formData.cargo_receive} 
                onChange={(e) => handleChange("cargo_receive", e.target.value)} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Данные о грузе</h4>
            
            <div className="form-group">
              <label>Номер вагона/контейнера</label>
              <input 
                type="text" 
                placeholder="Номер вагона" 
                value={formData.vagon} 
                onChange={(e) => handleChange("vagon", e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Наименование груза</label>
              <input 
                type="text" 
                value={formData.cargo} 
                onChange={(e) => handleChange("cargo", e.target.value)} 
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Обстоятельства</h4>
            
            <div className="form-group">
              <label>Описание обстоятельств</label>
              <textarea 
                rows={5} 
                value={formData.description} 
                onChange={(e) => handleChange("description", e.target.value)} 
                placeholder="Подробное описание ситуации..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="print-btn" onClick={handlePrint}>🖨️ Распечатать</button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "💾 Сохранить документ"}
            </button>
          </div>
        </div>

        <div className="document-preview-panel">
          <h3>Предпросмотр документа</h3>
          <div className="preview-scroll">
            {renderDocument()}
          </div>
        </div>
      </div>

      {saved && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Документ ГУ-23 сохранен!</h2>
            <p>Акт привязан к результату теста.</p>
            <button onClick={onComplete}>Завершить</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentFill;