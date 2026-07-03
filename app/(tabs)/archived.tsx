import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { ProductRow } from "../../src/components/ProductRow";
import { listProductsLowLogic } from "../../src/services/api/products.api";
import { Product } from "../../src/types/product";

export default function Archived() {
  const [products, setProducts] = useState<Product[]>([]);

  Stack.Screen({ options: { title: "Vencidos" } });

  const loadProducts = async () => {
    const data = await listProductsLowLogic(true);
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={{ opacity: 0.6, textAlign: "center", marginTop: 40 }}>
            No hay productos dados de baja
          </Text>
        }
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            onEdit={() => {}}
            onDelete={() => {}}
            onChange={loadProducts}
            showQuantityControls={false}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
