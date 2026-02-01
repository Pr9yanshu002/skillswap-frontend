import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({children}:any) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        const loadToken = async () => {
            let storedToken;
            if (Platform.OS === "web") {
                storedToken = localStorage.getItem("access");
            }
            else{
                storedToken = await SecureStore.getItemAsync("access");
            }
            setToken(storedToken);
            setLoading(false);
        };
        loadToken();
    }, []);

    return (
        <AuthContext.Provider value={{ token, setToken, loading }}>
          {children}
        </AuthContext.Provider>
      );
};

export const useAuth = () => useContext(AuthContext);