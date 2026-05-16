export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'bread' | 'pastry' | 'cake';
}

export interface CartItem extends Product {
  quantity: number;
}
