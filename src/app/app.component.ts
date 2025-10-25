
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService, UserProfile } from './services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { BurgerMenuComponent } from './burger-menu/burger-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, CookieConsentComponent, ChatbotComponent, BurgerMenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AfroConnect';
  user$: Observable<User | null>;

  isMobile: boolean = false;
  isHilfePage: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.user$;
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });

    this.router.events.subscribe(() => {
      this.isHilfePage = this.router.url === '/hilfe';
    });
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
