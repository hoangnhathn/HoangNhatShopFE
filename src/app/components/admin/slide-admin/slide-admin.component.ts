import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Slide } from "src/app/models/slide";
import { SlideService } from "src/app/services/slide.service";
import { forkJoin, Observable, of } from "rxjs";
import { switchMap } from 'rxjs/operators';
import { environment } from "src/app/environments/environment";

declare const bootstrap: any;
const MAX_IMAGES = 1;

@Component({
  selector: "app-slide-admin",
  templateUrl: "./slide-admin.component.html",
  styleUrls: ["./slide-admin.component.css"],
})
export class SlideAdminComponent implements OnInit {
  createSlideForm: FormGroup;
  slides: Slide[];
  selectedSlide?: Slide;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  pages: number[] = [];
  totalPages: number = 0;
  keyword: string = "";
  sortField: string = "id";
  sortDirection: string = "asc";
  visiblePages: number[] = [];
  selectedFiles: File[] = [];
  slideToEdit: Slide = {
    id: 0,
    image_url: "",
    link: "",
  };

  constructor(
    private slideService: SlideService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.createSlideForm = this.fb.group({
      imgage_url: [""],
      link: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllSlides(this.currentPage, this.itemsPerPage);
  }

  getAllSlides(page: number, limit: number) {
    this.slideService.getSlides(page, limit).subscribe({
      next: (response: any) => {
        response.slides.forEach((slide: Slide) => {
          slide.image_url = `${environment.apiBaseUrl}/slides/images/${slide.image_url}`;
        });
        this.slides = response.slides;
        this.totalPages = response.totalPages;
        this.visiblePages = this.generateVisiblePageArray(
          this.currentPage,
          this.totalPages
        );
      },
      complete: () => {},
      error: (error: any) => {
        console.error("Error fetching slides: ", error);
      },
    });
  }

  openCreateModal(): void {
    this.createSlideForm.reset();
    this.slideToEdit = {
      id: 0,
      image_url: "",
      link: "",
    };
    const createModalElement = document.getElementById("createSlideModal");
    if (createModalElement) {
      const modal = new bootstrap.Modal(createModalElement);
      modal.show();
    } else {
      console.error("Không tìm thấy phần tử modal với id 'createSlideModal'");
    }
  }

  onFileSelect(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files);
  }


  createSlideAndUploadImages(): void {
    if (this.createSlideForm.invalid) {
      this.toastr.error("Vui lòng điền đầy đủ thông tin cần thiết!", "Lỗi");
      return;
    }

    const slideData: Slide = {
      id: 0,
      link: this.createSlideForm.get("link")?.value,
      image_url: ""
      // Thêm các thuộc tính khác nếu cần
    };

    this.slideService.createSlide(slideData).pipe(
      switchMap((createResponse: any) => {
        const slideId = createResponse.id;

        if (slideId) {
          return this.slideService.uploadImages(slideId, this.selectedFiles);
        } else {
          throw new Error('Slide ID không hợp lệ');
        }
      })
    ).subscribe({
      next: (response) => {
        this.toastr.success("Thêm mới và upload ảnh thành công!", "Thành công");

        // Đóng modal sau khi lưu thành công
        const editModalElement = document.getElementById("createSlideModal");
        if (editModalElement) {
          const modal = bootstrap.Modal.getInstance(editModalElement);
          if (modal) {
            modal.hide();
          }
        }

        // Tải lại danh sách slides
        this.getAllSlides(this.currentPage, this.itemsPerPage);
      },
      error: (error) => {
        this.toastr.error("Thêm mới hoặc upload ảnh thất bại. Vui lòng thử lại!", "Lỗi");
        console.error("Lỗi khi thêm mới hoặc upload ảnh:", error);
      }
    });
  }


  deleteSlide(slideId: number): void {
    if (confirm("Bạn có chắc muốn xóa slide này không?")) {
      this.slideService.deleteSlide(slideId).subscribe(
        (response) => {
          this.toastr.success("Xóa slide thành công!", "Thành công");
          // Tải lại danh sách Slide
          this.getAllSlides(this.currentPage, this.itemsPerPage);
        },
        (error) => {
          this.toastr.error("Xóa slide thất bại. Vui lòng thử lại!", "Lỗi");
          console.error("Lỗi khi xóa slide:", error);
        }
      );
    }
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllSlides(this.currentPage, this.itemsPerPage);
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
}
