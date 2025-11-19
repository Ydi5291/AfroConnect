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
    },
    pt: {
      restaurant: 'Restaurante',
      epicerie: 'Mercearia', 
      coiffeur: 'Cabeleireiro',
      vetement: 'Loja de roupas',
      services: 'Serviços'
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
    },
    pt: {
      restaurant: 'Restaurantes',
      epicerie: 'Mercearias', 
      coiffeur: 'Cabeleireiros',
      vetement: 'Lojas de roupas',
      services: 'Serviços'
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
    },
    pt: {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'O endereço de e-mail já está em uso',
      'auth/weak-password': 'A senha é muito fraca',
      'auth/invalid-email': 'Endereço de e-mail inválido',
      'auth/popup-blocked': 'O popup foi bloqueado. Por favor, permita popups para este site.',
      'auth/popup-closed-by-user': 'O login foi cancelado',
      'auth/cancelled-popup-request': 'O login foi cancelado',
      'popup-blocked': 'O popup foi bloqueado pelo seu navegador',
      'connection-error': 'Erro de conexão. Verifique sua conexão com a Internet.',
      'general-error': 'Ocorreu um erro. Por favor, tente novamente.'
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
      'confirma-delete': 'Sind Sie sicher, dass Sie dies löschen möchten?',
      // JOIN PAGE
      'JOIN.TITLE': 'Kostenlos registrieren',
      'JOIN.SUBTITLE': 'Ihr Geschäft in 2 Minuten sichtbar machen',
      'JOIN.SHOP_NAME': 'Name des Geschäfts',
      'JOIN.SHOP_NAME_PLACEHOLDER': 'z.B. Afro Shop Berlin',
      'JOIN.OWNER_NAME': 'Ihr Name',
      'JOIN.OWNER_NAME_PLACEHOLDER': 'z.B. Max Mustermann',
      'JOIN.PHONE': 'Telefonnummer',
      'JOIN.PHONE_PLACEHOLDER': '+49 123 456 789',
      'JOIN.EMAIL': 'E-Mail (optional)',
      'JOIN.EMAIL_PLACEHOLDER': 'info@meinshop.de',
      'JOIN.ADDRESS': 'Straße und Hausnummer',
      'JOIN.ADDRESS_PLACEHOLDER': 'Musterstraße 123',
      'JOIN.PLZ': 'Postleitzahl',
      'JOIN.PLZ_PLACEHOLDER': '12345',
      'JOIN.CITY': 'Stadt',
      'JOIN.CITY_PLACEHOLDER': 'Berlin',
      'JOIN.CATEGORY': 'Kategorie',
      'JOIN.CATEGORY_SHOP': 'Geschäft / Laden',
      'JOIN.CATEGORY_RESTAURANT': 'Restaurant',
      'JOIN.CATEGORY_SALON': 'Friseursalon',
      'JOIN.CATEGORY_OTHER': 'Andere',
      'JOIN.NOTES': 'Zusätzliche Informationen',
      'JOIN.NOTES_PLACEHOLDER': 'z.B. Öffnungszeiten, Spezialitäten...',
      'JOIN.SUBMIT_BUTTON': 'Jetzt kostenlos registrieren',
      'JOIN.WHATSAPP_BUTTON': 'Per WhatsApp anmelden',
      'JOIN.SUCCESS_TITLE': 'Vielen Dank!',
      'JOIN.SUCCESS_MESSAGE': 'Wir haben Ihre Anfrage erhalten und melden uns bald bei Ihnen.',
      'JOIN.ERROR_TITLE': 'Fehler',
      'JOIN.ERROR_REQUIRED_FIELDS': 'Bitte füllen Sie alle Pflichtfelder aus.',
      'JOIN.ERROR_SUBMIT': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      'JOIN.BENEFIT_1': 'Kostenlose Sichtbarkeit für Ihr Geschäft',
      'JOIN.BENEFIT_2': 'Über 500 Nutzer pro Monat',
      'JOIN.BENEFIT_3': 'Einfache Verwaltung',
      'JOIN.BENEFIT_4': '100% kostenlos – keine versteckten Kosten'
    },
    en: {
      'login-success': 'Successfully logged in!',
      'logout-success': 'Successfully logged out!',
      'registration-success': 'Account successfully created!',
      'data-saved': 'Data successfully saved!',
      'data-deleted': 'Data successfully deleted!',
      'loading': 'Loading...',
      'saving': 'Saving...',
      'confirma-delete': 'Are you sure you want to delete this?',
      // JOIN PAGE
      'JOIN.TITLE': 'Register for free',
      'JOIN.SUBTITLE': 'Make your business visible in 2 minutes',
      'JOIN.SHOP_NAME': 'Shop name',
      'JOIN.SHOP_NAME_PLACEHOLDER': 'e.g. Afro Shop Berlin',
      'JOIN.OWNER_NAME': 'Your name',
      'JOIN.OWNER_NAME_PLACEHOLDER': 'e.g. John Doe',
      'JOIN.PHONE': 'Phone number',
      'JOIN.PHONE_PLACEHOLDER': '+49 123 456 789',
      'JOIN.EMAIL': 'Email (optional)',
      'JOIN.EMAIL_PLACEHOLDER': 'info@myshop.com',
      'JOIN.ADDRESS': 'Street and number',
      'JOIN.ADDRESS_PLACEHOLDER': 'Main Street 123',
      'JOIN.PLZ': 'Postal code',
      'JOIN.PLZ_PLACEHOLDER': '12345',
      'JOIN.CITY': 'City',
      'JOIN.CITY_PLACEHOLDER': 'Berlin',
      'JOIN.CATEGORY': 'Category',
      'JOIN.CATEGORY_SHOP': 'Shop / Store',
      'JOIN.CATEGORY_RESTAURANT': 'Restaurant',
      'JOIN.CATEGORY_SALON': 'Hair Salon',
      'JOIN.CATEGORY_OTHER': 'Other',
      'JOIN.NOTES': 'Additional information',
      'JOIN.NOTES_PLACEHOLDER': 'e.g. Opening hours, specialties...',
      'JOIN.SUBMIT_BUTTON': 'Register for free now',
      'JOIN.WHATSAPP_BUTTON': 'Register via WhatsApp',
      'JOIN.SUCCESS_TITLE': 'Thank you!',
      'JOIN.SUCCESS_MESSAGE': 'We have received your request and will contact you soon.',
      'JOIN.ERROR_TITLE': 'Error',
      'JOIN.ERROR_REQUIRED_FIELDS': 'Please fill in all required fields.',
      'JOIN.ERROR_SUBMIT': 'An error occurred. Please try again.',
      'JOIN.BENEFIT_1': 'Free visibility for your business',
      'JOIN.BENEFIT_2': 'Over 500 users per month',
      'JOIN.BENEFIT_3': 'Easy management',
      'JOIN.BENEFIT_4': '100% free – no hidden costs'
    },
    fr: {
      'login-success': 'Connexion réussie!',
      'logout-success': 'Déconnexion réussie!',
      'registration-success': 'Compte créé avec succès!',
      'data-saved': 'Données enregistrées avec succès!',
      'data-deleted': 'Données supprimées avec succès!',
      'loading': 'Chargement...',
      'saving': 'Enregistrement...',
      'confirma-delete': 'Êtes-vous sûr de vouloir supprimer ceci?',
      // JOIN PAGE
      'JOIN.TITLE': 'Inscription gratuite',
      'JOIN.SUBTITLE': 'Rendez votre commerce visible en 2 minutes',
      'JOIN.SHOP_NAME': 'Nom du commerce',
      'JOIN.SHOP_NAME_PLACEHOLDER': 'ex. Afro Shop Paris',
      'JOIN.OWNER_NAME': 'Votre nom',
      'JOIN.OWNER_NAME_PLACEHOLDER': 'ex. Jean Dupont',
      'JOIN.PHONE': 'Numéro de téléphone',
      'JOIN.PHONE_PLACEHOLDER': '+33 1 23 45 67 89',
      'JOIN.EMAIL': 'Email (optionnel)',
      'JOIN.EMAIL_PLACEHOLDER': 'info@moncommerce.fr',
      'JOIN.ADDRESS': 'Rue et numéro',
      'JOIN.ADDRESS_PLACEHOLDER': 'Rue de la Paix 123',
      'JOIN.PLZ': 'Code postal',
      'JOIN.PLZ_PLACEHOLDER': '75001',
      'JOIN.CITY': 'Ville',
      'JOIN.CITY_PLACEHOLDER': 'Paris',
      'JOIN.CATEGORY': 'Catégorie',
      'JOIN.CATEGORY_SHOP': 'Commerce / Boutique',
      'JOIN.CATEGORY_RESTAURANT': 'Restaurant',
      'JOIN.CATEGORY_SALON': 'Salon de coiffure',
      'JOIN.CATEGORY_OTHER': 'Autre',
      'JOIN.NOTES': 'Informations supplémentaires',
      'JOIN.NOTES_PLACEHOLDER': 'ex. Horaires, spécialités...',
      'JOIN.SUBMIT_BUTTON': 'S\'inscrire gratuitement',
      'JOIN.WHATSAPP_BUTTON': 'S\'inscrire via WhatsApp',
      'JOIN.SUCCESS_TITLE': 'Merci !',
      'JOIN.SUCCESS_MESSAGE': 'Nous avons bien reçu votre demande et vous contacterons bientôt.',
      'JOIN.ERROR_TITLE': 'Erreur',
      'JOIN.ERROR_REQUIRED_FIELDS': 'Veuillez remplir tous les champs obligatoires.',
      'JOIN.ERROR_SUBMIT': 'Une erreur s\'est produite. Veuillez réessayer.',
      'JOIN.BENEFIT_1': 'Visibilité gratuite pour votre commerce',
      'JOIN.BENEFIT_2': 'Plus de 500 utilisateurs par mois',
      'JOIN.BENEFIT_3': 'Gestion simple',
      'JOIN.BENEFIT_4': '100% gratuit – sans frais cachés'
    },
    it: {
      'login-success': 'Accesso effettuato con successo!',
      'logout-success': 'Disconnessione effettuata con successo!',
      'registration-success': 'Account creato con successo!',
      'data-saved': 'Dati salvati con successo!',
      'data-deleted': 'Dati eliminati con successo!',
      'loading': 'Caricamento...',
      'saving': 'Salvataggio...',
      'confirma-delete': 'Sei sicuro di voler eliminare questo?',
      // JOIN PAGE
      'JOIN.TITLE': 'Registrazione gratuita',
      'JOIN.SUBTITLE': 'Rendi visibile la tua attività in 2 minuti',
      'JOIN.SHOP_NAME': 'Nome del negozio',
      'JOIN.SHOP_NAME_PLACEHOLDER': 'es. Afro Shop Roma',
      'JOIN.OWNER_NAME': 'Il tuo nome',
      'JOIN.OWNER_NAME_PLACEHOLDER': 'es. Mario Rossi',
      'JOIN.PHONE': 'Numero di telefono',
      'JOIN.PHONE_PLACEHOLDER': '+39 123 456 789',
      'JOIN.EMAIL': 'Email (opzionale)',
      'JOIN.EMAIL_PLACEHOLDER': 'info@mionegozio.it',
      'JOIN.ADDRESS': 'Via e numero',
      'JOIN.ADDRESS_PLACEHOLDER': 'Via Roma 123',
      'JOIN.PLZ': 'CAP',
      'JOIN.PLZ_PLACEHOLDER': '00100',
      'JOIN.CITY': 'Città',
      'JOIN.CITY_PLACEHOLDER': 'Roma',
      'JOIN.CATEGORY': 'Categoria',
      'JOIN.CATEGORY_SHOP': 'Negozio',
      'JOIN.CATEGORY_RESTAURANT': 'Ristorante',
      'JOIN.CATEGORY_SALON': 'Parrucchiere',
      'JOIN.CATEGORY_OTHER': 'Altro',
      'JOIN.NOTES': 'Informazioni aggiuntive',
      'JOIN.NOTES_PLACEHOLDER': 'es. Orari, specialità...',
      'JOIN.SUBMIT_BUTTON': 'Registrati gratis ora',
      'JOIN.WHATSAPP_BUTTON': 'Registrati via WhatsApp',
      'JOIN.SUCCESS_TITLE': 'Grazie!',
      'JOIN.SUCCESS_MESSAGE': 'Abbiamo ricevuto la tua richiesta e ti contatteremo presto.',
      'JOIN.ERROR_TITLE': 'Errore',
      'JOIN.ERROR_REQUIRED_FIELDS': 'Compila tutti i campi obbligatori.',
      'JOIN.ERROR_SUBMIT': 'Si è verificato un errore. Riprova.',
      'JOIN.BENEFIT_1': 'Visibilità gratuita per la tua attività',
      'JOIN.BENEFIT_2': 'Oltre 500 utenti al mese',
      'JOIN.BENEFIT_3': 'Gestione semplice',
      'JOIN.BENEFIT_4': '100% gratis – nessun costo nascosto'
    },
    es: {
      'login-success': '¡Sesión iniciada con éxito!',
      'logout-success': '¡Sesión cerrada con éxito!',
      'registration-success': '¡Cuenta creada con éxito!',
      'data-saved': '¡Datos guardados con éxito!',
      'data-deleted': '¡Datos eliminados con éxito!',
      'loading': 'Cargando...',
      'saving': 'Guardando...',
      'confirma-delete': '¿Estás seguro de que quieres eliminar esto?',
      // JOIN PAGE
      'JOIN.TITLE': 'Registro gratuito',
      'JOIN.SUBTITLE': 'Haz visible tu negocio en 2 minutos',
      'JOIN.SHOP_NAME': 'Nombre del negocio',
      'JOIN.SHOP_NAME_PLACEHOLDER': 'ej. Afro Shop Madrid',
      'JOIN.OWNER_NAME': 'Tu nombre',
      'JOIN.OWNER_NAME_PLACEHOLDER': 'ej. Juan Pérez',
      'JOIN.PHONE': 'Número de teléfono',
      'JOIN.PHONE_PLACEHOLDER': '+34 123 456 789',
      'JOIN.EMAIL': 'Email (opcional)',
      'JOIN.EMAIL_PLACEHOLDER': 'info@minegocio.es',
      'JOIN.ADDRESS': 'Calle y número',
      'JOIN.ADDRESS_PLACEHOLDER': 'Calle Mayor 123',
      'JOIN.PLZ': 'Código postal',
      'JOIN.PLZ_PLACEHOLDER': '28001',
      'JOIN.CITY': 'Ciudad',
      'JOIN.CITY_PLACEHOLDER': 'Madrid',
      'JOIN.CATEGORY': 'Categoría',
      'JOIN.CATEGORY_SHOP': 'Tienda / Comercio',
      'JOIN.CATEGORY_RESTAURANT': 'Restaurante',
      'JOIN.CATEGORY_SALON': 'Peluquería',
      'JOIN.CATEGORY_OTHER': 'Otro',
      'JOIN.NOTES': 'Información adicional',
      'JOIN.NOTES_PLACEHOLDER': 'ej. Horarios, especialidades...',
      'JOIN.SUBMIT_BUTTON': 'Registrarse gratis ahora',
      'JOIN.WHATSAPP_BUTTON': 'Registrarse por WhatsApp',
      'JOIN.SUCCESS_TITLE': '¡Gracias!',
      'JOIN.SUCCESS_MESSAGE': 'Hemos recibido tu solicitud y te contactaremos pronto.',
      'JOIN.ERROR_TITLE': 'Error',
      'JOIN.ERROR_REQUIRED_FIELDS': 'Por favor, rellena todos los campos obligatorios.',
      'JOIN.ERROR_SUBMIT': 'Ocurrió un error. Por favor, inténtalo de nuevo.',
      'JOIN.BENEFIT_1': 'Visibilidad gratuita para tu negocio',
      'JOIN.BENEFIT_2': 'Más de 500 usuarios por mes',
      'JOIN.BENEFIT_3': 'Gestión sencilla',
      'JOIN.BENEFIT_4': '100% gratis – sin costes ocultos'
    },
    pt: {
      'login-success': 'Login realizado com sucesso!',
      'logout-success': 'Logout realizado com sucesso!',
      'registration-success': 'Conta criada com sucesso!',
      'data-saved': 'Dados salvos com sucesso!',
      'data-deleted': 'Dados excluídos com sucesso!',
      'loading': 'Carregando...',
      'saving': 'Salvando...',
      'confirma-delete': 'Tem certeza de que deseja excluir isso?',
      // JOIN PAGE
      'JOIN.TITLE': 'Cadastro gratuito',
      'JOIN.SUBTITLE': 'Torne seu negócio visível em 2 minutos',
      'JOIN.SHOP_NAME': 'Nome do negócio',
      'JOIN.SHOP_NAME_PLACEHOLDER': 'ex. Afro Shop Lisboa',
      'JOIN.OWNER_NAME': 'Seu nome',
      'JOIN.OWNER_NAME_PLACEHOLDER': 'ex. João Silva',
      'JOIN.PHONE': 'Número de telefone',
      'JOIN.PHONE_PLACEHOLDER': '+351 123 456 789',
      'JOIN.EMAIL': 'Email (opcional)',
      'JOIN.EMAIL_PLACEHOLDER': 'info@meunegocio.pt',
      'JOIN.ADDRESS': 'Rua e número',
      'JOIN.ADDRESS_PLACEHOLDER': 'Rua da Liberdade 123',
      'JOIN.PLZ': 'Código postal',
      'JOIN.PLZ_PLACEHOLDER': '1200-000',
      'JOIN.CITY': 'Cidade',
      'JOIN.CITY_PLACEHOLDER': 'Lisboa',
      'JOIN.CATEGORY': 'Categoria',
      'JOIN.CATEGORY_SHOP': 'Loja / Comércio',
      'JOIN.CATEGORY_RESTAURANT': 'Restaurante',
      'JOIN.CATEGORY_SALON': 'Salão de cabeleireiro',
      'JOIN.CATEGORY_OTHER': 'Outro',
      'JOIN.NOTES': 'Informações adicionais',
      'JOIN.NOTES_PLACEHOLDER': 'ex. Horários, especialidades...',
      'JOIN.SUBMIT_BUTTON': 'Cadastrar-se grátis agora',
      'JOIN.WHATSAPP_BUTTON': 'Cadastrar via WhatsApp',
      'JOIN.SUCCESS_TITLE': 'Obrigado!',
      'JOIN.SUCCESS_MESSAGE': 'Recebemos seu pedido e entraremos em contato em breve.',
      'JOIN.ERROR_TITLE': 'Erro',
      'JOIN.ERROR_REQUIRED_FIELDS': 'Por favor, preencha todos os campos obrigatórios.',
      'JOIN.ERROR_SUBMIT': 'Ocorreu um erro. Por favor, tente novamente.',
      'JOIN.BENEFIT_1': 'Visibilidade gratuita para seu negócio',
      'JOIN.BENEFIT_2': 'Mais de 500 usuários por mês',
      'JOIN.BENEFIT_3': 'Gestão simples',
      'JOIN.BENEFIT_4': '100% grátis – sem custos ocultos'
    }
  };

  /**
   * Alias pour getMessage() - utilisé par les composants
   */
  translate(key: string): string {
    return this.getMessage(key);
  }

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