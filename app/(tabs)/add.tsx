import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "../../src/services/api/products.api";
import { getOrCreateDeviceId } from "../../src/services/device/device-id";
import { formatTime } from "../../src/services/libs/utils";
import { scheduleLocalNotification } from "../../src/services/notifications/notifications";
// helpers fecha local
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function buildNotifyDateTime(notifyDate: Date, notifyTime: Date) {
  const d = new Date(
    notifyDate.getFullYear(),
    notifyDate.getMonth(),
    notifyDate.getDate(),
    notifyTime.getHours(),
    notifyTime.getMinutes(),
    0,
    0,
  );

  const now = new Date();

  // 🔥 si quedó en el pasado o mismo minuto → +1 minuto
  if (d <= now) {
    d.setMinutes(d.getMinutes() + 1);
  }

  return d;
}

function parseLocalDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function normalizeToNoon(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
  );
}

export default function AddProduct() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params.id ? Number(params.id) : null;
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const [expiryDate, setExpiryDate] = useState(normalizeToNoon(new Date()));
  const [notifyDate, setNotifyDate] = useState(normalizeToNoon(new Date()));
  const [notifyTime, setNotifyTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [showNotifyPicker, setShowNotifyPicker] = useState(false);
  Stack.Screen({
    options: {
      title: "", // 🔥 borra “add”
    },
  });

  useEffect(() => {
    if (!editingId) return;

    (async () => {
      const product = await getProductById(editingId);

      setName(product.name);
      setQuantity(String(product.quantity));

      // ✅ expiry_date puede venir como ISO
      const expiryRaw = (product.expiry_date ?? product.expiryDate) as string;
      setExpiryDate(parseLocalDate(expiryRaw.slice(0, 10)));

      // ✅ notify_at ISO
      const notifyRaw = product.notify_at ?? product.notifyAt;
      const notifyAt = new Date(notifyRaw);

      setNotifyDate(
        normalizeToNoon(
          new Date(
            notifyAt.getFullYear(),
            notifyAt.getMonth(),
            notifyAt.getDate(),
          ),
        ),
      );

      setNotifyTime(notifyAt);
    })();
  }, [editingId]);

  async function save() {
    if (!name.trim()) return;

    const now = new Date();

    // fecha real de notificación
    let notifyAt = buildNotifyDateTime(notifyDate, notifyTime);

    // 🚨 nunca permitir pasado
    if (notifyAt <= now) {
      notifyAt = new Date(now.getTime() + 60 * 1000);
    }

    const deviceId = await getOrCreateDeviceId();

    const payload = {
      deviceId,
      name: name.trim(),
      quantity: Number(quantity),
      expiry_date: formatDate(expiryDate), // "YYYY-MM-DD"
      notify_at: notifyAt, // ✅ local "YYYY-MM-DD HH:mm:ss"
    };
    console.log("Device TZ:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log("notifyAt local:", notifyAt.toString());
    console.log("notifyAt ISO:", notifyAt.toISOString());
    try {
      if (editingId) {
        await updateProduct(editingId, {
          ...payload,
          notify_at: notifyAt.toISOString(),
        });
      } else {
        await createProduct({
          ...payload,
          notify_at: notifyAt.toISOString(),
        });
      }

      await scheduleLocalNotification(
        "Vencimiento",
        `${name.trim()} vence el ${formatDate(expiryDate)}`,
        notifyAt,
      );

      router.back();
    } catch (err) {
      console.error("❌ Error guardando producto", err);
      alert(String(err));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {editingId ? "Editar producto" : "Nuevo producto"}
      </Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Fecha de vencimiento</Text>
      <Pressable style={styles.input} onPress={() => setShowExpiryPicker(true)}>
        <Text>{formatDate(expiryDate)}</Text>
      </Pressable>

      {showExpiryPicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date"
          onChange={(_, d) => {
            setShowExpiryPicker(false);
            if (d) setExpiryDate(normalizeToNoon(d));
          }}
        />
      )}

      <Text style={styles.label}>Fecha de aviso</Text>
      <Pressable style={styles.input} onPress={() => setShowNotifyPicker(true)}>
        <Text>{formatDate(notifyDate)}</Text>
      </Pressable>

      {showNotifyPicker && (
        <DateTimePicker
          value={notifyDate}
          mode="date"
          onChange={(_, d) => {
            setShowNotifyPicker(false);
            if (d) setNotifyDate(normalizeToNoon(d));
          }}
        />
      )}

      <Text style={styles.label}>Hora de aviso</Text>

      <Pressable
        style={styles.timeInput}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.timeIcon}>⏰</Text>
        <Text style={styles.timeText}>{formatTime(notifyTime)}</Text>
      </Pressable>

      {showTimePicker && (
        <DateTimePicker
          value={notifyTime}
          mode="time"
          is24Hour
          onChange={(_, d) => {
            setShowTimePicker(false);
            if (d) setNotifyTime(d);
          }}
        />
      )}

      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>
          {editingId ? "Guardar cambios" : "Guardar"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "900", marginBottom: 20 },
  label: { fontWeight: "700", marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 10,
    padding: 12,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  alertBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: { color: "white", fontSize: 22, fontWeight: "900" },
  alertValue: { fontSize: 16, fontWeight: "800" },
  saveBtn: {
    marginTop: 30,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "900" },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 10,
    padding: 12,
  },

  timeIcon: {
    fontSize: 18,
  },

  timeText: {
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#b91c1c",
    marginTop: 12,
    fontWeight: "800",
    textAlign: "center",
  },
});
