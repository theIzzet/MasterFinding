// import React, { createContext, useContext, useEffect, useState } from "react";
// import { authService } from "../services/authService";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);


//   useEffect(() => {
//     authService.me()
//       .then(res => setUser(res.data))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (loginDto) => {
//     await authService.login(loginDto);
//     const me = await authService.me();
//     setUser(me.data);
//     return me.data;
//   };


//   const refreshUser = async () => {
//     const me = await authService.me();
//     setUser(me.data);
//     return me.data;
//   };

//   const logout = async () => {
//     await authService.logout();
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, refreshUser, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (loginDto) => {
    // 1. Login isteği atılır. Başarılı olursa Backend Response Header içinde
    // "Set-Cookie: jwt=..." döner ve tarayıcı bunu güvenli kasasına alır.
    await authService.login(loginDto);

    // 2. Artık tarayıcıda cookie var. me() isteği otomatik olarak bu cookie ile gider.
    const me = await authService.me();
    setUser(me.data);
    return me.data;
  };

  const refreshUser = async () => {
    const me = await authService.me();
    setUser(me.data);
    return me.data;
  };

  const logout = async () => {
    // Backend'deki logout endpointi cookie'yi siler
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);