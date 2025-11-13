import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-burger-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.css']
})
export class BurgerMenuComponent {
  menuOpen = false;

  @ViewChild('burgerBtn', { static: false }) burgerBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('menuPanel', { static: false }) menuPanel!: ElementRef<HTMLElement>;
  @ViewChild('closeBtn', { static: false }) closeBtn!: ElementRef<HTMLButtonElement>;

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
}
