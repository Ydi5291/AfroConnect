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

export const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'about', loadComponent: () => import('./about/about.component').then(m => m.AboutComponent) },
  { path: 'kontakt', loadComponent: () => import('./kontakt.component').then(m => m.KontaktComponent) },
  { path: 'hilfe', loadComponent: () => import('./hilfe.component').then(m => m.HilfeComponent) },
  { path: 'gallery', component: GalleryComponent },
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
  { path: '**', redirectTo: '/gallery' } 
];
