import { useState, useEffect, useCallback } from "react";
import "../learnSt.css";
import { api, Task } from "../services/api";

type Props = {
  onBack: () => void;
};

const Learn = ({ onBack }: Props) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [customItems, setCustomItems] = useState("10");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      console.log("Загружено заданий:", data.length);
      setTasks(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    loadTasks();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTasks();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadTasks]);

  // Пересчитываем страницы при изменении itemsPerPage
  useEffect(() => {
    setTotalPages(Math.ceil(tasks.length / itemsPerPage));
    setCurrentPage(1);
  }, [itemsPerPage, tasks.length]);

  // Получаем текущие задачи для отображения
  const getCurrentTasks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tasks.slice(startIndex, endIndex);
  };

  // Смена страницы
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Ручной ввод количества задач
  const handleCustomItemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomItems(value);
  };

  // Применение ручного ввода
  const applyCustomItems = () => {
    let num = parseInt(customItems);
    if (isNaN(num) || num < 1) {
      num = 1;
      setCustomItems("1");
    }
    if (num > 1000) {
      num = 1000;
      setCustomItems("1000");
    }
    setItemsPerPage(num);
  };

  // Обработка нажатия Enter в поле ввода
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyCustomItems();
    }
  };

  // Генерация номеров страниц
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const currentTasks = getCurrentTasks();

  return (
    <div className="container">
      <div className="content-wrapper">
        <div className="header-wrapper">
          <button className="back-arrow" onClick={onBack}>
            ←
          </button>
          <div className="header">Список заданий</div>
        </div>

        {/* Панель управления пагинацией */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          padding: '10px',
          borderRadius: '8px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '14px', color: 'white' }}>Показывать задач на странице:</label>
            <input
              type="number"
              value={customItems}
              onChange={handleCustomItemsChange}
              onKeyPress={handleKeyPress}
              min="1"
              max="1000"
              style={{
                padding: '5px 10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '14px',
                width: '80px',
                textAlign: 'center'
              }}
            />
            
            <button onClick={applyCustomItems}
              style={{padding: '5px 12px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px'}}>
              Применить
            </button>
          </div>
          
          <div style={{ fontSize: '14px', color: '#666' }}>
            Всего заданий: {tasks.length}
          </div>
        </div>

        <div className="table-wrapper">
          <div className="table-header">
            <div className="header-num">Номер</div>
            <div className="header-task">Список заданий</div>
          </div>

          <div className="table-scroll">
            <div className="table-body">
              {loading ? (
                <div className="row">
                  <div className="num">...</div>
                  <div className="task">Загрузка...</div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="row">
                  <div className="num">-</div>
                  <div className="task">
                    Нет заданий. Добавьте их через панель учителя.
                  </div>
                </div>
              ) : (
                currentTasks.map((task, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <div className="row" key={task.id}>
                      <div className="num">{globalIndex}</div>
                      <div className="task">{task.title}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {!loading && tasks.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            padding: '10px',
            flexWrap: 'wrap'
          }}>
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  padding: '8px 14px',
                  background: currentPage === page ? 'red' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: currentPage === page ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;