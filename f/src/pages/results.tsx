import { useState, useEffect, useCallback, useRef } from "react";
import "../resultSt.css";
import { api, Result } from "../services/api";

type Props = {
  onBack: () => void;
};

interface ExtendedResult extends Result {
  gu23_document?: any;
  ly23_document?: any;
}

const Results = ({ onBack }: Props) => {
  const [results, setResults] = useState<ExtendedResult[]>([]);
  const [allResults, setAllResults] = useState<ExtendedResult[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<{ data: any; type: 'gu23' | 'ly23'; studentName: string; sessionTitle: string; score: string } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllResults();
  }, []);

  const loadAllResults = async () => {
    setLoading(true);
    try {
      const data = await api.getResults();
      
      const resultsWithDocs = await Promise.all(
        data.map(async (result) => {
          try {
            const [gu23Doc, ly23Doc] = await Promise.all([
              api.getDocumentGY(result.id).catch(() => ({ success: false, data: null })),
              api.getDocumentLY(result.id).catch(() => ({ success: false, data: null }))
            ]);
            return {
              ...result,
              gu23_document: gu23Doc.success ? gu23Doc.data : null,
              ly23_document: ly23Doc.success ? ly23Doc.data : null
            };
          } catch {
            return { ...result, gu23_document: null, ly23_document: null };
          }
        })
      );
      
      setAllResults(resultsWithDocs);
      setResults(resultsWithDocs);
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = useCallback(() => {
    if (!search.trim()) {
      setResults(allResults);
    } else {
      const filtered = allResults.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setResults(filtered);
    }
  }, [search, allResults]);

  useEffect(() => {
    filterResults();
  }, [filterResults]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const openDocumentModal = (docData: any, type: 'gu23' | 'ly23', studentName: string, sessionTitle: string, score: string) => {
    setSelectedDoc({ data: docData, type, studentName, sessionTitle, score });
  };

  const closeModal = () => {
    setSelectedDoc(null);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${selectedDoc?.type === 'gu23' ? 'Акт ГУ-23' : 'Акт ЛУ-23'}</title>
              <style>
                body { font-family: 'Times New Roman', Times, serif; margin: 40px; }
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
                .doc-subtitle { text-align: center; font-size: 14px; margin-bottom: 20px; color: #555; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  // Рендер документа ГУ-23 (ТОЧНО КАК ПРИ ЗАПОЛНЕНИИ)
  const renderGU23Document = (data: any, studentName: string, sessionTitle: string, score: string) => (
    <div className="paper-document">
      <div className="paper-form-number">Форма ГУ–23</div>
      <div className="paper-title">АКТ ОБЩЕЙ ФОРМЫ</div>
      
      <div className="doc-subtitle">Студент: {studentName} | Сессия: {sessionTitle} | Результат: {score}</div>
      
      <div className="paper-line">
        <span className="paper-label">Станция, код</span>
        <span className="paper-value">{data?.station_from || ""} {data?.station_code ? `(${data.station_code})` : ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Поезд №</span>
        <span className="paper-value">{data?.train || ""}</span>
        <span className="paper-label">на перегоне</span>
        <span className="paper-value">{data?.section || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">«</span>
        <span className="paper-value">{data?.data || ""}</span>
        <span className="paper-label">» г.</span>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Настоящий акт составлен в присутствии следующих лиц:</div>
        <div className="paper-value">{data?.participants || ""}</div>
        <div className="paper-note" style={{ fontSize: '11px', marginLeft: '20px' }}>(фамилия, должность)</div>
      </div>

      <div className="paper-line">
        <span className="paper-label">Перевозчик</span>
        <span className="paper-value">{data?.carrier || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Станция отправления</span>
        <span className="paper-value">{data?.station_from || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Станция назначения</span>
        <span className="paper-value">{data?.station_to || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Отправка №</span>
        <span className="paper-value">{data?.shipment || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">дата приема груза к перевозке</span>
        <span className="paper-value">«{data?.cargo_receive || ""}» г.</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Вагон, контейнер №</span>
        <span className="paper-value">{data?.vagon || ""}</span>
        <span className="paper-label">наименование груза</span>
        <span className="paper-value">{data?.cargo || ""}</span>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Описание обстоятельств, вызвавших составление акта:</div>
        <div className="paper-textarea">{data?.description || ""}</div>
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

  // Рендер документа ЛУ-23 (ТОЧНО КАК ПРИ ЗАПОЛНЕНИИ)
  const renderLY23Document = (data: any, studentName: string, sessionTitle: string, score: string) => (
    <div className="paper-document">
      <div className="paper-form-number">Форма ЛУ–23</div>
      <div className="paper-title">АКТ О ТЕХНИЧЕСКОМ СОСТОЯНИИ</div>
      
      <div className="doc-subtitle">Студент: {studentName} | Сессия: {sessionTitle} | Результат: {score}</div>
      
      <div className="paper-line">
        <span className="paper-label">«</span>
        <span className="paper-value">{data?.data || ""}</span>
        <span className="paper-label">» г.</span>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Акт составлен:</div>
        <div className="paper-value">{data?.passenger || ""}</div>
        <div className="paper-note" style={{ fontSize: '11px', marginLeft: '20px' }}>(должность, фамилия, имя, отчество)</div>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">В составе комиссии:</div>
        <div className="paper-value">{data?.chief || ""}</div>
      </div>

      <div className="paper-line">
        <span className="paper-label">Поезд №</span>
        <span className="paper-value">{data?.train || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Вагон №</span>
        <span className="paper-value">{data?.vagon || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Станция отправления</span>
        <span className="paper-value">{data?.station_from || ""}</span>
      </div>

      <div className="paper-line">
        <span className="paper-label">Станция назначения</span>
        <span className="paper-value">{data?.station_to || ""}</span>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Проводник:</div>
        <div className="paper-value">{data?.conductor || ""}</div>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Место №:</div>
        <div className="paper-value">{data?.seat || ""}</div>
      </div>

      <div className="paper-section">
        <div className="paper-section-title">Постельное белье выдано:</div>
        <div className="paper-value">{data?.linen_issued || ""}</div>
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
    <div className="results-container">
      <div className="results-header-wrapper">
        <button className="results-back-arrow" onClick={onBack}>
          ←
        </button>
        <h1 className="results-header">Результаты</h1>
      </div>
      
      <div className="results-search">
        <input
          type="text"
          placeholder="Поиск по ФИО..."
          value={search}
          onChange={handleSearchChange}
          autoFocus
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ marginLeft: 10, padding: 10, background: '#666', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            ✖ Очистить
          </button>
        )}
      </div>
      
      <div className="results-table-header">
        <div>ФИО ученика</div>
        <div>Название сессии</div>
        <div>Время начала</div>
        <div>Баллы</div>
        <div>Документы</div>
      </div>
      
      <div className="results-table-body">
        {loading ? (
          <div className="results-row">
            <div>Загрузка...</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : results.length === 0 ? (
          <div className="results-row">
            <div>Нет данных</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          results.map((item, index) => (
            <div className="results-row" key={item.id || index}>
              <div>{item.name}</div>
              <div>{item.session}</div>
              <div>{item.time}</div>
              <div>{item.score}</div>
              <div className="results-documents">
                {item.gu23_document && (
                  <button 
                    className="doc-btn gu23-btn"
                    onClick={() => openDocumentModal(item.gu23_document, 'gu23', item.name, item.session, item.score)}
                  >
                    📄 ГУ-23
                  </button>
                )}
                {item.ly23_document && (
                  <button 
                    className="doc-btn ly23-btn"
                    onClick={() => openDocumentModal(item.ly23_document, 'ly23', item.name, item.session, item.score)}
                  >
                    🔧 ЛУ-23
                  </button>
                )}
                {!item.gu23_document && !item.ly23_document && (
                  <span className="no-doc">—</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно для просмотра документа - ТАКОЕ ЖЕ КАК ПРИ ЗАПОЛНЕНИИ */}
      {selectedDoc && (
        <div className="doc-modal-overlay" onClick={closeModal}>
          <div className="doc-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <h2>{selectedDoc.type === 'gu23' ? 'Акт общей формы ГУ-23' : 'Акт о техническом состоянии ЛУ-23'}</h2>
              <button className="doc-modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="doc-modal-body" ref={printRef}>
              {selectedDoc.type === 'gu23' 
                ? renderGU23Document(selectedDoc.data, selectedDoc.studentName, selectedDoc.sessionTitle, selectedDoc.score)
                : renderLY23Document(selectedDoc.data, selectedDoc.studentName, selectedDoc.sessionTitle, selectedDoc.score)
              }
            </div>
            
            <div className="doc-modal-footer">
              <button className="print-btn-modal" onClick={handlePrint}>🖨️ Распечатать</button>
              <button className="close-btn-modal" onClick={closeModal}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;