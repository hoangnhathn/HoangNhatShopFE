

export class ReviewDTO {
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  constructor(data: any) {
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.rating = data.rating;
    this.comment = data.comment;
  }
}
