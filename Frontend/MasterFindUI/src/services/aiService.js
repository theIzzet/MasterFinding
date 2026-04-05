import api from "./api";

export const aiService = {
    generateBio: (data) => api.post("/ai/generate-bio", data),
};