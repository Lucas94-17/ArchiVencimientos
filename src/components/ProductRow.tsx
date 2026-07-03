// src/components/ProductRow.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  humanDateLabel,
  parseLocalDateTime,
  urgencyColorByExpiry,
} from "../services/libs/utils";
import { Product } from "../types/product";
import { updateProductQuantity } from "../services/api/products.api";

function parseLocalDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function ProductRow({
  product,
  onEdit,
  onDelete,
  onChange,
  showQuantityControls = true,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onChange: () => void;
  showQuantityControls?: boolean;
}) {
  const notifyDate = parseLocalDateTime(product.notify_at);

  // 👇 convierte Date -> string, y cualquier otro valor -> string
  const safeText = (v: any) =>
    v instanceof Date ? v.toLocaleDateString("es-AR") : String(v);

  const expiryLabel = parseLocalDate(product.expiry_date).toLocaleDateString(
    "es-AR",
  );
  const avisoLabel = safeText(humanDateLabel(product.notify_at));

  return (
    <Pressable
      onPress={onEdit}
      style={[
        styles.row,
        { backgroundColor: urgencyColorByExpiry(product.expiry_date) },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{product.name}</Text>

        <Text style={styles.meta}>Vence: {expiryLabel}</Text>

        <Text style={styles.submeta}>
          Aviso: {avisoLabel} a las{" "}
          {notifyDate.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.qty}>{product.quantity}</Text>

        <View style={styles.qtyBtns}>
          <Pressable
            style={styles.qtyBtn}
            onPress={async () => {
              await updateProductQuantity(product.id, -1);
              onChange();
            }}
          >
            <Text style={styles.qtyText}>−</Text>
          </Pressable>

          <Pressable
            style={styles.qtyBtn}
            onPress={async () => {
              await updateProductQuantity(product.id, +1);
              onChange();
            }}
          >
            <Text style={styles.qtyText}>＋</Text>
          </Pressable>

          <Pressable
            style={[styles.qtyBtn, { backgroundColor: "#991b1b" }]}
            onPress={onDelete}
          >
            <Text style={styles.qtyText}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    flex: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    marginTop: 4,
    opacity: 0.7,
  },
  submeta: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.7,
  },
  right: {
    alignItems: "flex-end",
  },
  qty: {
    fontSize: 20,
    fontWeight: "900",
  },
  qtyBtns: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
  archivedBtn: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#991b1b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  archivedText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },
});
