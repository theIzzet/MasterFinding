import api from './api';

export const lookupsService = {

  getServiceCategoriesWithServices: () => api.get('/lookups/serviceswithcategory'),
  getAllLocations: () => api.get('/lookups/locations'),
  searchMasters: (params = {}) => api.get('/lookups/search', { params }),

 
  async getMasterByAppUserId(appUserId) {
    const res = await api.get('/lookups/search', { params: { appUserId } });
    const arr = Array.isArray(res.data) ? res.data : [];
    return arr[0] || null;
  },


  async getFullProfileByAppUserId(appUserId) {
    
    try {
      const byUser = await api.get(`/MasterProfiles/by-appuser/${appUserId}`);
      if (byUser?.data) return byUser.data;
    } catch (_) {}

  
    try {
      const maybeGuid = await api.get(`/MasterProfiles/${appUserId}`);
      if (maybeGuid?.data) return maybeGuid.data;
    } catch (_) {}

   
    try {
      const fromSearch = await this.getMasterByAppUserId(appUserId);
      return fromSearch;
    } catch (_) {
      return null;
    }
  },
};
