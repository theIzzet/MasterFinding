import api from './api';

export const adminService = {
    getDashboardStats: () => api.get('/admin/dashboard-stats'),

    createServiceCategory: (data) =>
        api.post('/admin/service-categories', data),

    updateServiceCategory: (id, data) =>
        api.put(`/admin/service-categories/${id}`, data),

    deleteServiceCategory: (id) =>
        api.delete(`/admin/service-categories/${id}`),

    createService: (data) =>
        api.post('/admin/services', data),

    updateService: (id, data) =>
        api.put(`/admin/services/${id}`, data),

    deleteService: (id) =>
        api.delete(`/admin/services/${id}`),

    createLocation: (data) =>
        api.post('/admin/locations', data),

    deleteLocation: (id) =>
        api.delete(`/admin/locations/${id}`),

    deleteUser: (userId) =>
        api.delete(`/admin/users/${userId}`)
};
