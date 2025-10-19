import { Injectable } from '@angular/core';

export type BusinessType = 'restaurant' | 'epicerie' | 'coiffeur' | 'vetement' | 'services';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  // 🇩🇪 Traductions des types d'entreprises
  private readonly businessTypeTranslations: Record<BusinessType, string> = {
    restaurant: 'Restaurant',
    epicerie: 'Lebensmittelgeschäft', 
    coiffeur: 'Friseur',
    vetement: 'Modegeschäft',
    services: 'Dienstleistungen'
  };

  // 🇩🇪 Traductions des types d'entreprises (pluriel)
  private readonly businessTypePlural: Record<BusinessType, string> = {
    restaurant: 'Restaurants',
    epicerie: 'Lebensmittelgeschäfte', 
    coiffeur: 'Friseure',
    vetement: 'Modegeschäfte',
    services: 'Dienstleistungen'
  };

  // 🇩🇪 Icônes des types d'entreprises
  private readonly businessTypeIcons: Record<BusinessType, string> = {
    restaurant: '🍽️',
    epicerie: '🛒',
    coiffeur: '✂️',
    vetement: '👗',
    services: '🏦'
  };

  // 🇩🇪 Messages d'erreur en allemand
  private readonly errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Benutzer nicht gefunden',
    'auth/wrong-password': 'Falsches Passwort',
    'auth/email-already-in-use': 'E-Mail-Adresse wird bereits verwendet',
    'auth/weak-password': 'Passwort ist zu schwach',
    'auth/invalid-email': 'Ungültige E-Mail-Adresse',
    'auth/popup-blocked': 'Popup wurde blockiert. Bitte erlauben Sie Popups für diese Website.',
    'auth/popup-closed-by-user': 'Anmeldung wurde abgebrochen',
    'auth/cancelled-popup-request': 'Anmeldung wurde abgebrochen',
    'popup-blocked': 'Popup wurde von Ihrem Browser blockiert',
    'connection-error': 'Verbindungsfehler. Überprüfen Sie Ihre Internetverbindung.',
    'general-error': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
  };

  // 🇩🇪 Messages généraux
  private readonly generalMessages: Record<string, string> = {
    'login-success': 'Erfolgreich angemeldet!',
    'logout-success': 'Erfolgreich abgemeldet!',
    'registration-success': 'Konto erfolgreich erstellt!',
    'data-saved': 'Daten erfolgreich gespeichert!',
    'data-deleted': 'Daten erfolgreich gelöscht!',
    'loading': 'Wird geladen...',
    'saving': 'Wird gespeichert...',
    'confirma-delete': 'Sind Sie sicher, dass Sie dies löschen möchten?'
  };

  /**
   * Traduit un type d'entreprise en allemand
   */
  getBusinessTypeName(type: BusinessType, plural: boolean = false): string {
    if (plural) {
      return this.businessTypePlural[type] || type;
    }
    return this.businessTypeTranslations[type] || type;
  }

  /**
   * Obtient l'icône pour un type d'entreprise
   */
  getBusinessTypeIcon(type: BusinessType): string {
    return this.businessTypeIcons[type] || '🏪';
  }

  /**
   * Obtient l'icône + nom en allemand
   */
  getBusinessTypeDisplay(type: BusinessType, plural: boolean = false): string {
    const icon = this.getBusinessTypeIcon(type);
    const name = this.getBusinessTypeName(type, plural);
    return `${icon} ${name}`;
  }

  /**
   * Traduit un message d'erreur en allemand
   */
  getErrorMessage(errorCode: string): string {
    return this.errorMessages[errorCode] || this.errorMessages['general-error'];
  }

  /**
   * Traduit un message général en allemand
   */
  getMessage(key: string): string {
    return this.generalMessages[key] || key;
  }

  /**
   * Obtient tous les types d'entreprises pour les sélecteurs
   */
  getAllBusinessTypes(): Array<{value: BusinessType, label: string, icon: string}> {
    return Object.keys(this.businessTypeTranslations).map(type => ({
      value: type as BusinessType,
      label: this.businessTypeTranslations[type as BusinessType],
      icon: this.businessTypeIcons[type as BusinessType]
    }));
  }
}