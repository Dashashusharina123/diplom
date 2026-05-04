import "../stud.css";

type Props = {
  onStart: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onExit: () => void;
};

const Student = ({ onStart, onSettings, onHelp, onExit }: Props) => {
  return (
    <>
      <div className="student-overlay"></div>
      <div className="student-modal">
        <h1 className="student-title">Режим ученика</h1>
        <button className="student-btn" onClick={onStart}> Начать </button>
        <button className="student-btn" onClick={onSettings}> Настройки </button>
        <button className="student-btn" onClick={onHelp}> Справка </button>
        <button className="student-btn student-btn-exit" onClick={onExit}> ← Выход </button>
      </div>
    </>
  );
};

export default Student;