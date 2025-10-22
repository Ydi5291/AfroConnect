import { Routes } from '@angular/router';
import { GalleryComponent } from './gallery/gallery.component';
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

export const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'gallery', component: GalleryComponent },
  { path: 'afroshop/:id', component: ImageDetailComponent },
  { 
    path: 'add-afroshop', 
    component: AddAfroshopComponent,
    canActivate: [AuthGuard] // 🔒 Route protégée !
  },
  { 
    path: 'edit-afroshop/:id', 
    component: AddAfroshopComponent,
    canActivate: [AuthGuard] // 🔒 Route protégée !
  },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard] // 🔒 Route d'administration protégée !
  },
  { 
    path: 'geocoding-diagnostic', 
    component: GeocodingDiagnosticComponent,
    canActivate: [AuthGuard] // 🔒 Route de diagnostic réservée aux admins !
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'impressum', component: ImpressumComponent },
  { path: '**', redirectTo: '/gallery' } // Route wildcard pour les erreurs 404
];
