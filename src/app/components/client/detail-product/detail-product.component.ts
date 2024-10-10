import { Component, OnInit } from "@angular/core";
import { environment } from "src/app/environments/environment";
import { Product } from "src/app/models/product";
import { CartService } from "src/app/services/cart.service";
import { ProductService } from "src/app/services/product.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductImage } from "src/app/models/product.image";
import { ReviewService } from "src/app/services/review.service";
import { Review } from "src/app/models/review";
import { TokenService } from "src/app/services/token.service";
import { ReviewDTO } from "src/app/dtos/review/review.dto";
declare var bootstrap: any;

@Component({
  selector: "app-detail-product",
  templateUrl: "./detail-product.component.html",
  styleUrls: ["./detail-product.component.css"],
})
export class DetailProductComponent implements OnInit {
  product?: Product;
  checkUser: number = 0;
  reviews: Review;
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  selectedRating: number = 0;
  comment: string = '';
  rating: number = 0;

  constructor(
    private productService: ProductService,
    private reviewService: ReviewService,
    private tokenService: TokenService,
    private cartService: CartService,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productId = +params["id"]; // Lấy productId từ URL
      if (!isNaN(this.productId)) {
        this.loadProductDetails(this.productId);
        this.loadProductReview(this.productId);
      } else {
        console.error("Invalid productId:", this.productId);
      }
    });
    this.checkUser= this.tokenService.getUserId();
  }
  loadProductDetails(productId: number): void {
    this.productService.getDetailProduct(productId).subscribe({
      next: (response: any) => {
        // Cập nhật đường dẫn cho từng ảnh
        response.product_images = response.product_images.map(
          (productImage: ProductImage) => ({
            id: productImage.id,
            image_url: `${environment.apiBaseUrl}/products/images/${productImage.image_url}`,
          })
        );
        // Nếu không có ảnh nào, thêm ảnh mặc định
        if (response.product_images.length === 0) {
          response.product_images = [
            {
              id: 0,
              image_url: `${environment.apiBaseUrl}/products/images/notfound.jpg`,
            },
          ];
        }
        this.product = response;
        this.rating = response.rating;
        this.showImage(0);
      },
      complete: () => {},
      error: (error: any) => {
        console.error("Error fetching detail: ", error);
      },
    });
  }

  loadProductReview(productId: number): void {
    this.reviewService.getReviews(null,productId).subscribe({
      next: (response: any) => {
        this.reviews = response;
      },
      complete: () => {},
      error: (error: any) => {
        console.error("Error fetching detail: ", error);
      },
    });
  }

  showImage(index: number): void {
    if (
      this.product &&
      this.product.product_images &&
      this.product.product_images.length > 0
    ) {
      if (index < 0) {
        index = 0;
      } else if (index >= this.product.product_images.length) {
        index = this.product.product_images.length - 1;
      }
      this.currentImageIndex = index;
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = 0; // Đảm bảo không trượt thêm nữa khi đã ở slide đầu tiên
    }
    this.updateCarousel();
  }

  nextImage(): void {
    if (this.currentImageIndex < this.product.product_images.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = this.product.product_images.length - 1; // Đảm bảo không trượt thêm nữa khi đã ở slide cuối cùng
    }
    this.updateCarousel();
  }

  updateCarousel(): void {
    const carouselElement = document.querySelector("#carouselExample");
    if (carouselElement) {
      const carouselInstance = bootstrap.Carousel.getInstance(carouselElement);
      if (carouselInstance) {
        carouselInstance.to(this.currentImageIndex); // Chuyển carousel tới slide chỉ định
      }
    }
  }

  thumbnailClick(index: number) {
    this.currentImageIndex = index;
  }

  addToCart(): void {
    debugger;
    if (this.product) {
      console.log(this.product.id);
      this.cartService.addToCart(this.product.id, this.quantity);
      alert("Thêm vào giỏ hàng thành công!");
    } else {
      console.error("Không thể thêm sản phẩm");
    }
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  buyClick() {
    this.router.navigate(["/orders"]);
  }



  // Xử lý chọn đánh giá (số sao)
  selectRating(rating: number): void {
    this.selectedRating = rating;
  }


  // Gửi đánh giá
  submitReview(product_id1: number) {
    if (this.comment && this.selectedRating > 0) {
      const newReview: ReviewDTO = {
        user_id: this.tokenService.getUserId(),
        product_id: product_id1,
        rating: this.selectedRating,
        comment: this.comment
      };

      // Thêm đánh giá vào danh sách

      // Xử lý lưu đánh giá lên server nếu cần thiết
      this.reviewService.createReview(newReview).subscribe({
        next: () => {
          alert('Đánh giá sản phẩm thành công!');
          this.loadProductReview(product_id1);
        },
        complete: () => {},
        error: (error: any) => {
          console.error("Error fetching detail: ", error);
        },
      })

      // Reset form
      this.selectedRating = 0;
      this.comment = '';
    } else {
      alert('Vui lòng nhập đánh giá và bình luận!');
    }
  }
}
