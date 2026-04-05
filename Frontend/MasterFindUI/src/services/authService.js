// import axios from 'axios';

// // Axios instance oluşturma
// const api = axios.create({
//     baseURL: '/api',
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Request interceptor - token ekleme
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // Response interceptor - hata yönetimi
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Token süresi dolmuş veya geçersiz
//             localStorage.removeItem('token');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// // Auth servisleri
// export const authService = {
//     login: (loginData) => api.post('/auth/login', loginData),
//     register: (registerData) => api.post('/auth/register', registerData),
//     logout: () => api.post('/auth/logout'),
// };

// // Diğer API servisleri burada tanımlanabilir
// export const userService = {
//     getProfile: () => api.get('/users/profile'),
//     updateProfile: (data) => api.put('/users/profile', data),
// };



// export default api;


import axios from 'axios';

// Axios instance oluşturma
const api = axios.create({
    // baseURL'i backend adresinize göre tam yazmanız CORS cookie'leri için daha sağlıklıdır
    baseURL: 'https://localhost:7054/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // EN ÖNEMLİ SATIR: Bu sayede tarayıcı HttpOnly cookie'leri otomatik alıp gönderir
    withCredentials: true
});

// Response interceptor - hata yönetimi (Request interceptor'ı TAMAMEN SİLDİK)
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Token süresi dolmuş veya cookie silinmiş
//             // Artık localStorage.removeItem('token') yapmamıza gerek yok
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );
// Response interceptor - hata yönetimi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // BURAYI SİLDİK: window.location.href = '/login';
            // Sadece konsola bilgi yazdırabiliriz veya boş bırakabiliriz
            console.log("Oturum yok veya süresi dolmuş.");
        }
        return Promise.reject(error);
    }
);
// Auth servisleri
export const authService = {
    login: (loginData) => api.post('/auth/login', loginData),
    register: (registerData) => api.post('/auth/register', registerData),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
};

// Diğer API servisleri burada tanımlanabilir
export const userService = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
};

export default api;