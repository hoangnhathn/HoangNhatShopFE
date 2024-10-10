import { ProductImage } from "./product.image";

export interface Product{
  id: number;
  product_name: string;
  price: number;
  rating: number;
  thumbnail?: string;
  description: string;
  category_id: number;
  category_name: string
  product_images: ProductImage[];
}
