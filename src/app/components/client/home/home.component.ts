import { Component, OnInit } from "@angular/core";
import { Product } from "src/app/models/product";
import { ProductService } from "src/app/services/product.service";
import { environment } from "src/app/environments/environment";
import { Category } from "src/app/models/category";
import { Router } from "@angular/router";
import { SlideService } from "src/app/services/slide.service";
import { Slide } from "src/app/models/slide";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 10;
  sortField: string = "id";
  sortDirection: string = "asc";
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  selectedCategoryId: number = 0;
  categories: Category[] = [];
  slides: Slide[] = [];
  constructor(
    private productService: ProductService,
    private router: Router,
    private slideService: SlideService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadSlide();
  }
  loadProducts(): void {
    // Lắng nghe sự kiện từ NavbarComponent
    this.productService.currentCategoryId$.subscribe((categoryId) => {
      this.selectedCategoryId = categoryId;
      this.getProducts(
        this.keyword,
        this.selectedCategoryId,
        this.currentPage,
        this.itemsPerPage,
        this.sortField,
        this.sortDirection
      );
    });

    this.productService.currentKeyword$.subscribe((keyword) => {
      this.keyword = keyword;
      this.getProducts(
        this.keyword,
        this.selectedCategoryId,
        this.currentPage,
        this.itemsPerPage,
        this.sortField,
        this.sortDirection
      );
    });
  }
  loadSlide(): void {
    this.slideService.getSlides(0,100).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.slides)) {
          this.slides = response.slides.map((slide: any) => ({
            ...slide,
            imageUrl: slide.imageUrl ? `${environment.apiBaseUrl}/slides/images/${slide.imageUrl}` : null,
          }));
          // Nếu bạn cần xử lý totalPages, bạn có thể lưu nó vào một biến khác
          this.totalPages = response.totalPages;
        } else {
          console.error('Unexpected response format', response);
          this.slides = [];
          this.totalPages = 0;
        }
      },
      error: (err) => {
        console.error('Failed to load slides', err);
        this.slides = [];
        this.totalPages = 0;
      }
    });
  }

  onCategoryChange(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }
  onKeywordChange(keyword: string): void {
    this.keyword = keyword;
    this.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  getProducts(
    keyword: string,
    selectedCategoryId: number,
    page: number,
    limit: number,
    sortField: string,
    sortDirection: string
  ) {
    this.productService
      .getProducts(keyword, selectedCategoryId, page, limit, sortField, sortDirection)
      .subscribe({
        next: (response: any) => {
          response.products.forEach((product: Product) => {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          });
          this.products = response.products;
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        complete: () => {},
        error: (error: any) => {
          console.error("Error fetching products: ", error);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getProducts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }
  onProductClick(productId: number) {
    this.router.navigate(["/products", productId]);
  }
}
