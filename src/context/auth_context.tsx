import { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, logout } from "../api/auth";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}:any) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        const loadToken = async () => {
            const storedToken = await getAccessToken();
            setToken(storedToken);
            setLoading(false);
        };
        loadToken();
    }, []);

    return (
        <AuthContext.Provider value={{ token, setToken, loading, logout }}>
          {children}
        </AuthContext.Provider>
      );
};

export const useAuth = () => useContext(AuthContext);