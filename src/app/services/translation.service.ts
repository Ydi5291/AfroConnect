import { Injectable, inject } from '@angular/core';
import { LanguageService, Language } from './language.service';

export type BusinessType = 'restaurant' | 'epicerie' | 'coiffeur' | 'vetement' | 'services';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private languageService = inject(LanguageService);

  // Traductions multilingues des types d'entreprises
  private readonly businessTypeTranslations: Record<Language, Record<BusinessType, string>> = {
    de: {
      restaurant: 'Restaurant',
      epicerie: 'Lebensmittelgeschäft', 
      coiffeur: 'Friseur',
      vetement: 'Modegeschäft',
      services: 'Dienstleistungen'
    },
    en: {
      restaurant: 'Restaurant',
      epicerie: 'Grocery Store', 
      coiffeur: 'Hairdresser',
      vetement: 'Fashion Store',
      services: 'Services'
    },
    fr: {
      restaurant: 'Restaurant',
      epicerie: 'Épicerie', 
      coiffeur: 'Coiffeur',
      vetement: 'Boutique de mode',
      services: 'Services'
    },
    it: {
      restaurant: 'Ristorante',
      epicerie: 'Negozio di alimentari', 
      coiffeur: 'Parrucchiere',
      vetement: 'Negozio di moda',
      services: 'Servizi'
    },
    es: {
      restaurant: 'Restaurante',
      epicerie: 'Tienda de alimentación', 
      coiffeur: 'Peluquería',
      vetement: 'Tienda de moda',
      services: 'Servicios'
    }
  };

  // Traductions multilingues des types d'entreprises (pluriel)
  private readonly businessTypePlural: Record<Language, Record<BusinessType, string>> = {
    de: {
      restaurant: 'Restaurants',
      epicerie: 'Lebensmittelgeschäfte', 
      coiffeur: 'Friseure',
      vetement: 'Modegeschäfte',
      services: 'Dienstleistungen'
    },
    en: {
      restaurant: 'Restaurants',
      epicerie: 'Grocery Stores', 
      coiffeur: 'Hairdressers',
      vetement: 'Fashion Stores',
      services: 'Services'
    },
    fr: {
      restaurant: 'Restaurants',
      epicerie: 'Épiceries', 
      coiffeur: 'Coiffeurs',
      vetement: 'Boutiques de mode',
      services: 'Services'
    },
    it: {
      restaurant: 'Ristoranti',
      epicerie: 'Negozi di alimentari', 
      coiffeur: 'Parrucchieri',
      vetement: 'Negozi di moda',
      services: 'Servizi'
    },
    es: {
      restaurant: 'Restaurantes',
      epicerie: 'Tiendas de alimentación', 
      coiffeur: 'Peluquerías',
      vetement: 'Tiendas de moda',
      services: 'Servicios'
    }
  };

  // Icônes des types d'entreprises
  private readonly businessTypeIcons: Record<BusinessType, string> = {
    restaurant: '🍽️',
    epicerie: '🛒',
    coiffeur: '✂️',
    vetement: '👗',
    services: '🏦'
  };

  // Messages d'erreur multilingues
  private readonly errorMessages: Record<Language, Record<string, string>> = {
    de: {
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
    },
    en: {
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Wrong password',
      'auth/email-already-in-use': 'Email address is already in use',
      'auth/weak-password': 'Password is too weak',
      'auth/invalid-email': 'Invalid email address',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups for this website.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled',
      'auth/cancelled-popup-request': 'Sign-in was cancelled',
      'popup-blocked': 'Popup was blocked by your browser',
      'connection-error': 'Connection error. Check your internet connection.',
      'general-error': 'An error occurred. Please try again.'
    },
    fr: {
      'auth/user-not-found': 'Utilisateur non trouvé',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/email-already-in-use': 'L\'adresse e-mail est déjà utilisée',
      'auth/weak-password': 'Le mot de passe est trop faible',
      'auth/invalid-email': 'Adresse e-mail non valide',
      'auth/popup-blocked': 'La fenêtre popup a été bloquée. Veuillez autoriser les popups pour ce site.',
      'auth/popup-closed-by-user': 'La connexion a été annulée',
      'auth/cancelled-popup-request': 'La connexion a été annulée',
      'popup-blocked': 'La popup a été bloquée par votre navigateur',
      'connection-error': 'Erreur de connexion. Vérifiez votre connexion Internet.',
      'general-error': 'Une erreur s\'est produite. Veuillez réessayer.'
    },
    it: {
      'auth/user-not-found': 'Utente non trovato',
      'auth/wrong-password': 'Password errata',
      'auth/email-already-in-use': 'L\'indirizzo email è già in uso',
      'auth/weak-password': 'La password è troppo debole',
      'auth/invalid-email': 'Indirizzo email non valido',
      'auth/popup-blocked': 'Il popup è stato bloccato. Consenti i popup per questo sito.',
      'auth/popup-closed-by-user': 'L\'accesso è stato annullato',
      'auth/cancelled-popup-request': 'L\'accesso è stato annullato',
      'popup-blocked': 'Il popup è stato bloccato dal tuo browser',
      'connection-error': 'Errore di connessione. Controlla la tua connessione Internet.',
      'general-error': 'Si è verificato un errore. Riprova.'
    },
    es: {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'La dirección de correo ya está en uso',
      'auth/weak-password': 'La contraseña es demasiado débil',
      'auth/invalid-email': 'Dirección de correo no válida',
      'auth/popup-blocked': 'El popup fue bloqueado. Por favor, permite popups para este sitio.',
      'auth/popup-closed-by-user': 'El inicio de sesión fue cancelado',
      'auth/cancelled-popup-request': 'El inicio de sesión fue cancelado',
      'popup-blocked': 'El popup fue bloqueado por tu navegador',
      'connection-error': 'Error de conexión. Verifica tu conexión a Internet.',
      'general-error': 'Ocurrió un error. Por favor, inténtalo de nuevo.'
    }
  };

  // Messages généraux multilingues
  private readonly generalMessages: Record<Language, Record<string, string>> = {
    de: {
      'login-success': 'Erfolgreich angemeldet!',
      'logout-success': 'Erfolgreich abgemeldet!',
      'registration-success': 'Konto erfolgreich erstellt!',
      'data-saved': 'Daten erfolgreich gespeichert!',
      'data-deleted': 'Daten erfolgreich gelöscht!',
      'loading': 'Wird geladen...',
      'saving': 'Wird gespeichert...',
      'confirma-delete': 'Sind Sie sicher, dass Sie dies löschen möchten?'
    },
    en: {
      'login-success': 'Successfully logged in!',
      'logout-success': 'Successfully logged out!',
      'registration-success': 'Account successfully created!',
      'data-saved': 'Data successfully saved!',
      'data-deleted': 'Data successfully deleted!',
      'loading': 'Loading...',
      'saving': 'Saving...',
      'confirma-delete': 'Are you sure you want to delete this?'
    },
    fr: {
      'login-success': 'Connexion réussie!',
      'logout-success': 'Déconnexion réussie!',
      'registration-success': 'Compte créé avec succès!',
      'data-saved': 'Données enregistrées avec succès!',
      'data-deleted': 'Données supprimées avec succès!',
      'loading': 'Chargement...',
      'saving': 'Enregistrement...',
      'confirma-delete': 'Êtes-vous sûr de vouloir supprimer ceci?'
    },
    it: {
      'login-success': 'Accesso effettuato con successo!',
      'logout-success': 'Disconnessione effettuata con successo!',
      'registration-success': 'Account creato con successo!',
      'data-saved': 'Dati salvati con successo!',
      'data-deleted': 'Dati eliminati con successo!',
      'loading': 'Caricamento...',
      'saving': 'Salvataggio...',
      'confirma-delete': 'Sei sicuro di voler eliminare questo?'
    },
    es: {
      'login-success': '¡Sesión iniciada con éxito!',
      'logout-success': '¡Sesión cerrada con éxito!',
      'registration-success': '¡Cuenta creada con éxito!',
      'data-saved': '¡Datos guardados con éxito!',
      'data-deleted': '¡Datos eliminados con éxito!',
      'loading': 'Cargando...',
      'saving': 'Guardando...',
      'confirma-delete': '¿Estás seguro de que quieres eliminar esto?'
    }
  };

  /**
   * Traduit un type d'entreprise dans la langue actuelle
   */
  getBusinessTypeName(type: BusinessType, plural: boolean = false): string {
    const currentLang = this.languageService.getCurrentLanguage();
    if (plural) {
      return this.businessTypePlural[currentLang]?.[type] || type;
    }
    return this.businessTypeTranslations[currentLang]?.[type] || type;
  }

  /**
   * Obtient l'icône pour un type d'entreprise
   */
  getBusinessTypeIcon(type: BusinessType): string {
    return this.businessTypeIcons[type] || '🏪';
  }

  /**
   * Obtient l'icône + nom dans la langue actuelle
   */
  getBusinessTypeDisplay(type: BusinessType, plural: boolean = false): string {
    const icon = this.getBusinessTypeIcon(type);
    const name = this.getBusinessTypeName(type, plural);
    return `${icon} ${name}`;
  }

  /**
   * Traduit un message d'erreur dans la langue actuelle
   */
  getErrorMessage(errorCode: string): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return this.errorMessages[currentLang]?.[errorCode] || this.errorMessages[currentLang]?.['general-error'] || errorCode;
  }

  /**
   * Traduit un message général dans la langue actuelle
   */
  getMessage(key: string): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return this.generalMessages[currentLang]?.[key] || key;
  }

  /**
   * Obtient tous les types d'entreprises pour les sélecteurs
   */
  getAllBusinessTypes(): Array<{value: BusinessType, label: string, icon: string}> {
    const currentLang = this.languageService.getCurrentLanguage();
    return Object.keys(this.businessTypeTranslations[currentLang]).map(type => ({
      value: type as BusinessType,
      label: this.businessTypeTranslations[currentLang][type as BusinessType],
      icon: this.businessTypeIcons[type as BusinessType]
    }));
  }
}