export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: 'cash' | 'instapay' | 'vodafone_cash';
  delivery: DeliveryInfo;
  items: OrderItem[];
}
