import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
export const ACCESS_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";

export const saveTokens = async (access: string, refresh: string) => {
    if (Platform.OS === "web") {
        localStorage.setItem(ACCESS_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
    }
    else{
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
    }
}
export const getAccessToken = async () => {
    if (Platform.OS === "web") {
      return localStorage.getItem(ACCESS_KEY);
    } else {
      return await SecureStore.getItemAsync(ACCESS_KEY);
    }
  };
  
export const getTokens = async () => {
    const access = await SecureStore.getItemAsync(ACCESS_KEY);
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
    return { access, refresh };
}

export const deleteTokens = async () => {
    if (Platform.OS === "web") {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    } else {
        await SecureStore.deleteItemAsync(ACCESS_KEY);
        await SecureStore.deleteItemAsync(REFRESH_KEY);
    }
}

export const logout = async () => {
    await deleteTokens();
    router.replace({ pathname: "/login" });
}