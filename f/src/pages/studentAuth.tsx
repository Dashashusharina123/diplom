import "../authSt.css";
import { useState } from "react";

type Props = {
  onContinue: (name: string, session: string) => void;
  onBack: () => void;
};

const StudentAuth = ({ onContinue, onBack }: Props) => {
  const [name, setName] = useState("");
  const [session, setSession] = useState("");

  const handleSubmit = () => {
    if (!name || !session) {
      alert("Заполните все поля");
      return;
    }

    onContinue(name, session);
  };

  return (
    <>
      <div className="overlay"></div>

      <div className="modal">
        <h1>Вход</h1>

        <input
          className="input"
          type="text"
          placeholder="ФИО ученика..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          type="text"
          placeholder="Название сессии"
          value={session}
          onChange={(e) => setSession(e.target.value)}
        />

        <button className="btn" onClick={handleSubmit}>
          Продолжить
        </button>

        <button className="btn back" onClick={onBack}>
          ← Назад
        </button>
      </div>
    </>
  );
};

export default StudentAuth;