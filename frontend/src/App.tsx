import { useState } from "react";
import "./App.css";

import Teacher from "./pages/teacher";
import Student from "./pages/student";
import Results from "./pages/results";
import Control from "./pages/control";
import Choice from "./pages/choice";
import StudentAuth from "./pages/studentAuth";
import Learn from "./pages/learn";
import ManageTasks from "./pages/manageTasks";
import DocumentFill from "./pages/documentFill"; // Добавьте импорт
import { api } from "./services/api";

function App() {
  const [mode, setMode] = useState<
    | "menu"
    | "choice"
    | "studentAuth"
    | "teacherAuth"
    | "student"
    | "results"
    | "control"
    | "learn"
    | "manageTasks"
    | "test"
    | "documentFill" // Добавьте documentFill
  >("menu");

  const [traineeName, setTraineeName] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [traineeId, setTraineeId] = useState<number | null>(null);
  const [currentResultId, setCurrentResultId] = useState<number | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [testScore, setTestScore] = useState(""); // Добавьте состояние для баллов

  const renderContent = () => {
    switch (mode) {
      case "menu":
        return (
          <>
            <div className="app-overlay"></div>
            <div className="app-modal">
              <h1 className="app-title">Пользователь</h1>
              <button
                className="app-btn app-btn-teacher"
                onClick={() => setMode("teacherAuth")}
              >
                Учитель
              </button>
              <button
                className="app-btn app-btn-student"
                onClick={() => setMode("student")}
              >
                Ученик
              </button>
            </div>
          </>
        );

      case "teacherAuth":
        return (
          <Teacher
            onSuccess={() => setMode("results")}
            onBack={() => setMode("menu")}
          />
        );

      case "student":
        return (
          <Student
            onStart={() => setMode("choice")}
            onSettings={() => setMode("control")}
            onHelp={() => alert("Справка")}
            onExit={() => setMode("menu")}
          />
        );

      case "choice":
        return (
          <Choice
            onLearn={() => setMode("learn")}
            onTest={() => setMode("studentAuth")}
            onBack={() => setMode("student")}
          />
        );

      case "learn":
        return <Learn onBack={() => setMode("choice")} />;

      case "studentAuth":
        return (
          <StudentAuth
            onContinue={async (name, session) => {
              setTraineeName(name);
              setSessionTitle(session);
              
              try {
                // Сохраняем ученика
                const traineeResult = await api.saveTrainee(name, session);
                const newTraineeId = traineeResult.data?.id;
                setTraineeId(newTraineeId);
                
                // Получаем или создаем задание
                const tasks = await api.getTasks();
                let task = tasks.find(t => t.title === session);
                if (!task) {
                  task = await api.createTask({ title: session, description: session });
                }
                setCurrentTaskId(task.id);
                
                setMode("test");
              } catch (error) {
                console.error("Ошибка:", error);
                alert("Ошибка при сохранении");
                setMode("student");
              }
            }}
            onBack={() => setMode("choice")}
          />
        );

      case "test":
        return (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '15px', 
              padding: '30px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h2>Тестирование</h2>
              <p><strong>Ученик:</strong> {traineeName}</p>
              <p><strong>Сессия:</strong> {sessionTitle}</p>
              
              {/* Простые тестовые вопросы */}
              <div className="test-questions" style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>1. Что означает красный сигнал светофора на железной дороге?</strong></p>
                  <label><input type="radio" name="q1" value="0" /> Движение разрешено</label><br/>
                  <label><input type="radio" name="q1" value="1" /> Движение запрещено</label><br/>
                  <label><input type="radio" name="q1" value="0" /> Снижение скорости</label>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>2. Какой документ оформляется при повреждении вагона?</strong></p>
                  <label><input type="radio" name="q2" value="0" /> Транспортная накладная</label><br/>
                  <label><input type="radio" name="q2" value="1" /> Акт общей формы ГУ-23</label><br/>
                  <label><input type="radio" name="q2" value="0" /> Путевой лист</label>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>3. Что такое перегон?</strong></p>
                  <label><input type="radio" name="q3" value="0" /> Путь между станциями</label><br/>
                  <label><input type="radio" name="q3" value="1" /> Участок пути между двумя станциями</label><br/>
                  <label><input type="radio" name="q3" value="0" /> Место стоянки поезда</label>
                </div>
              </div>
              
              <button 
                onClick={async () => {
                  // Подсчет баллов
                  const q1 = document.querySelector('input[name="q1"]:checked') as HTMLInputElement;
                  const q2 = document.querySelector('input[name="q2"]:checked') as HTMLInputElement;
                  const q3 = document.querySelector('input[name="q3"]:checked') as HTMLInputElement;
                  
                  let correct = 0;
                  if (q1 && q1.value === "1") correct++;
                  if (q2 && q2.value === "1") correct++;
                  if (q3 && q3.value === "1") correct++;
                  
                  const score = `${correct}/${3}`;
                  const time = new Date().toLocaleTimeString();
                  
                  try {
                    // Сохраняем результат
                    const result = await api.saveResult({
                      trainee_name: traineeName,
                      session_title: sessionTitle,
                      score: score,
                      time: time
                    });
                    
                    setCurrentResultId(result.id);
                    setTestScore(score);
                    setMode("documentFill");
                  } catch (error) {
                    console.error("Ошибка сохранения:", error);
                    alert("Ошибка при сохранении результата");
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                Завершить тест и оформить акт
              </button>
              <button 
                onClick={() => setMode("studentAuth")}
                style={{
                  padding: '10px 20px',
                  background: '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginTop: '20px',
                  marginLeft: '10px'
                }}
              >
                ← Назад
              </button>
            </div>
          </div>
        );

      case "documentFill":
        return (
          <DocumentFill
            traineeName={traineeName}
            sessionTitle={sessionTitle}
            score={testScore}
            resultId={currentResultId!}
            traineeId={traineeId!}
            taskId={currentTaskId!}
            onBack={() => setMode("test")}
            onComplete={() => {
              alert("Документы успешно сохранены!");
              setMode("student");
            }}
          />
        );

      case "control":
        return <Control onBack={() => setMode("student")} />;

      case "results":
        return (
          <div>
            <Results onBack={() => setMode("menu")} />
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              display: 'flex',
              gap: '10px',
              zIndex: 1000
            }}>
              <button 
                onClick={() => setMode("manageTasks")}
                style={{
                  padding: '12px 24px',
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                Управление заданиями
              </button>
            </div>
          </div>
        );

      case "manageTasks":
        return <ManageTasks onBack={() => setMode("results")} />;

      default:
        return null;
    }
  };

  return <main className="app-main">{renderContent()}</main>;
}

export default App;