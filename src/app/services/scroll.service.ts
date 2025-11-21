import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  /**
   * Scroll smooth vers le haut de la page
   */
  scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
    window.scrollTo({
      top: 0,
      behavior: behavior
    });
  }

  /**
   * Scroll smooth vers un élément spécifique par ID
   * @param elementId - ID de l'élément (sans le #)
   * @param offset - Décalage optionnel en pixels (pour le header fixe)
   */
  scrollToElement(elementId: string, offset: number = 80): void {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Scroll smooth vers une position Y spécifique
   * @param yPosition - Position Y en pixels
   */
  scrollToPosition(yPosition: number): void {
    window.scrollTo({
      top: yPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Scroll smooth avec décalage
   * @param element - Élément HTML vers lequel scroller
   * @param offset - Décalage en pixels
   */
  scrollToElementWithOffset(element: HTMLElement, offset: number = 80): void {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * Vérifier si un élément est visible dans le viewport
   * @param element - Élément à vérifier
   */
  isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Scroll smooth vers un élément avec animation CSS
   * @param selector - Sélecteur CSS de l'élément
   */
  scrollToSelector(selector: string, offset: number = 80): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      this.scrollToElementWithOffset(element, offset);
    }
  }

  /**
   * Désactiver temporairement le scroll smooth (utile pour les animations)
   */
  disableSmoothScroll(): void {
    document.documentElement.style.scrollBehavior = 'auto';
  }

  /**
   * Réactiver le scroll smooth
   */
  enableSmoothScroll(): void {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /**
   * Obtenir la position de scroll actuelle
   */
  getCurrentScrollPosition(): number {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  /**
   * Vérifier si on est en haut de la page
   */
  isAtTop(threshold: number = 100): boolean {
    return this.getCurrentScrollPosition() < threshold;
  }

  /**
   * Vérifier si on est en bas de la page
   */
  isAtBottom(threshold: number = 100): boolean {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = this.getCurrentScrollPosition();
    const clientHeight = window.innerHeight;
    
    return scrollHeight - scrollTop - clientHeight < threshold;
  }
}
