import { ProductDto, Product } from "../../types/product";
import { getOrCreateDeviceId } from "../device/device-id";
const API = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// CRUD
export async function listProducts(): Promise<Product[]> {
  const deviceId = await getOrCreateDeviceId();

  const url = `${API}/products?deviceId=${encodeURIComponent(deviceId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching products");

  const data = await res.json();
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    expiry_date: String(p.expiry_date).slice(0, 10),
    notify_at: String(p.notify_at),
  }));
}

export async function updateProductQuantity(productId: number, delta: number) {
  const deviceId = await getOrCreateDeviceId();

  await fetch(`${API}/products/${productId}/quantity`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, delta }),
  });
}

export async function deleteProduct(productId: number) {
  const deviceId = await getOrCreateDeviceId();

  await fetch(`${API}/products/${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });
}
export async function getProductById(productId: number) {
  const deviceId = await getOrCreateDeviceId();

  const res = await fetch(`${API}/products/${productId}?deviceId=${deviceId}`);

  if (!res.ok) {
    throw new Error("Producto no encontrado");
  }

  return await res.json();
}
// CREATE
async function jsonOrNull(res: Response) {
  const text = await res.text().catch(() => "");
  return text ? JSON.parse(text) : null;
}

async function throwIfNotOk(res: Response, label: string) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${label} (${res.status}): ${text || res.statusText}`);
  }
}

// CREATE
export async function createProduct(payload: Record<string, any>) {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // ✅ plano
  });

  await throwIfNotOk(res, "Error creating product");
  return await jsonOrNull(res); // ✅ no rompe si viene vacío
}

// UPDATE
export async function updateProduct(
  productId: number,
  payload: Record<string, any>,
) {
  const res = await fetch(`${API}/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // ✅ plano (NO { payload })
  });

  await throwIfNotOk(res, "Error updating product");
  return await jsonOrNull(res); // ✅ no rompe si viene vacío
}

export async function listProductsLowLogic(
  includeDeleted: boolean,
): Promise<Product[]> {
  const deviceId = await getOrCreateDeviceId();

  const url = `${API}/products/detail/low-logic?deviceId=${encodeURIComponent(deviceId)}&includeDeleted=${includeDeleted}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching low-logic products");

  const data = await res.json();
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    quantity: p.quantity,
    expiry_date: String(p.expiry_date).slice(0, 10),
    notify_at: String(p.notify_at),
    is_deleted: p.is_deleted,
  }));
}

export async function softDeleteProduct(productId: number) {
  const deviceId = await getOrCreateDeviceId();

  const res = await fetch(`${API}/products/${productId}/soft-delete`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });

  await throwIfNotOk(res, "Error al dar de baja producto");
  return await jsonOrNull(res);
}
