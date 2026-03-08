import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // 👈 NUEVO
    shouldShowList: true,   // 👈 NUEVO
  }),
});

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#fff",
      }}
    >
      {/* Título del grupo */}
      <Stack.Screen
        name="(tabs)"
        options={{
          title: "ArchiVencimientos",
        }}
      />

      <Stack.Screen
        name="(tabs)/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
export async function registerForPush(): Promise<string | undefined> {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("📱 EXPO TOKEN:", token);

  await AsyncStorage.setItem("expoToken", token);

  return token;
}

