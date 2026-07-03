export type ProductDto = {
  id: number;
  name: string;
  quantity: number;
  expiry_date: string;
  notify_at: string;
  notificationId: string | null;
};

export type Product = {
  id: number;
  name: string;
  quantity: number;
  expiry_date: string;
  notify_at: string;
};
