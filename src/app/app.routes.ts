import { Routes } from '@angular/router';
import { GalleryComponent } from './gallery/gallery.component';
import { KontaktComponent } from './kontakt.component';
import { ImageDetailComponent } from './image-detail/image-detail.component';
import { AddAfroshopComponent } from './add-afroshop/add-afroshop.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { ImpressumComponent } from './impressum.component';
import { AdminComponent } from './admin/admin.component';
import { GeocodingDiagnosticComponent } from './geocoding-diagnostic/geocoding-diagnostic.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AddProductComponent } from './add-product/add-product.component';
import { ShopComponent } from './shop/shop.component';
import { PaymentComponent } from './payment/payment.component';
import { DashboardComponent } from './admin/dashboard.component';
import { SuperDashboardComponent } from './admin/super-dashboard.component';
import { PricingComponent } from './pricing/pricing.component';

export const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'shop/:id', component: ShopComponent },
  { path: 'about', loadComponent: () => import('./about/about.component').then(m => m.AboutComponent) },
  { path: 'kontakt', loadComponent: () => import('./kontakt.component').then(m => m.KontaktComponent) },
  { path: 'hilfe', loadComponent: () => import('./hilfe.component').then(m => m.HilfeComponent) },
  { path: 'gallery', component: GalleryComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'afroshop/:id', component: ImageDetailComponent },
  { 
    path: 'add-afroshop', 
    component: AddAfroshopComponent,
    canActivate: [AuthGuard] // 🔒
  },
  { 
    path: 'edit-afroshop/:id', 
    component: AddAfroshopComponent,
    canActivate: [AuthGuard] // 🔒 
  },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AdminGuard] // 🔒 
  },
  { 
    path: 'geocoding-diagnostic', 
    component: GeocodingDiagnosticComponent,
    canActivate: [AuthGuard] // 🔒
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'impressum', component: ImpressumComponent },
  { 
    path: 'add-product', 
    component: AddProductComponent,
    canActivate: [AuthGuard] // 🔒
  },
  { 
    path: 'payment', 
    component: PaymentComponent
  },
  { 
    path: 'dashboard/:id', 
    component: DashboardComponent, 
    canActivate: [AdminGuard] // 🔒
  },
  { 
    path: 'super-dashboard', 
    component: SuperDashboardComponent, 
    canActivate: [AdminGuard] // 🔒 Super Admin uniquement
  },
  { path: '**', redirectTo: '/gallery' } 
];
