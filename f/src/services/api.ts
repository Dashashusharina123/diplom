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

// Документ ГУ-23
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

// Документ ЛУ-23
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
            ...options,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    }

    // Tasks
    async getTasks(): Promise<Task[]> {
        return this.request<Task[]>('/tasks');
    }

    async createTask(data: { title: string; description: string }): Promise<Task> {
        return this.request<Task>('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(id: number, data: { title: string; description: string }): Promise<Task> {
        return this.request<Task>(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(id: number): Promise<void> {
        return this.request<void>(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }

    // Results
    async getResults(search?: string): Promise<Result[]> {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        return this.request<Result[]>(`/results${query}`);
    }

    async saveResult(data: CreateResultData): Promise<Result> {
        return this.request<Result>('/results', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Trainees
    async saveTrainee(fio: string, title: string): Promise<any> {
        return this.request<any>('/trainees', {
            method: 'POST',
            body: JSON.stringify({ fio, title }),
        });
    }

    // Teacher login
    async teacherLogin(password: string): Promise<{ success: boolean; message: string }> {
        return this.request<{ success: boolean; message: string }>('/teacher/login', {
            method: 'POST',
            body: JSON.stringify({ password }),
        });
    }

    // Document GY-23
    async saveDocumentGY(data: Partial<DocumentGY> & { result_id: number; trainee_id: number; task_id: number }): Promise<{ success: boolean; data: DocumentGY }> {
        return this.request<{ success: boolean; data: DocumentGY }>('/documents/gu23', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDocumentGY(resultId: number): Promise<{ success: boolean; data: DocumentGY }> {
        return this.request<{ success: boolean; data: DocumentGY }>(`/documents/gu23/${resultId}`);
    }

    // Document LY-23
    async saveDocumentLY(data: Partial<DocumentLY> & { result_id: number; trainee_id: number; task_id: number }): Promise<{ success: boolean; data: DocumentLY }> {
        return this.request<{ success: boolean; data: DocumentLY }>('/documents/ly23', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getDocumentLY(resultId: number): Promise<{ success: boolean; data: DocumentLY }> {
        return this.request<{ success: boolean; data: DocumentLY }>(`/documents/ly23/${resultId}`);
    }

    // Get all documents by trainee
    async getDocumentsByTrainee(traineeId: number): Promise<{ success: boolean; data: { gu23: DocumentGY[]; ly23: DocumentLY[] } }> {
        return this.request<{ success: boolean; data: { gu23: DocumentGY[]; ly23: DocumentLY[] } }>(`/documents/trainee/${traineeId}`);
    }
}

export const api = new ApiClient();