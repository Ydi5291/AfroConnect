import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'de' | 'en' | 'fr';

export interface Translation {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<Language>('de');
  public currentLanguage$: Observable<Language> = this.currentLanguageSubject.asObservable();

  private translations: Record<Language, Translation> = {
    de: {
      // Navigation
      'nav.gallery': 'Galerie',
      'nav.about': 'Über uns',
      'nav.contact': 'Kontakt',
      'nav.help': 'Hilfe',
      'nav.login': 'Anmelden',
      'nav.register': 'Registrieren',
      'nav.logout': 'Abmelden',
      'nav.addShop': 'Geschäft hinzufügen',
      'nav.impressum': 'Impressum',
      'nav.terms': 'AGB',
      'nav.privacy': 'Datenschutz',
      'nav.openMenu': 'Menü öffnen',
      'nav.closeMenu': 'Menü schließen',
      
      // Gallery page
      'gallery.discover': 'Entdecke',
      'gallery.shopsNearYou': 'afrikanische Geschäfte in deiner Nähe',
      'gallery.addShopBtn': 'Geschäft hinzufügen',
      'gallery.filterByType': 'Nach Type filtern:',
      'gallery.allTypes': 'Alle Typen',
      'gallery.activateGPS': 'GPS aktivieren',
      'gallery.searchRadius': 'Suche in 50km Umkreis',
      'gallery.around': 'um',
      'gallery.yourLocation': 'deinen Standort',
      'gallery.resultsCount': 'von',
      'gallery.shopsDisplayed': 'Afroshops angezeigt',
      'gallery.yourCity': 'Deine Stadt:',
      'gallery.anyCityPlaceholder': 'Jede deutsche Stadt...',
      'gallery.search': 'Suchen',
      'gallery.popularCities': 'Beliebte Städte...',
      'gallery.confirm': 'Bestätigen',
      'gallery.viewDetails': 'Details ansehen',
      'gallery.showOnMap': 'Karte anzeigen',
      'gallery.route': 'Route',
      'gallery.edit': 'Bearbeiten',
      
      // Home/Gallery
      'home.title': 'Entdecke afrikanische Geschäfte in Europa',
      'home.subtitle': 'Finde Restaurants, Läden, Friseure und mehr',
      'search.placeholder': 'Suche nach Geschäften...',
      'filter.city': 'Stadt filtern',
      'filter.type': 'Typ filtern',
      'filter.allTypes': 'Alle Typen',
      
      // Shop types
      'type.restaurant': 'Restaurant',
      'type.epicerie': 'Lebensmittel',
      'type.coiffeur': 'Friseur',
      'type.vetement': 'Mode',
      'type.services': 'Dienstleistungen',
      
      // Buttons
      'btn.details': 'Details',
      'btn.call': 'Anrufen',
      'btn.route': 'Route',
      'btn.save': 'Speichern',
      'btn.cancel': 'Abbrechen',
      'btn.edit': 'Bearbeiten',
      'btn.delete': 'Löschen',
      'btn.close': 'Schließen',
      'btn.back': 'Zurück',
      'btn.shop': 'Einkaufen',
      
      // About
      'about.title': 'Über uns',
      'about.slogan': 'Wir verbinden Afrika mit Europa',
      'about.intro': 'AfroConnect ist eine digitale Plattform, die geschaffen wurde, um die afrikanische Gemeinschaft in Deutschland und ganz Europa zu stärken und den Zugang zu afrikanischen Produkten und Dienstleistungen zu erleichtern.',
      'about.goal': 'Unser Ziel ist es, Menschen mit afrikanischen Wurzeln – sowie allen, die sich für afrikanische Kultur, Lebensmittel, Mode und Handwerk interessieren – mit afrikanischen Geschäften, Restaurants und Dienstleistern in Europa zu verbinden.',
      'about.impact': 'Das Projekt zielt auf eine starke und positive gesellschaftliche Wirkung für die Afro-Community und alle, die sich für afrikanische Kultur, Lebensmittel, Mode und mehr interessieren.',
      'about.meaning': 'Wie der Name schon sagt, steht AfroConnect für Verbindung: Wir bringen afrikanische Unternehmer*innen und Kund*innen zusammen, fördern ihre Sichtbarkeit und machen ihre Angebote in Deutschland und ganz Europa leichter zugänglich.',
      'about.features': 'Egal, ob du nach einem Afroshop, einem Restaurant mit afrikanischer Küche oder einem spezialisierten Friseursalon suchst – auf AfroConnect findest du alles an einem Ort.',
      'about.vision': 'Unsere Vision ist ein starkes, vernetztes und sichtbares afrikanisches Wirtschaftsnetzwerk in Europa – digital, offen und zugänglich für alle.',
      
      // Contact
      'contact.title': 'Kontakt',
      'contact.intro': 'Du hast Fragen, Feedback oder möchtest mitmachen? Schreib uns direkt über das Formular!',
      'contact.name': 'Name',
      'contact.email': 'E-Mail',
      'contact.message': 'Nachricht',
      'contact.submit': 'Absenden',
      'contact.thankYou': 'Danke für deine Nachricht!',
      'contact.response': 'Wir melden uns so schnell wie möglich bei dir.',
      'contact.otherOptions': 'Weitere Kontaktmöglichkeiten',
      
      // Help
      'help.title': 'Hilfe & Chatbot Diamal',
      'help.intro': 'Hier findest du Unterstützung und Antworten auf häufige Fragen. Unser Assistent Diamal hilft dir gerne weiter!',
      
      // Add Shop Form
      'addShop.titleAdd': 'Neues Geschäft hinzufügen',
      'addShop.titleEdit': 'Geschäft bearbeiten',
      'addShop.subtitleAdd': 'Teilen Sie Ihren Lieblings-Afroshop mit der Community!',
      'addShop.subtitleEdit': 'Aktualisieren Sie die Informationen',
      'addShop.backToGallery': 'Galerie',
      'addShop.quickAdd': 'Schnell hinzufügen',
      'addShop.quickAddDesc': 'Fügen Sie einen Link ein, um Informationen automatisch zu laden',
      'addShop.urlLabel': 'Google Maps, Facebook, Nextdoor oder Website URL',
      'addShop.import': 'Importieren',
      'addShop.loading': 'Lädt...',
      'addShop.orManual': 'oder manuell eingeben',
      'addShop.success': 'Erfolgreich!',
      'addShop.error': 'Fehler',
      
      // Image Detail / Shop Detail
      'detail.backToOverview': 'Zurück zur Übersicht',
      'detail.edit': 'bearbeiten',
      'detail.noImage': 'Kein Bild verfügbar',
      'detail.address': 'Adresse:',
      'detail.phone': 'Telefon:',
      'detail.notProvided': 'Non renseigné',
      'detail.openingHours': 'Öffnungszeiten:',
      'detail.aboutUs': 'Über uns',
      'detail.cuisine': 'Küche',
      
      // Shop Page
      'shop.toGallery': 'Zur Gallery',
      'shop.toShopInfo': 'Zur Shop-infos',
      'shop.addProducts': 'Produkte hinzufügen',
      'shop.dashboard': 'Dashboard',
      'shop.notice': 'Hinweis:',
      'shop.noOnlineOrder': 'Dieser Shop bietet keinen Online-Bestellservice an. Bitte besuchen Sie das Geschäft vor Ort oder rufen Sie an.',
      'shop.myCart': 'Mein Warenkorb',
      'shop.total': 'Gesamt:',
      'shop.checkout': 'Zur Kasse',
      'shop.close': 'Schließen',
      'shop.remove': 'Entfernen',
      
      // Dashboard
      'dashboard.title': 'Bestellungen für Ihren Shop',
      'dashboard.backToShop': 'Zurück zum Shop',
      'dashboard.noOrders': 'Keine Bestellungen gefunden.',
      'dashboard.tip': 'Tipp: Wischen Sie nach links/rechts und oben/unten, um alle Informationen zu sehen.',
      'dashboard.orders': 'Bestellung(en)',
      'dashboard.time': 'Uhrzeit',
      'dashboard.customer': 'Kunde',
      'dashboard.products': 'Produkte',
      'dashboard.quantity': 'Menge',
      'dashboard.totalAmount': 'Gesamtbetrag (€)',
      'dashboard.paymentMethod': 'Zahlungsart',
      'dashboard.deliveryType': 'Lieferart',
      'dashboard.pickup': 'Abholung',
      'dashboard.delivery': 'Lieferung',
      'dashboard.noClientInfo': 'Aucune info client',
      
      // Days of week
      'day.monday': 'Montag',
      'day.tuesday': 'Dienstag',
      'day.wednesday': 'Mittwoch',
      'day.thursday': 'Donnerstag',
      'day.friday': 'Freitag',
      'day.saturday': 'Samstag',
      'day.sunday': 'Sonntag',
      'day.closed': 'Geschlossen',
      
      // Chatbot
      'chatbot.greeting': 'Hallo! Ich bin Diamal, dein Assistent. Ich erkläre dir, warum und wie du Popups aktivierst und warum Cookies wichtig sind.',
      'chatbot.prompt': 'Stelle mir eine Frage oder wähle ein Thema:',
      'chatbot.topic1': 'Warum Popups aktivieren?',
      'chatbot.topic2': 'Wie Popups aktivieren?',
      'chatbot.topic3': 'Warum Cookies akzeptieren?',
      'chatbot.topic4': 'Möchten Sie uns kontaktieren?',
      'chatbot.answer1': 'Popups ermöglichen wichtige Benachrichtigungen, Angebote und Infos. Sie sind nötig für Funktionen wie Login, Warnungen und mehr.',
      'chatbot.answer2': 'Um Popups zu aktivieren, prüfe die Einstellungen deines Browsers oder Geräts. Erlaube Benachrichtigungen für AfroConnect.',
      'chatbot.answer3': 'Cookies helfen, deine Erfahrung zu personalisieren, Einstellungen zu speichern und die Sicherheit zu gewährleisten. Sie sind für die Funktion der Seite wichtig.',
      'chatbot.answer4': 'Super! Ich leite Sie direkt zum Kontaktformular weiter.',
      'chatbot.linkText': 'Hier findest du eine Anleitung für Chrome und andere Browser (Google Support)',
      
      // Footer
      'footer.copyright': 'Verbinde dich mit deiner Community',
      'footer.privacy': 'Datenschutz',
      'footer.terms': 'AGB',
      'footer.imprint': 'Impressum',
      'footer.contact': 'Kontakt',
      
      // Impressum modal
      'impressum.title': 'Impressum',
      'impressum.notice': 'Hinweis',
      'impressum.disclaimer': 'Dieses Geschäft wird von',
      'impressum.notSeller': 'betrieben. AfroConnect ist nicht Verkäufer.',
      'impressum.name': 'Name/Firma:',
      'impressum.address': 'Adresse:',
      'impressum.email': 'E-Mail:',
      'impressum.phone': 'Telefon:',
      'impressum.additional': 'Weitere Angaben:',
      'impressum.hint': 'Dieses Impressum wurde vom Shop-Betreiber hinterlegt. Angaben ohne Gewähr.',
      'impressum.notFound': 'Geschäft nicht gefunden',
      'impressum.notFoundMsg': 'Das gesuchte Geschäft existiert nicht.',
    },
    
    en: {
      // Navigation
      'nav.gallery': 'Gallery',
      'nav.about': 'About us',
      'nav.contact': 'Contact',
      'nav.help': 'Help',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      'nav.addShop': 'Add Shop',
      'nav.impressum': 'Imprint',
      'nav.terms': 'Terms',
      'nav.privacy': 'Privacy',
      'nav.openMenu': 'Open menu',
      'nav.closeMenu': 'Close menu',
      
      // Gallery page
      'gallery.discover': 'Discover',
      'gallery.shopsNearYou': 'African shops near you',
      'gallery.addShopBtn': 'Add shop',
      'gallery.filterByType': 'Filter by type:',
      'gallery.allTypes': 'All types',
      'gallery.activateGPS': 'Activate GPS',
      'gallery.searchRadius': 'Search within 50km radius',
      'gallery.around': 'around',
      'gallery.yourLocation': 'your location',
      'gallery.resultsCount': 'of',
      'gallery.shopsDisplayed': 'Afroshops displayed',
      'gallery.yourCity': 'Your city:',
      'gallery.anyCityPlaceholder': 'Any European city...',
      'gallery.search': 'Search',
      'gallery.popularCities': 'Popular cities...',
      'gallery.confirm': 'Confirm',
      'gallery.viewDetails': 'View details',
      'gallery.showOnMap': 'Show on map',
      'gallery.route': 'Route',
      'gallery.edit': 'Edit',
      
      // Home/Gallery
      'home.title': 'Discover African businesses in Europe',
      'home.subtitle': 'Find restaurants, shops, hairdressers and more',
      'search.placeholder': 'Search for shops...',
      'filter.city': 'Filter by city',
      'filter.type': 'Filter by type',
      'filter.allTypes': 'All types',
      
      // Shop types
      'type.restaurant': 'Restaurant',
      'type.epicerie': 'Grocery Store',
      'type.coiffeur': 'Hairdresser',
      'type.vetement': 'Fashion',
      'type.services': 'Services',
      
      // Buttons
      'btn.details': 'Details',
      'btn.call': 'Call',
      'btn.route': 'Route',
      'btn.save': 'Save',
      'btn.cancel': 'Cancel',
      'btn.edit': 'Edit',
      'btn.delete': 'Delete',
      'btn.close': 'Close',
      'btn.back': 'Back',
      'btn.shop': 'Shop',
      
      // About
      'about.title': 'About us',
      'about.slogan': 'Connecting Africa with Europe',
      'about.intro': 'AfroConnect is a digital platform created to strengthen the African community in Germany and across Europe, making African products and services more accessible.',
      'about.goal': 'Our goal is to connect people with African roots – as well as anyone interested in African culture, food, fashion, and crafts – with African shops, restaurants, and service providers in Europe.',
      'about.impact': 'The project aims for a strong and positive social impact for the Afro-community and all those interested in African culture, food, fashion, and more.',
      'about.meaning': 'As the name suggests, AfroConnect stands for connection: We bring together African entrepreneurs and customers, promote their visibility, and make their offerings more accessible throughout Germany and Europe.',
      'about.features': 'Whether you\'re looking for an Afroshop, a restaurant with African cuisine, or a specialized hair salon – on AfroConnect you\'ll find everything in one place.',
      'about.vision': 'Our vision is a strong, connected, and visible African business network in Europe – digital, open, and accessible to all.',
      
      // Contact
      'contact.title': 'Contact',
      'contact.intro': 'Do you have questions, feedback, or want to participate? Write to us directly via the form!',
      'contact.name': 'Name',
      'contact.email': 'Email',
      'contact.message': 'Message',
      'contact.submit': 'Submit',
      'contact.thankYou': 'Thank you for your message!',
      'contact.response': 'We\'ll get back to you as soon as possible.',
      'contact.otherOptions': 'Other contact options',
      
      // Help
      'help.title': 'Help & Chatbot Diamal',
      'help.intro': 'Here you can find support and answers to frequently asked questions. Our assistant Diamal is happy to help you!',
      
      // Add Shop Form
      'addShop.titleAdd': 'Add New Shop',
      'addShop.titleEdit': 'Edit Shop',
      'addShop.subtitleAdd': 'Share your favorite Afroshop with the community!',
      'addShop.subtitleEdit': 'Update the information',
      'addShop.backToGallery': 'Gallery',
      'addShop.quickAdd': 'Quick Add',
      'addShop.quickAddDesc': 'Paste a link to automatically load information',
      'addShop.urlLabel': 'Google Maps, Facebook, Nextdoor or Website URL',
      'addShop.import': 'Import',
      'addShop.loading': 'Loading...',
      'addShop.orManual': 'or enter manually',
      'addShop.success': 'Success!',
      'addShop.error': 'Error',
      
      // Image Detail / Shop Detail
      'detail.backToOverview': 'Back to overview',
      'detail.edit': 'edit',
      'detail.noImage': 'No image available',
      'detail.address': 'Address:',
      'detail.phone': 'Phone:',
      'detail.notProvided': 'Not provided',
      'detail.openingHours': 'Opening hours:',
      'detail.aboutUs': 'About us',
      'detail.cuisine': 'Cuisine',
      
      // Shop Page
      'shop.toGallery': 'To Gallery',
      'shop.toShopInfo': 'To Shop Info',
      'shop.addProducts': 'Add Products',
      'shop.dashboard': 'Dashboard',
      'shop.notice': 'Notice:',
      'shop.noOnlineOrder': 'This shop does not offer online ordering service. Please visit the shop in person or call.',
      'shop.myCart': 'My Cart',
      'shop.total': 'Total:',
      'shop.checkout': 'Checkout',
      'shop.close': 'Close',
      'shop.remove': 'Remove',
      
      // Dashboard
      'dashboard.title': 'Orders for Your Shop',
      'dashboard.backToShop': 'Back to Shop',
      'dashboard.noOrders': 'No orders found.',
      'dashboard.tip': 'Tip: Swipe left/right and up/down to see all information.',
      'dashboard.orders': 'order(s)',
      'dashboard.time': 'Time',
      'dashboard.customer': 'Customer',
      'dashboard.products': 'Products',
      'dashboard.quantity': 'Quantity',
      'dashboard.totalAmount': 'Total Amount (€)',
      'dashboard.paymentMethod': 'Payment Method',
      'dashboard.deliveryType': 'Delivery Type',
      'dashboard.pickup': 'Pickup',
      'dashboard.delivery': 'Delivery',
      'dashboard.noClientInfo': 'No client info',
      
      // Days of week
      'day.monday': 'Monday',
      'day.tuesday': 'Tuesday',
      'day.wednesday': 'Wednesday',
      'day.thursday': 'Thursday',
      'day.friday': 'Friday',
      'day.saturday': 'Saturday',
      'day.sunday': 'Sunday',
      'day.closed': 'Closed',
      
      // Chatbot
      'chatbot.greeting': 'Hello! I\'m Diamal, your assistant. I\'ll explain why and how to enable popups and why cookies are important.',
      'chatbot.prompt': 'Ask me a question or choose a topic:',
      'chatbot.topic1': 'Why enable popups?',
      'chatbot.topic2': 'How to enable popups?',
      'chatbot.topic3': 'Why accept cookies?',
      'chatbot.topic4': 'Would you like to contact us?',
      'chatbot.answer1': 'Popups allow important notifications, offers, and information. They are necessary for features like login, warnings, and more.',
      'chatbot.answer2': 'To enable popups, check your browser or device settings. Allow notifications for AfroConnect.',
      'chatbot.answer3': 'Cookies help personalize your experience, save settings, and ensure security. They are important for the site to function.',
      'chatbot.answer4': 'Great! I\'ll redirect you directly to the contact form.',
      'chatbot.linkText': 'Here you can find a guide for Chrome and other browsers (Google Support)',
      
      // Footer
      'footer.copyright': 'Connect with your community',
      'footer.privacy': 'Privacy',
      'footer.terms': 'Terms',
      'footer.imprint': 'Imprint',
      'footer.contact': 'Contact',
      
      // Impressum modal
      'impressum.title': 'Imprint',
      'impressum.notice': 'Notice',
      'impressum.disclaimer': 'This shop is operated by',
      'impressum.notSeller': '. AfroConnect is not the seller.',
      'impressum.name': 'Name/Company:',
      'impressum.address': 'Address:',
      'impressum.email': 'Email:',
      'impressum.phone': 'Phone:',
      'impressum.additional': 'Additional information:',
      'impressum.hint': 'This imprint was provided by the shop operator. No guarantee for accuracy.',
      'impressum.notFound': 'Shop not found',
      'impressum.notFoundMsg': 'The requested shop does not exist.',
    },
    
    fr: {
      // Navigation
      'nav.gallery': 'Galerie',
      'nav.about': 'À propos',
      'nav.contact': 'Contact',
      'nav.help': 'Aide',
      'nav.login': 'Connexion',
      'nav.register': 'Inscription',
      'nav.logout': 'Déconnexion',
      'nav.addShop': 'Ajouter un commerce',
      'nav.impressum': 'Mentions légales',
      'nav.terms': 'CGU',
      'nav.privacy': 'Confidentialité',
      'nav.openMenu': 'Ouvrir le menu',
      'nav.closeMenu': 'Fermer le menu',
      
      // Gallery page
      'gallery.discover': 'Découvrez',
      'gallery.shopsNearYou': 'commerces africains près de chez vous',
      'gallery.addShopBtn': 'Ajouter un commerce',
      'gallery.filterByType': 'Filtrer par type:',
      'gallery.allTypes': 'Tous les types',
      'gallery.activateGPS': 'Activer le GPS',
      'gallery.searchRadius': 'Recherche dans un rayon de 50km',
      'gallery.around': 'autour de',
      'gallery.yourLocation': 'votre position',
      'gallery.resultsCount': 'sur',
      'gallery.shopsDisplayed': 'Afroshops affichés',
      'gallery.yourCity': 'Votre ville:',
      'gallery.anyCityPlaceholder': 'N\'importe quelle ville européenne...',
      'gallery.search': 'Rechercher',
      'gallery.popularCities': 'Villes populaires...',
      'gallery.confirm': 'Confirmer',
      'gallery.viewDetails': 'Voir détails',
      'gallery.showOnMap': 'Afficher sur la carte',
      'gallery.route': 'Itinéraire',
      'gallery.edit': 'Modifier',
      
      // Home/Gallery
      'home.title': 'Découvrez les commerces africains en Europe',
      'home.subtitle': 'Trouvez des restaurants, boutiques, coiffeurs et plus',
      'search.placeholder': 'Rechercher un commerce...',
      'filter.city': 'Filtrer par ville',
      'filter.type': 'Filtrer par type',
      'filter.allTypes': 'Tous les types',
      
      // Shop types
      'type.restaurant': 'Restaurant',
      'type.epicerie': 'Épicerie',
      'type.coiffeur': 'Coiffeur',
      'type.vetement': 'Mode',
      'type.services': 'Services',
      
      // Buttons
      'btn.details': 'Détails',
      'btn.call': 'Appeler',
      'btn.route': 'Itinéraire',
      'btn.save': 'Enregistrer',
      'btn.cancel': 'Annuler',
      'btn.edit': 'Modifier',
      'btn.delete': 'Supprimer',
      'btn.close': 'Fermer',
      'btn.back': 'Retour',
      'btn.shop': 'Boutique',
      
      // About
      'about.title': 'À propos',
      'about.slogan': 'Connecter l\'Afrique avec l\'Europe',
      'about.intro': 'AfroConnect est une plateforme numérique créée pour renforcer la communauté africaine en Allemagne et dans toute l\'Europe, facilitant l\'accès aux produits et services africains.',
      'about.goal': 'Notre objectif est de connecter les personnes d\'origine africaine – ainsi que tous ceux qui s\'intéressent à la culture, à la cuisine, à la mode et à l\'artisanat africains – avec les commerces, restaurants et prestataires de services africains en Europe.',
      'about.impact': 'Le projet vise un impact social fort et positif pour la communauté afro et tous ceux qui s\'intéressent à la culture, à la cuisine, à la mode africaine et plus encore.',
      'about.meaning': 'Comme son nom l\'indique, AfroConnect signifie connexion : nous rassemblons les entrepreneurs africains et les clients, promouvons leur visibilité et rendons leurs offres plus accessibles en Allemagne et dans toute l\'Europe.',
      'about.features': 'Que vous recherchiez un Afroshop, un restaurant de cuisine africaine ou un salon de coiffure spécialisé – sur AfroConnect vous trouverez tout au même endroit.',
      'about.vision': 'Notre vision est un réseau commercial africain fort, connecté et visible en Europe – numérique, ouvert et accessible à tous.',
      
      // Contact
      'contact.title': 'Contact',
      'contact.intro': 'Vous avez des questions, des commentaires ou souhaitez participer ? Écrivez-nous directement via le formulaire !',
      'contact.name': 'Nom',
      'contact.email': 'Email',
      'contact.message': 'Message',
      'contact.submit': 'Envoyer',
      'contact.thankYou': 'Merci pour votre message !',
      'contact.response': 'Nous vous répondrons dans les plus brefs délais.',
      'contact.otherOptions': 'Autres options de contact',
      
      // Help
      'help.title': 'Aide & Chatbot Diamal',
      'help.intro': 'Vous trouverez ici de l\'aide et des réponses aux questions fréquentes. Notre assistant Diamal se fera un plaisir de vous aider !',
      
      // Add Shop Form
      'addShop.titleAdd': 'Ajouter un nouveau commerce',
      'addShop.titleEdit': 'Modifier le commerce',
      'addShop.subtitleAdd': 'Partagez votre Afroshop préféré avec la communauté !',
      'addShop.subtitleEdit': 'Mettre à jour les informations',
      'addShop.backToGallery': 'Galerie',
      'addShop.quickAdd': 'Ajout rapide',
      'addShop.quickAddDesc': 'Collez un lien pour charger automatiquement les informations',
      'addShop.urlLabel': 'URL Google Maps, Facebook, Nextdoor ou Site Web',
      'addShop.import': 'Importer',
      'addShop.loading': 'Chargement...',
      'addShop.orManual': 'ou saisir manuellement',
      'addShop.success': 'Succès !',
      'addShop.error': 'Erreur',
      
      // Image Detail / Shop Detail
      'detail.backToOverview': 'Retour à l\'aperçu',
      'detail.edit': 'modifier',
      'detail.noImage': 'Aucune image disponible',
      'detail.address': 'Adresse :',
      'detail.phone': 'Téléphone :',
      'detail.notProvided': 'Non renseigné',
      'detail.openingHours': 'Horaires d\'ouverture :',
      'detail.aboutUs': 'À propos de nous',
      'detail.cuisine': 'Cuisine',
      
      // Shop Page
      'shop.toGallery': 'Vers la Galerie',
      'shop.toShopInfo': 'Infos du commerce',
      'shop.addProducts': 'Ajouter des produits',
      'shop.dashboard': 'Tableau de bord',
      'shop.notice': 'Remarque :',
      'shop.noOnlineOrder': 'Ce commerce ne propose pas de service de commande en ligne. Veuillez visiter le magasin sur place ou appeler.',
      'shop.myCart': 'Mon Panier',
      'shop.total': 'Total :',
      'shop.checkout': 'Passer à la caisse',
      'shop.close': 'Fermer',
      'shop.remove': 'Retirer',
      
      // Dashboard
      'dashboard.title': 'Commandes pour votre commerce',
      'dashboard.backToShop': 'Retour au commerce',
      'dashboard.noOrders': 'Aucune commande trouvée.',
      'dashboard.tip': 'Astuce : Balayez à gauche/droite et en haut/bas pour voir toutes les informations.',
      'dashboard.orders': 'commande(s)',
      'dashboard.time': 'Heure',
      'dashboard.customer': 'Client',
      'dashboard.products': 'Produits',
      'dashboard.quantity': 'Quantité',
      'dashboard.totalAmount': 'Montant Total (€)',
      'dashboard.paymentMethod': 'Mode de paiement',
      'dashboard.deliveryType': 'Type de livraison',
      'dashboard.pickup': 'Retrait',
      'dashboard.delivery': 'Livraison',
      'dashboard.noClientInfo': 'Aucune info client',
      
      // Days of week
      'day.monday': 'Lundi',
      'day.tuesday': 'Mardi',
      'day.wednesday': 'Mercredi',
      'day.thursday': 'Jeudi',
      'day.friday': 'Vendredi',
      'day.saturday': 'Samedi',
      'day.sunday': 'Dimanche',
      'day.closed': 'Fermé',
      
      // Chatbot
      'chatbot.greeting': 'Bonjour ! Je suis Diamal, votre assistant. Je vous expliquerai pourquoi et comment activer les popups et pourquoi les cookies sont importants.',
      'chatbot.prompt': 'Posez-moi une question ou choisissez un sujet :',
      'chatbot.topic1': 'Pourquoi activer les popups ?',
      'chatbot.topic2': 'Comment activer les popups ?',
      'chatbot.topic3': 'Pourquoi accepter les cookies ?',
      'chatbot.topic4': 'Souhaitez-vous nous contacter ?',
      'chatbot.answer1': 'Les popups permettent des notifications importantes, des offres et des informations. Ils sont nécessaires pour des fonctions comme la connexion, les avertissements et plus encore.',
      'chatbot.answer2': 'Pour activer les popups, vérifiez les paramètres de votre navigateur ou de votre appareil. Autorisez les notifications pour AfroConnect.',
      'chatbot.answer3': 'Les cookies aident à personnaliser votre expérience, à enregistrer les paramètres et à assurer la sécurité. Ils sont importants pour le fonctionnement du site.',
      'chatbot.answer4': 'Super ! Je vous redirige directement vers le formulaire de contact.',
      'chatbot.linkText': 'Vous trouverez ici un guide pour Chrome et autres navigateurs (Google Support)',
      
      // Footer
      'footer.copyright': 'Connectez-vous avec votre communauté',
      'footer.privacy': 'Confidentialité',
      'footer.terms': 'CGU',
      'footer.imprint': 'Mentions légales',
      'footer.contact': 'Contact',
      
      // Impressum modal
      'impressum.title': 'Mentions légales',
      'impressum.notice': 'Avis',
      'impressum.disclaimer': 'Cette boutique est exploitée par',
      'impressum.notSeller': '. AfroConnect n\'est pas le vendeur.',
      'impressum.name': 'Nom/Société :',
      'impressum.address': 'Adresse :',
      'impressum.email': 'Email :',
      'impressum.phone': 'Téléphone :',
      'impressum.additional': 'Informations supplémentaires :',
      'impressum.hint': 'Ces mentions légales ont été fournies par l\'exploitant de la boutique. Aucune garantie d\'exactitude.',
      'impressum.notFound': 'Boutique introuvable',
      'impressum.notFoundMsg': 'La boutique demandée n\'existe pas.',
    }
  };

  constructor() {
    // Charger la langue depuis localStorage ou utiliser 'de' par défaut
    const savedLang = localStorage.getItem('afroconnect_language') as Language;
    if (savedLang && ['de', 'en', 'fr'].includes(savedLang)) {
      this.currentLanguageSubject.next(savedLang);
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(lang: Language): void {
    this.currentLanguageSubject.next(lang);
    localStorage.setItem('afroconnect_language', lang);
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    return this.translations[currentLang][key] || key;
  }

  // Raccourci pour utiliser dans les templates
  t(key: string): string {
    return this.translate(key);
  }
}
