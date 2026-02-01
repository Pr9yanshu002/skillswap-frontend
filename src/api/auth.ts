import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const saveTokens = async (access: string, refresh: string) => {
    if (Platform.OS === "web") {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
    }
    else{
    await SecureStore.setItemAsync("access_token", access);
    await SecureStore.setItemAsync("refresh_token", refresh);
    }
}

export const getTokens = async () => {
    const access = await SecureStore.getItemAsync("access_token");
    const refresh = await SecureStore.getItemAsync("refresh_token");
    return { access, refresh };
}

export const deleteTokens = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
}