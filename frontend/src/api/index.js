import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL
});

export const tournamentApi = {
    getAll: () => api.get('/tournaments'),
    getById: (id) => api.get(`/tournaments/${id}`),
    create: (data) => api.post('/tournaments', data),
    addTeam: (id, data) => api.post(`/tournaments/${id}/teams`, data),
    generateFixtures: (id) => api.post(`/tournaments/${id}/generate-fixtures`),
    getStandings: (id) => api.get(`/tournaments/${id}/standings`),
    update: (id, data) => api.patch(`/tournaments/${id}`, data),
    delete: (id) => api.delete(`/tournaments/${id}`),
    deleteTeam: (id, teamId) => api.delete(`/tournaments/${id}/teams/${teamId}`),
    clearFixtures: (id) => api.post(`/tournaments/${id}/clear-fixtures`),
};

export const matchApi = {
    recordResult: (id, data) => api.post(`/matches/${id}/result`, data),
};

export default api;
