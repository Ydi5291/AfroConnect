import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LanguageSelectorComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  slideshowImages = [
    '/assets/header-bg/Alloco2.jpg',
    '/assets/header-bg/Atchieke.jpg',
    '/assets/header-bg/Attieke.jpeg',
    '/assets/header-bg/Avocados.jpg',
    '/assets/header-bg/Bissap.png',
    '/assets/header-bg/Chips2.jpg',
    '/assets/header-bg/foutou.jpg',
    '/assets/header-bg/fufu.jpg',
    '/assets/header-bg/Guinness.jpg',
    '/assets/header-bg/Ignam.jpg',
    '/assets/header-bg/NIDO.jpg',
    '/assets/header-bg/Schill.jpg',
    '/assets/header-bg/Vimto.jpg',
    '/assets/header-bg/Getränke.jpg',
    '/assets/header-bg/vitamalt.jpg',
    '/assets/header-bg/Zitronen.jpg'
  ];
  currentSlide = 0;

  displayName: string | null = null;
  isLoggedIn: boolean = false;
  showAuthButtons: boolean = false; // Nouvelle propriété pour éviter le flash
  welcomeMessage: string = 'Verbinde dich mit der afrikanischen Community in Deutschland';
  private userSub: Subscription | null = null;
  private langSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slideshowImages.length;
    }, 5000); // 5 secondes par image, fade plus doux

    // Souscription à l'utilisateur authentifié pour afficher le message de bienvenue
    this.userSub = this.authService.user$.subscribe(user => {
      console.log('🔐 Header - User Observable triggered:', user);
      
      if (user) {
        this.isLoggedIn = true;
        this.showAuthButtons = false;
        this.displayName = (user.displayName && user.displayName.trim() !== '') ? user.displayName : (user.email || null);
        console.log('✅ Utilisateur connecté:', this.displayName);
      } else {
        this.isLoggedIn = false;
        // Petit délai pour éviter le flash lors du chargement initial
        setTimeout(() => {
          this.showAuthButtons = true;
          console.log('👤 Aucun utilisateur - Boutons affichés');
        }, 300);
        this.displayName = null;
      }
      console.log('� État final - isLoggedIn:', this.isLoggedIn, 'showAuthButtons:', this.showAuthButtons);
    });

    // Souscription aux changements de langue
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateWelcomeMessage();
    });
  }

  updateWelcomeMessage() {
    const messages = {
      'de': 'Verbinde dich mit der afrikanischen Community in Europa',
      'en': 'Connect with the African community in Europe',
      'fr': 'Connectez-vous avec la communauté africaine en Europe',
      'it': 'Connettiti con la comunità africana in Europa',
      'es': 'Conéctate con la comunidad africana en Europa',
      'pt': 'Conecte-se com a comunidade africana na Europa'
    };
    this.welcomeMessage = messages[this.languageService.getCurrentLanguage()];
  }

  async logout() {
    try {
      await this.authService.logout();
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }
}
