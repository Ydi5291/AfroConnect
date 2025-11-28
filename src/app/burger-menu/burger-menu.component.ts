import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.css']
})
export class BurgerMenuComponent implements OnInit, OnDestroy {
          installPWA() {
            if (this.deferredPrompt) {
              this.deferredPrompt.prompt();
              this.deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('PWA install accepted');
                } else {
                  console.log('PWA install dismissed');
                }
                this.deferredPrompt = null;
              });
            }
          }
          isLoggedIn = false; // Variable isLoggedIn unchanged

        updateTranslations() {
          this.menuItems = {
            about: this.languageService.translate('nav.about'),
            addShop: this.languageService.translate('nav.addShop'),
            gallery: this.languageService.translate('nav.gallery'),
            pricing: this.languageService.translate('nav.pricing'),
            join: this.languageService.translate('nav.join'),
              // installPWA supprimé
            contact: this.languageService.translate('nav.contact'),
            impressum: this.languageService.translate('nav.impressum'),
            terms: this.languageService.translate('nav.terms'),
            privacy: this.languageService.translate('nav.privacy'),
            help: this.languageService.translate('nav.help'),
            logout: this.languageService.translate('nav.logout'),
            closeMenu: this.languageService.translate('nav.closeMenu'),
            openMenu: this.languageService.translate('nav.openMenu')
          };
        }
      ngOnInit() {
        this.langSub = this.languageService.currentLanguage$.subscribe(() => {
          this.updateTranslations();
        });
        this.updateTranslations();
        // Vérifier l'état de connexion
        this.auth.onAuthStateChanged(user => {
          this.isLoggedIn = !!user;
        });
          // Event listener beforeinstallprompt supprimé
      }

      ngOnDestroy() {
        this.langSub?.unsubscribe();
      }
    @ViewChild('burgerBtn', { static: false }) burgerBtn!: ElementRef<HTMLButtonElement>;
    @ViewChild('menuPanel', { static: false }) menuPanel!: ElementRef<HTMLElement>;
    @ViewChild('closeBtn', { static: false }) closeBtn!: ElementRef<HTMLButtonElement>;

    constructor(
      private languageService: LanguageService,
      private auth: Auth,
      private router: Router
    ) {}
  // deferredPrompt supprimé
  menuOpen = false;
  private langSub?: Subscription;

  menuItems = {
    about: 'Über uns',
    addShop: 'Geschäft hinzufügen',
    gallery: 'Galerie',
    pricing: 'Premium',
    join: 'Beitreten',
    installPWA: 'App installieren',
    contact: 'Kontakt',
    impressum: 'Impressum',
    terms: 'AGB',
    privacy: 'Datenschutz',
    help: 'Hilfe',
    logout: 'Abmelden',
    closeMenu: 'Menü schließen',
    openMenu: 'Menü öffnen'
  };

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      setTimeout(() => this.trapFocus(), 50);
      document.addEventListener('keydown', this.handleKeydown, true);
    } else {
      this.releaseFocus();
      document.removeEventListener('keydown', this.handleKeydown, true);
    }
  }

  closeMenu() {
    this.menuOpen = false;
    this.releaseFocus();
    document.removeEventListener('keydown', this.handleKeydown, true);
  }

  private trapFocus() {
    try {
      const panel = this.menuPanel?.nativeElement;
      const focusable = panel?.querySelectorAll<HTMLElement>("a, button, [tabindex]:not([tabindex='-1'])");
      if (focusable && focusable.length > 0) {
        // focus sur le premier élément
        focusable[0].focus();
      }
    } catch (e) {
      // noop
    }
  }

  private releaseFocus() {
    try {
      this.burgerBtn?.nativeElement?.focus();
    } catch (e) {
      // noop
    }
  }

  // Gestion des touches : Escape pour fermer, Tab pour boucler le focus (focus trap strict)
  private handleKeydown = (ev: KeyboardEvent) => {
    // Fermer avec Escape
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.closeMenu();
      return;
    }

    // Trap focus sur Tab
    if (ev.key === 'Tab') {
      try {
        const panel = this.menuPanel?.nativeElement;
        if (!panel) return;
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>("a, button, [tabindex]:not([tabindex='-1'])"))
          .filter(el => !el.hasAttribute('disabled'));
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (ev.shiftKey) {
          // Shift + Tab : si on est sur le premier, passer au dernier
          if (active === first || active === panel) {
            ev.preventDefault();
            last.focus();
          }
        } else {
          // Tab : si on est sur le dernier, revenir au premier
          if (active === last) {
            ev.preventDefault();
            first.focus();
          }
        }
      } catch (e) {
        // noop
      }
    }
  }

  // Déconnexion de l'utilisateur
  async logout() {
    try {
      await signOut(this.auth);
      this.closeMenu();
      this.router.navigate(['/']);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
