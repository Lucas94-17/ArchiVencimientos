import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOrCreateDeviceId } from "../device/device-id";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export async function registerUserIfNeeded() {
  const deviceId = await getOrCreateDeviceId();
  const expoPushToken = await AsyncStorage.getItem("expoToken");

  await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      expoPushToken: expoPushToken ?? undefined,
    }),
  });
}
