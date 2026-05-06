import { useState } from 'react';
import './App.css';

// Auth pages
import TeacherLogin from './pages/auth/TeacherLogin';
import TraineeRegister from './pages/auth/TraineeRegister';
import Login from './pages/auth/Login';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TraineesList from './pages/teacher/TraineesList';
import TasksManager from './pages/teacher/TasksManager';
import ResultsView from './pages/teacher/ResultsView';

// Trainee pages
import TraineeDashboard from './pages/trainee/Dashboard';
import TasksList from './pages/trainee/TasksList';
import MyResults from './pages/trainee/MyResults';
import DocumentFill from './pages/trainee/DocumentFill';

// Menu
import Menu from './pages/Menu';

type Page = 
    | 'menu'
    | 'teacherLogin'
    | 'traineeLogin'
    | 'traineeRegister'
    | 'teacherDashboard'
    | 'teacherTrainees'
    | 'teacherTasks'
    | 'teacherResults'
    | 'traineeDashboard'
    | 'traineeTasks'
    | 'traineeResults'
    | 'documentFill';

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('menu');

    const navigate = (page: string) => {
        console.log('Переход на страницу:', page);
        setCurrentPage(page as Page);
        window.scrollTo(0, 0);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('menu');
    };

    const handleTeacherLogin = () => {
        navigate('teacherDashboard');
    };

    const handleTraineeLogin = (id: number, name: string, email: string) => {
        console.log('Ученик вошёл:', { id, name, email });
        localStorage.setItem('userId', id.toString());
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('traineeId', id.toString());
        localStorage.setItem('traineeName', name);
        navigate('traineeTasks');
    };

    const handleTraineeRegisterSuccess = () => {
        navigate('traineeLogin');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'menu':
                return <Menu onNavigate={navigate} />;
            
            case 'teacherLogin':
                return <TeacherLogin onSuccess={handleTeacherLogin} onBack={() => navigate('menu')} />;
            
            case 'traineeLogin':
                return <Login 
                    onSuccess={handleTraineeLogin} 
                    onBack={() => navigate('menu')} 
                    onRegister={() => navigate('traineeRegister')} 
                />;
            
            case 'traineeRegister':
                return <TraineeRegister 
                    onBack={() => navigate('traineeLogin')} 
                    onSuccess={handleTraineeRegisterSuccess} 
                />;
            
            case 'teacherDashboard':
                return <TeacherDashboard onNavigate={navigate} />;
            
            case 'teacherTrainees':
                return <TraineesList onNavigate={navigate} />;
            
            case 'teacherTasks':
                return <TasksManager onNavigate={navigate} />;
            
            case 'teacherResults':
                return <ResultsView onNavigate={navigate} />;
            
            case 'traineeDashboard':
                return <TraineeDashboard onNavigate={navigate} />;
            
            case 'traineeTasks':
                return <TasksList onNavigate={navigate} />;
            
            case 'traineeResults':
                return <MyResults onNavigate={navigate} />;
            
            case 'documentFill':
                return <DocumentFill onNavigate={navigate} />;
            
            default:
                return <Menu onNavigate={navigate} />;
        }
    };

    return <div className="app-main">{renderPage()}</div>;
}

export default App;