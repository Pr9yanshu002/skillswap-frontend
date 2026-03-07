import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/auth_context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
