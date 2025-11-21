import { Directive, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from '../services/scroll.service';

/**
 * Directive pour ajouter un scroll smooth automatique aux liens et boutons
 * Usage: <a smoothScroll>Lien</a> ou <button smoothScroll>Bouton</button>
 */
@Directive({
  selector: '[smoothScroll]',
  standalone: true
})
export class SmoothScrollDirective {
  @Input() scrollTarget?: string; // ID de l'élément cible (optionnel)
  @Input() scrollOffset: number = 80; // Offset pour le header fixe

  constructor(
    private router: Router,
    private scrollService: ScrollService
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    // Si un target est spécifié, scroller vers cet élément
    if (this.scrollTarget) {
      event.preventDefault();
      this.scrollService.scrollToElement(this.scrollTarget, this.scrollOffset);
    } else {
      // Sinon, juste scroller vers le top après la navigation
      setTimeout(() => {
        this.scrollService.scrollToTop();
      }, 100);
    }
  }
}
