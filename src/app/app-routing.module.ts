import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/client/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DetailProductComponent } from './components/client/detail-product/detail-product.component';
import { OrderComponent } from './components/client/order/order.component';
import { OrderDetailComponent } from './components/client/order-details/order.detail.component';
import { AuthGuard } from './guard/auth.guard';
import { AdminComponent } from './components/admin/admin/admin.component';
import { AdminGuard } from './guard/admin.guard';
import { UserDetailComponent } from './components/client/user-detail/user-detail.component';


const routes: Routes = [
  {path: '',component:HomeComponent},
  {path:'login', component:LoginComponent},
  {path:'register',component:RegisterComponent},
  {path:'products', component: HomeComponent },
  {path:'products/:id', component:DetailProductComponent},
  { path: 'profile', component: UserDetailComponent },
  {path:'orders', component:OrderComponent,canActivate:[AuthGuard]},
  {path:'orders/:id', component:OrderDetailComponent},
  {path:'admin', component:AdminComponent, canActivate:[AdminGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
