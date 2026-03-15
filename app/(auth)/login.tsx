import { View, Text, TextInput, TouchableOpacity, StyleSheet , Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import {api} from "@/src/api/api";
import { saveTokens } from "@/src/api/auth";
import { useAuth } from "@/src/context/auth_context";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {setToken} = useAuth();
  const handleLogin = async () => {
    try{
      console.log("Sending request...");
      const res = await api.post("/auth/login/", {
        email,password
      })
      await saveTokens(res.data.access,res.data.refresh)
      setToken(res.data.access);
      Alert.alert("Success", "Login successful");
      router.replace({ pathname: "/(tabs)" });
    }
    catch(error: any){
      console.log(error.response?.data);
      Alert.alert("Error", "Login failed");
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress = {handleLogin}> 
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push({pathname: "/signup"})}>
        <Text style={styles.link}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: { marginTop: 15, textAlign: "center", color: "#4F46E5" },
});
