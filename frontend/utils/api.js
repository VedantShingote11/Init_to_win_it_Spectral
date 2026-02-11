import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Projects
export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
};

// Resources
export const resourcesAPI = {
    getByProject: (projectId) => api.get(`/resources/project/${projectId}`),
    uploadFile: (projectId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/resources/upload/${projectId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    addYouTube: (projectId, url, title) =>
        api.post(`/resources/youtube/${projectId}`, { url, title }),
    getStatus: (id) => api.get(`/resources/${id}/status`),
    delete: (id) => api.delete(`/resources/${id}`),
};

// Learning
export const learningAPI = {
    ask: (projectId, question) =>
        api.post(`/learning/${projectId}/ask`, { question }),

    generateOverview: (projectId) =>
        api.post(`/learning/${projectId}/summaries/overview`),

    generateTopicNotes: (projectId, topic) =>
        api.post(`/learning/${projectId}/summaries/topic`, { topic }),

    generateAllNotes: (projectId) =>
        api.post(`/learning/${projectId}/summaries/all`),

    startQuiz: (projectId) =>
        api.post(`/learning/${projectId}/quiz/start`),

    submitAnswer: (projectId, session_id, answer) =>
        api.post(`/learning/${projectId}/quiz/answer`, { session_id, answer }),

    getPerformance: (projectId) =>
        api.get(`/learning/${projectId}/performance`),

    generateSmartNotes: (projectId) =>
        api.post(`/learning/${projectId}/smart-notes`),

    generateAdvancedMaterial: (projectId) =>
        api.post(`/learning/${projectId}/advanced-material`),

    getReminders: (projectId) =>
        api.get(`/learning/${projectId}/reminders`),

    markRevised: (projectId, topic) =>
        api.post(`/learning/${projectId}/reminders/mark-revised`, { topic }),
};

export default api;
