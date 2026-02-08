import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3000';

interface HealthResponse {
    status: string;
    timestamp: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
    try {
        const response = await axios.get<HealthResponse>(
            `${API_BASE_URL}/health`
        );
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};