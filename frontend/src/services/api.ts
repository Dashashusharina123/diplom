// frontend/src/services/api.ts

const API_BASE_URL = 'http://localhost:8000/api';

export interface Task {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Result {
    id: number;
    name: string;
    session: string;
    time: string;
    score: string;
    doc: string;
    trainee_id?: number;
    task_id?: number;
}

export interface DocumentGY {
    id: number;
    result_id: number;
    trainee_id: number;
    task_id: number;
    data: string;
    train: string;
    vagon: string;
    station_from: string;
    station_to: string;
    station_code: string;
    section: string;
    participants: string;
    carrier: string;
    shipment: string;
    cargo_receive: string;
    cargo: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentLY {
    id: number;
    result_id: number;
    trainee_id: number;
    task_id: number;
    data: string;
    train: string;
    vagon: string;
    station_from: string;
    station_to: string;
    chief: string;
    conductor: string;
    seat: string;
    linen_issued: string;
    passenger: string;
    created_at: string;
    updated_at: string;
}

export interface CreateResultData {
    trainee_name: string;
    session_title: string;
    score: string;
    time: string;
}

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'API request failed' }));
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    }

    // ========== АУТЕНТИФИКАЦИЯ ==========
    async teacherLogin(password: string): Promise<{ success: boolean; message: string; role?: string }> {
        return this.request('/auth/teacher/login', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
    }

    async teacherLogout(): Promise<{ success: boolean; message: string }> {
        return this.request('/auth/teacher/logout', { method: 'POST' });
    }

    async checkTeacherAuth(): Promise<{ authenticated: boolean; role?: string }> {
        return this.request('/auth/teacher/check');
    }

    // ✅ ДОБАВЛЯЕМ saveTrainee
    async saveTrainee(fio: string, title: string): Promise<any> {
        return this.request('/auth/trainee/register', {
            method: 'POST',
            body: JSON.stringify({ fio, title }),
        });
    }

    // ✅ ДОБАВЛЯЕМ registerTrainee (алиас для saveTrainee)
    async registerTrainee(fio: string, title: string): Promise<any> {
        return this.saveTrainee(fio, title);
    }

    // ========== ЗАДАНИЯ ==========
    async getTasks(): Promise<Task[]> {
        return this.request('/tasks');
    }

    async createTask(data: { title: string; description: string }): Promise<Task> {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(id: number, data: { title: string; description: string }): Promise<Task> {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(id: number): Promise<void> {
        return this.request(`/tasks/${id}`, { method: 'DELETE' });
    }

    // ========== РЕЗУЛЬТАТЫ ==========
    async getResults(search?: string): Promise<Result[]> {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request(`/results${query}`);
    }

    async saveResult(data: CreateResultData): Promise<Result> {
        return this.request('/results', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ========== УЧЕНИКИ (старый эндпоинт, оставляем для совместимости) ==========
    async getTrainees(): Promise<any[]> {
        return this.request('/trainees');
    }

    async getTrainee(id: number): Promise<any> {
        return this.request(`/trainees/${id}`);
    }

    async createTrainee(data: { fio: string; title?: string }): Promise<any> {
        return this.request('/trainees', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ========== ДОКУМЕНТЫ ==========
    async saveDocumentGY(data: Partial<DocumentGY> & { result_id: number; trainee_id: number; task_id: number }): Promise<{ success: boolean; data: DocumentGY }> {
        return this.request('/documents/gu23', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDocumentGY(resultId: number): Promise<{ success: boolean; data: DocumentGY }> {
        return this.request(`/documents/gu23/${resultId}`);
    }

    async saveDocumentLY(data: Partial<DocumentLY> & { result_id: number; trainee_id: number; task_id: number }): Promise<{ success: boolean; data: DocumentLY }> {
        return this.request('/documents/ly23', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDocumentLY(resultId: number): Promise<{ success: boolean; data: DocumentLY }> {
        return this.request(`/documents/ly23/${resultId}`);
    }

    async getDocumentsByTrainee(traineeId: number): Promise<{ success: boolean; data: { gu23: DocumentGY[]; ly23: DocumentLY[] } }> {
        return this.request(`/documents/trainee/${traineeId}`);
    }
}

export const api = new ApiClient();