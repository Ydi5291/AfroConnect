import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <button 
        class="lang-toggle-btn" 
        (click)="toggleDropdown()"
        [attr.aria-label]="'Select language'"
        [attr.aria-expanded]="isOpen">
        <span class="globe-icon">🌐</span>
        <span class="current-lang">{{ currentLanguage.toUpperCase() }}</span>
        <span class="arrow" [class.open]="isOpen">▼</span>
      </button>
      
      <div class="lang-dropdown" *ngIf="isOpen">
        <button 
          *ngFor="let lang of languages" 
          [class.active]="currentLanguage === lang"
          (click)="selectLanguage(lang)"
          class="lang-option"
          [attr.aria-label]="getLanguageName(lang)">
          <span class="flag">{{ getFlag(lang) }}</span>
          <span class="lang-name">{{ getLanguageName(lang) }}</span>
          <span class="checkmark" *ngIf="currentLanguage === lang">✓</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;
    }

    .lang-toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .lang-toggle-btn:hover {
      border-color: #1a8917;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(26, 137, 23, 0.2);
    }

    .globe-icon {
      font-size: 1.2rem;
    }

    .current-lang {
      font-weight: 700;
      color: #1a8917;
    }

    .arrow {
      font-size: 0.7rem;
      transition: transform 0.3s ease;
      color: #666;
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .lang-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: white;
      border: 2px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      min-width: 180px;
      overflow: hidden;
      z-index: 1000;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .lang-option {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      width: 100%;
      padding: 0.9rem 1.2rem;
      border: none;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      text-align: left;
      color: #333;
    }

    .lang-option:hover {
      background: #f0f8f0;
    }

    .lang-option.active {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      font-weight: 600;
    }

    .flag {
      font-size: 1.3rem;
    }

    .lang-name {
      flex: 1;
      font-weight: 500;
    }

    .checkmark {
      color: #1a8917;
      font-weight: 700;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .lang-toggle-btn {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
        gap: 0.3rem;
      }

      .globe-icon {
        font-size: 1rem;
      }
      
      .current-lang {
        display: none; /* Cacher le texte DE/EN/FR sur mobile */
      }

      .lang-dropdown {
        min-width: 150px;
        right: -10px; /* Décaler légèrement pour mobile */
      }

      .lang-option {
        padding: 0.7rem 0.9rem;
        font-size: 0.85rem;
      }
      
      .flag {
        font-size: 1.1rem;
      }
    }
  `]
})
export class LanguageSelectorComponent {
  private languageService = inject(LanguageService);
  
  languages: Language[] = ['de', 'en', 'fr', 'it', 'es'];
  currentLanguage: Language = 'de';
  isOpen = false;

  constructor() {
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });

    // Fermer le dropdown si on clique ailleurs
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
          this.isOpen = false;
        }
      });
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
    this.isOpen = false;
  }

  getLanguageName(lang: Language): string {
    const names: Record<Language, string> = {
      'de': 'Deutsch',
      'en': 'English',
      'fr': 'Français',
      'it': 'Italiano',
      'es': 'Español'
    };
    return names[lang];
  }

  getFlag(lang: Language): string {
    const flags: Record<Language, string> = {
      'de': '🇩🇪',
      'en': '🇬🇧',
      'fr': '🇫🇷',
      'it': '🇮🇹',
      'es': '🇪🇸'
    };
    return flags[lang];
  }
}
