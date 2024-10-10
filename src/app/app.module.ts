import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router, RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from "./app-routing.module";
import { NavbarComponent } from "./components/client/navbar/navbar.component";
import { FooterComponent } from "./components/client/footer/footer.component";
import { HomeComponent } from "./components/client/home/home.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { FormsModule } from "@angular/forms";
import { TokenInterceptor } from "./interceptors/token.interceptor";
import { DetailProductComponent } from './components/client/detail-product/detail-product.component';
import { OrderDetailComponent } from './components/client/order-details/order.detail.component';
import { OrderComponent } from './components/client/order/order.component';
import { ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from './app/app.component';
import { AdminComponent } from './components/admin/admin/admin.component';
import { CategoryAdminComponent } from './components/admin/category-admin/category-admin.component';
import { OrderAdminComponent } from './components/admin/order-admin/order-admin.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ProductAdminComponent } from './components/admin/product-admin/product-admin.component';
import { UserAdminComponent } from './components/admin/user-admin/user-admin.component';
import { SlideAdminComponent } from './components/admin/slide-admin/slide-admin.component';
import { ImagePreviewPipe } from './pipe/image.preview.pipe';
import { UserDetailComponent } from "./components/client/user-detail/user-detail.component";

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DetailProductComponent,
    OrderDetailComponent,
    OrderComponent,
    AppComponent,
    AdminComponent,
    CategoryAdminComponent,
    OrderAdminComponent,
    ProductAdminComponent,
    UserAdminComponent,
    SlideAdminComponent,
    ImagePreviewPipe,
    UserDetailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,// required animations module
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    ToastrModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [
    AppComponent
    //HomeComponent,
    //LoginComponent,
    //RegisterComponent,
    //DetailProductComponent
    //OrderDetailComponent
    //OrderComponent
    // AdminComponent
  ],
})
export class AppModule {}
