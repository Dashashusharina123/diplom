import '../App.css';

interface MenuProps {
    onNavigate?: (page: string) => void;
}

export default function Menu({ onNavigate }: MenuProps) {
    return (
        <>
            <div className="app-overlay"></div>
            <div className="app-modal">
                <h1 className="app-title">Обучение ЖД</h1>
                <button 
                    className="app-btn app-btn-teacher"
                    onClick={() => onNavigate && onNavigate('teacherLogin')}
                >
                    Учитель
                </button>
                <button 
                    className="app-btn app-btn-student"
                    onClick={() => onNavigate && onNavigate('traineeLogin')}
                >
                    Ученик
                </button>
            </div>
        </>
    );
}