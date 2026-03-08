import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { registerUserIfNeeded } from "../../src/services/api/user.api";
import { initNotifications } from "../../src/services/notifications/notifications";
import { registerForPush } from "../_layout";
export default function TabsLayout() {
  useEffect(() => {
    (async () => {
      // 1️⃣ Registrar usuario anónimo (deviceId)
      await registerUserIfNeeded();

      // 2️⃣ Canal Android1
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
        });
      }

      // 3️⃣ Init notificaciones locales
      initNotifications();

      // 4️⃣ Registrar push (obtiene token internamente)
      const token = await registerForPush();

      // 5️⃣ Si hay token, asociarlo al user
      if (token) {
        await registerUserIfNeeded();
        // mismo endpoint, ahora con expoPushToken guardado
      }
    })();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#fff",
      }}
    />
  );
}
