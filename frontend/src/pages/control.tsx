import "../controlSt.css";
type Props = {
  onBack: () => void;
};
const Control = ({ onBack }: Props) => {
  return (
    <div className="control-container">
      <div className="control-header">Настройки</div>
      <button className="control-btn-back" onClick={onBack}>
        ← Назад
      </button>
      <div className="control-grid">
        <div className="control-section-title">Управление</div>
        <div className="control-section-help">Помощь</div>

        <div className="control-cell">Вперед</div>
        <div className="control-cell control-cell-key">W</div>

        <div className="control-cell">Назад</div>
        <div className="control-cell control-cell-key">A</div>

        <div className="control-cell">Влево</div>
        <div className="control-cell control-cell-key">S</div>

        <div className="control-cell">Вправо</div>
        <div className="control-cell control-cell-key">D</div>

        <div className="control-cell">Взаимодействие</div>
        <div className="control-cell control-cell-key">E / ПКМ</div>

        <div className="control-cell">Справка</div>
        <div className="control-cell control-cell-key">Q</div>

        <div className="control-cell">Управление</div>
        <div className="control-cell control-cell-key">F1</div>

        <div className="control-cell">Телефон</div>
        <div className="control-cell control-cell-key">F</div>

        <div className="control-cell">
          Чувствительность мыши
          <input type="range" min="0" max="100" defaultValue="80" />
        </div>
        <div className="control-cell control-cell-value">80%</div>
      </div>
    </div>
  );
};
export default Control;