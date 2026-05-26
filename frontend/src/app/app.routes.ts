import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/customer-layout/customer-layout.component').then((m) => m.CustomerLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'shop', loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent) },
      { path: 'product/:slug', loadComponent: () => import('./features/product-detail/product-detail.component').then((m) => m.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent) },
      { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent) },
      { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./features/my-orders/my-orders.component').then((m) => m.MyOrdersComponent) },
      { path: 'saved', loadComponent: () => import('./features/saved/saved.component').then((m) => m.SavedComponent) },
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/admin/products-list/products-list.component').then((m) => m.ProductsListComponent) },
      { path: 'products/new', loadComponent: () => import('./features/admin/product-form/product-form.component').then((m) => m.ProductFormComponent) },
      { path: 'products/:id/edit', loadComponent: () => import('./features/admin/product-form/product-form.component').then((m) => m.ProductFormComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/orders/orders.component').then((m) => m.OrdersComponent) },
      { path: 'coupons', loadComponent: () => import('./features/admin/coupons/coupons.component').then((m) => m.CouponsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
