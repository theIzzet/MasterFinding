import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7054/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {

    if (error.response) {

      // DURUM: 429 Rate Limit (Çok Fazla İstek)
      if (error.response.status === 429) {
        console.warn("Rate Limit Aşıldı!");


        if (!error.response.data || typeof error.response.data !== 'object') {

          error.response.data = {
            Errors: ["Çok fazla deneme yaptınız. Lütfen 1 dakika bekleyip tekrar deneyin."]
          };
        }
      }

      // DURUM: 401 Unauthorized (Oturum düşmüşse)
      if (error.response.status === 401) {

        // window.location.href = "/login";
      }
    }


    return Promise.reject(error);
  }
);
export default api;
