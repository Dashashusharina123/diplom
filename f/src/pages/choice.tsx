import "../choice.css";
type Props = {
  onLearn: () => void;
  onTest: () => void;
  onBack: () => void;
};
const Choice = ({ onLearn, onTest, onBack }: Props) => {
  return (
    <>
      <div className="choice-overlay"></div>
      <div className="choice-modal">
        <h1 className="choice-title">Режим</h1>
        <button className="choice-btn choice-btn-learn" onClick={onLearn}>
          Обучение
        </button>
        <button className="choice-btn choice-btn-test" onClick={onTest}>
          Тестирование
        </button>
        <button className="choice-btn choice-btn-back" onClick={onBack}>
          ← Назад
        </button>
      </div>
    </>
  );
};
export default Choice;