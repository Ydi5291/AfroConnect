
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService, UserProfile } from './services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, CookieConsentComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AfroConnect';
  user$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.user$;
  }

  ngOnInit() {}

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/gallery']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
