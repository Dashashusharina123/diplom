import "./modeSt.css";
type Props = {
  setPage: (page: string) => void;
};
const Mode = ({ setPage }: Props) => {
  return (
    <div>
      <div className="overlay"></div>
      <div className="modal">
        <h1>Пользователь</h1>
        <button className="btn learn" onClick={() => setPage("teacher")}> Учитель </button>
        <button className="btn test" onClick={() => setPage("student")}> Ученик </button>
      </div>
    </div>
  );
};

export default Mode;