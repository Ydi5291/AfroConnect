import { Component, OnInit } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService, UserProfile } from './services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, CookieConsentComponent, ChatbotComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showChat: boolean = false;
  title = 'AfroConnect';
  user$: Observable<User | null>;

  isMobile: boolean = false;
  isHilfePage: boolean = false;

  // slideshowImages = [
  //   'assets/header-bg/Alloco2.jpg',
  //   'assets/header-bg/Avocados.jpg',
  //   'assets/header-bg/Bissap.png',
  //   'assets/header-bg/Chips2.jpg',
  //   'assets/header-bg/Getraenke.jpg',
  //   'assets/header-bg/Guinness.jpg',
  //   'assets/header-bg/Ignam.jpg',
  //   'assets/header-bg/NIDO.jpg',
  //   'assets/header-bg/Schill.jpg',
  //   'assets/header-bg/Vimto.jpg',
  //   'assets/header-bg/vitamalt.jpg',
  //   'assets/header-bg/Zitronen.jpg'
  // ];
  currentSlide = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.user$;
    this.isMobile = window.innerWidth <= 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHilfePage = event.urlAfterRedirects === '/hilfe';
     
      });
   
    const env = require('../environments/environment');
    console.log('Firebase config utilisée:', env.environment.firebase);
  }

  toggleChatFromParent(): void {
    this.showChat = !this.showChat;
    console.log('[AppComponent] toggleChatFromParent appelé, showChat:', this.showChat);
  }

  ngOnInit() {
    // ...autres initialisations...
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/gallery']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
