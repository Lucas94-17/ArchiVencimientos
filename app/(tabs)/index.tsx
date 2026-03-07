import { Stack, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  humanDateLabel,
  parseLocalDateTime,
  urgencyColorByExpiry,
} from "../../src/services/libs/utils";

import {
  Product,
  deleteProduct,
  listProducts,
  updateProductQuantity,
} from "../../src/services/api/products.api";
export function parseLocalDate(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  // mediodía local para evitar corrimientos por zona horaria
  return new Date(y, m - 1, d, 12, 0, 0);
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  Stack.Screen({ options: { headerShown: false } });

  const loadProducts = async () => {
    const data = await listProducts();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vencimientos</Text>
        <Pressable style={styles.addBtn} onPress={() => router.push("/add")}>
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      </View>

      <FlatList
        data={[...products].sort(
          (a, b) =>
            new Date(a.notify_at).getTime() - new Date(b.notify_at).getTime(),
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}>
            No hay productos cargados
          </Text>
        }
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            onEdit={() =>
              router.push({ pathname: "/add", params: { id: item.id } })
            }
            onDelete={() => {
              Alert.alert(
                "Eliminar producto",
                `¿Eliminar definitivamente "${item.name}"?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                      await deleteProduct(item.id);
                      loadProducts();
                    },
                  },
                ],
              );
            }}
            onChange={loadProducts}
          />
        )}
      />
    </View>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onChange,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onChange: () => void;
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
});
