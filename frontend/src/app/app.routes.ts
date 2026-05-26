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
      { path: 'product/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then((m) => m.ProductDetailComponent) },
      // Old links used /product/some-long-slug before we switched to product UUIDs
      { path: 'p/:id', redirectTo: 'product/:id', pathMatch: 'full' },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent) },
      { path: 'checkout', loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent) },
      { path: 'order-confirmation', loadComponent: () => import('./features/order-confirmation/order-confirmation.component').then((m) => m.OrderConfirmationComponent) },
      { path: 'track-order', loadComponent: () => import('./features/track-order/track-order.component').then((m) => m.TrackOrderComponent) },
      { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./features/my-orders/my-orders.component').then((m) => m.MyOrdersComponent) },
      { path: 'orders/:id', canActivate: [authGuard], loadComponent: () => import('./features/order-detail/order-detail.component').then((m) => m.OrderDetailComponent) },
      { path: 'account', canActivate: [authGuard], loadComponent: () => import('./features/account/account.component').then((m) => m.AccountComponent) },
      { path: 'contact', loadComponent: () => import('./features/pages/contact-page.component').then((m) => m.ContactPageComponent) },
      { path: 'page/:slug', loadComponent: () => import('./features/pages/static-page.component').then((m) => m.StaticPageComponent) },
      { path: 'saved', loadComponent: () => import('./features/saved/saved.component').then((m) => m.SavedComponent) },
      { path: 'wishlist', redirectTo: 'saved', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent) },
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
      { path: 'categories', loadComponent: () => import('./features/admin/categories/categories.component').then((m) => m.CategoriesComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
