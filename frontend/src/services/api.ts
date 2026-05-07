const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    });

    if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API error');
    }

    return response.json();
}

// ========== API МЕТОДЫ ==========
export const api = {
    // Учитель (сессии)
    teacher: {
        login: (password: string) =>
            request<{ success: boolean; message: string; role: string; teacher_id: number; user: any }>(
                '/auth/teacher/login',
                { method: 'POST', body: JSON.stringify({ password }) }
            ),
        logout: () =>
            request('/auth/teacher/logout', { method: 'POST' }),
        check: () =>
            request<{ authenticated: boolean; role: string | null; teacher_id: number | null }>(
                '/auth/teacher/check'
            ),
    },

    // Ученики (регистрация по ФИО)
    trainee: {
        register: (data: { fio: string; title?: string }) =>
            request<{ success: boolean; message: string; data: any; is_new: boolean }>(
                '/auth/trainee/register',
                { method: 'POST', body: JSON.stringify(data) }
            ),
        getAll: () => request<any[]>('/trainees'),
        getOne: (id: number) => request<any>(`/trainees/${id}`),
    },

    // Sanctum (email + пароль)
    auth: {
        register: (data: { name: string; email: string; password: string }) =>
            request<{ user: any; token: string }>('/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }).then(res => {
                setToken(res.token);
                return res;
            }),
        login: (email: string, password: string) =>
            request<{ user: any; token: string }>('/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }).then(res => {
                setToken(res.token);
                return res;
            }),
        logout: () =>
            request('/logout', { method: 'POST' }).finally(() => {
                removeToken();
            }),
        me: () => request<any>('/me'),
    },

    // Задачи
    tasks: {
        getAll: () => request<any[]>('/tasks'),
        getOne: (id: number) => request<any>(`/tasks/${id}`),
        create: (data: any) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request(`/tasks/${id}`, { method: 'DELETE' }),
    },

    // Результаты
    results: {
        getAll: () => request<any[]>('/results'),
        getOne: (id: number) => request<any>(`/results/${id}`),
        create: (data: any) => request('/results', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: any) => request(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request(`/results/${id}`, { method: 'DELETE' }),
    },

    // Сохранение ученика и результата (для старых страниц)
    saveTrainee: (name: string, session: string) =>
        request<{ data: { id: number } }>('/auth/trainee/register', {
            method: 'POST',
            body: JSON.stringify({ fio: name, title: session })
        }),

    saveResult: (data: { trainee_name: string; session_title: string; score: string; time: string }) =>
        request<{ id: number }>('/results', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    getTasks: () => request<any[]>('/tasks'),

    createTask: (data: { title: string; description: string }) =>
        request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;