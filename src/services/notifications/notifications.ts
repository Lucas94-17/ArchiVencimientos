import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/* 🔔 HANDLER OBLIGATORIO (Android no muestra nada sin esto) */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // 🔔 muestra banner
    shouldShowList: true, // 📋 aparece en la lista
    shouldPlaySound: true, // 🔊 sonido
    shouldSetBadge: false,
  }),
});

/* 🔐 Pedir permisos + canal Android */
export async function initNotifications() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

/* ⏰ PROGRAMAR NOTIFICACIÓN LOCAL (FORMA CORRECTA) */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  date: Date,
) {
  const now = Date.now();
  let finalDate = date;

  if (finalDate.getTime() <= now) {
    console.warn("⚠️ Fecha pasada, forzando +1 minuto");
    finalDate = new Date(now + 60_000);
  }

  console.log("🔔 Programando para:", finalDate.toString());

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: finalDate,
    },
  });
}

export async function cancelNotification(notificationId?: string | null) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function getPushToken() {
  if (!Device.isDevice) {
    console.log("❌ Push solo en dispositivo físico");
    return null;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("🔥 EXPO PUSH TOKEN:", token);

  return token;
}
