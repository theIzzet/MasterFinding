import api from './api';

export const masterService = {
  createProfile: (formData) => {
    return api.post('/MasterProfiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getMyProfile: () => {
    return api.get('/MasterProfiles/me');
  },

  updateProfile: (formData) => {
    return api.put('/MasterProfiles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  addPortfolioItem: (formData) => {
    return api.post('/MasterProfiles/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePortfolioItem: (portfolioItemId) => {
    return api.delete(`/MasterProfiles/portfolio/${portfolioItemId}`);
  },
};
