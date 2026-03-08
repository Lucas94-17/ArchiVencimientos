import { View, Text, StyleSheet } from "react-native";

export default function Expiring() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos por vencer</Text>
      <Text>Próximamente…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
});
