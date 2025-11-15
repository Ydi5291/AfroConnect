import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { AfroshopService, AfroshopData, Product } from '../services/image.service';
import { Subscription } from 'rxjs';

// Minimal local type definitions to satisfy the component's usage.
// If you already have these types defined elsewhere in the project,
// prefer importing them from the shared models instead of duplicating.
// The local declaration of the Product interface has been removed to avoid conflicts with the imported Product type.


@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ImageDetailComponent implements OnInit, OnDestroy { 
  private langSub?: Subscription;

  texts = {
    backToOverview: 'Zurück zur Übersicht',
    edit: 'bearbeiten',
    noImage: 'Kein Bild verfügbar',
    address: 'Adresse:',
    phone: 'Telefon:',
    notProvided: 'Non renseigné',
    openingHours: 'Öffnungszeiten:',
    aboutUs: 'Über uns',
    cuisine: 'Küche',
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
    closed: 'Geschlossen',
    // Action buttons
    call: 'Anrufen',
    shop: 'Einkaufen',
    back: 'Zurück',
    // Impressum modal
    impressumTitle: 'Impressum',
    impressumNotice: 'Hinweis',
    impressumDisclaimer: 'Dieses Geschäft wird von',
    impressumNotSeller: 'betrieben. AfroConnect ist nicht Verkäufer.',
    impressumName: 'Name/Firma:',
    impressumAddress: 'Adresse:',
    impressumEmail: 'E-Mail:',
    impressumPhone: 'Telefon:',
    impressumAdditional: 'Weitere Angaben:',
    impressumHint: 'Dieses Impressum wurde vom Shop-Betreiber hinterlegt. Angaben ohne Gewähr.',
    impressumNotFound: 'Geschäft nicht gefunden',
    impressumNotFoundMsg: 'Das gesuchte Geschäft existiert nicht.'
  };

  showImpressum = false;
  afroshop: AfroshopData | undefined;
  shopId: string | number = '';
  formattedHours: Array<{day: string, hours: string, isOpen: boolean}> = [];

  cart: Product[] = [];
  newProduct: Product = { id: '', name: '', price: 0, image: '', category: 'Lebensmittel' };
  isAdmin: boolean = false;

  // Ajout des propriétés pour l'upload d'image produit
  productImagePreview: string | null = null;
  productImageFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private afroshopService: AfroshopService,
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService,
    private languageService: LanguageService,
    private title: Title,
    private meta: Meta
  ) {}

  editProducts() {
    // Rediriger vers la page d'édition du commerce
    if (this.shopId) {
      this.router.navigate(['/edit-afroshop', this.shopId]);
    }
  }

  ngOnInit(): void {
    // Language subscription
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();

    // Récupérer l'ID depuis l'URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shopId = id; // Garder comme string
      console.log('🔍 Recherche Afroshop avec ID:', id);
      // Charger depuis Firebase
      this.firebaseService.getAllAfroshops().subscribe({
        next: (afroshops) => {
          console.log('🔍 Afroshops disponibles:', afroshops.map(a => `${a.id}: ${a.name}`));
          // Recherche flexible (string ou number)
          this.afroshop = afroshops.find(shop => 
            shop.id === id || shop.id === +id || shop.id.toString() === id
          );
          if (this.afroshop) {
            console.log('✅ Afroshop trouvé:', this.afroshop.name);
            console.log('🖼️ URL de l\'image:', this.afroshop.image);
            console.log('📦 Données complètes:', this.afroshop);
            console.log('📝 Impressum données:', {
              name: this.afroshop.impressumName,
              address: this.afroshop.impressumAddress,
              email: this.afroshop.impressumEmail,
              phone: this.afroshop.impressumPhone,
              text: this.afroshop.impressumText
            });
            // Parser les heures d\'ouverture pour l\'affichage formaté
            this.parseOpeningHours(this.afroshop.hours || '');

            // SEO dynamique
            this.title.setTitle(`${this.afroshop.name} | AfroConnect`);
            this.meta.updateTag({ name: 'description', content: this.afroshop.description || '' });
            this.meta.updateTag({ name: 'keywords', content: `${this.afroshop.name}, ${this.afroshop.type}, ${this.afroshop.city}, AfroConnect` });
            const africanProducts = 'Alloco, Kochbanane, ignam, fufu, manioc, feuilles de patate, feuilles de manioc, okra, gombo, attiéké, poisson fumé, épices africaines, plantain, couscous de maïs, arachide, huile de palme, bissap, gingembre, ndolé, mafé, yassa, poulet DG, sauce graine, sauce feuille, sauce arachide, kédjénou, gari, tapioca, bouillon cube, piment africain';
            this.meta.updateTag({ name: 'keywords', content: `${this.afroshop.name}, ${this.afroshop.type}, ${this.afroshop.city}, AfroConnect, ${africanProducts}` });
            this.meta.updateTag({ property: 'og:title', content: `${this.afroshop.name} | AfroConnect` });
            this.meta.updateTag({ property: 'og:description', content: this.afroshop.description || '' });
            this.meta.updateTag({ property: 'og:image', content: this.afroshop.image || '' });
          } else {
            console.log('❌ Afroshop non trouvé avec ID:', id);
            console.log('❌ Types des IDs:', afroshops.map(a => `${a.id} (${typeof a.id})`));
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement Firebase:', error);
          // Fallback vers les données locales
          const numId = +id;
          this.afroshop = this.afroshopService.getAfroshopById(numId);
          // SEO dynamique fallback
          if (this.afroshop) {
            this.title.setTitle(`${this.afroshop.name} | AfroConnect`);
            this.meta.updateTag({ name: 'description', content: this.afroshop.description || '' });
            this.meta.updateTag({ name: 'keywords', content: `${this.afroshop.name}, ${this.afroshop.type}, ${this.afroshop.city}, AfroConnect` });
            const africanProducts = 'Alloco, Kochbanane, ignam, fufu, manioc, feuilles de patate, feuilles de manioc, okra, gombo, attiéké, poisson fumé, épices africaines, plantain, couscous de maïs, arachide, huile de palme, bissap, gingembre, ndolé, mafé, yassa, poulet DG, sauce graine, sauce feuille, sauce arachide, kédjénou, gari, tapioca, bouillon cube, piment africain';
            this.meta.updateTag({ name: 'keywords', content: `${this.afroshop.name}, ${this.afroshop.type}, ${this.afroshop.city}, AfroConnect, ${africanProducts}` });
            this.meta.updateTag({ property: 'og:title', content: `${this.afroshop.name} | AfroConnect` });
            this.meta.updateTag({ property: 'og:description', content: this.afroshop.description || '' });
            this.meta.updateTag({ property: 'og:image', content: this.afroshop.image || '' });
          }
        }
      });
    }

    // Vérification admin (à adapter selon ta logique)

    // Exemple de récupération du statut admin via Firestore
    this.authService.user$.subscribe(user => {
      if (user?.uid && this.afroshop) {
        // Propriétaire du commerce
        this.isAdmin = (this.afroshop && (this.afroshop as any).createdBy)
          ? user.uid === (this.afroshop as any).createdBy
          : false;
      } else {
        this.isAdmin = false;
      }
    });
  }

  // Retour à la galerie
  goBack(): void {
    this.router.navigate(['/gallery']);
  }

  // Gestion d'erreur de chargement d'image
  onImageError(event: any): void {
    console.error('❌ Erreur chargement image:', event);
    console.error('❌ URL qui a échoué:', event.target?.src);
  }

  // Appeler le numéro
  callPhone(phoneNumber: string): void {
    window.open(`tel:${phoneNumber}`, '_self');
  }

  // Ouvrir dans Google Maps avec l'adresse réelle
  openInMaps(): void {
    if (this.afroshop && this.afroshop.address) {
      const address = encodeURIComponent(this.afroshop.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(url, '_blank');
    } else if (this.afroshop && this.afroshop.coordinates) {
      const address = encodeURIComponent(`${this.afroshop.coordinates.lat},${this.afroshop.coordinates.lng}`);
      const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
      window.open(url, '_blank');
    }
  }

  // Obtenir l'itinéraire vers l'Afroshop avec l'adresse réelle
  getDirections(): void {
    if (this.afroshop && this.afroshop.address) {
      const address = encodeURIComponent(this.afroshop.address);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      window.open(url, '_blank');
    } else if (this.afroshop && this.afroshop.coordinates) {
      const address = encodeURIComponent(`${this.afroshop.coordinates.lat},${this.afroshop.coordinates.lng}`);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      window.open(url, '_blank');
    }
  }

  // Obtenir l'icône selon le type
  getTypeIcon(type: AfroshopData['type']): string {
    const icons: { [key: string]: string } = {
      restaurant: '🍽️',
      epicerie: '🛒',
      coiffeur: '✂️',
      vetement: '👗',
      services: '🏦'
    };
    return type ? icons[type] || '' : '';
  }

  // Convertir le niveau de prix en symboles
  getPriceLevel(level: number): string {
    return '€'.repeat(level);
  }

  // Vérifier si l'utilisateur peut éditer cet Afroshop
  canEdit(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    console.log('🔍 Debug canEdit:');
    console.log('  - User connecté:', currentUser?.uid);
    console.log('  - Afroshop:', this.afroshop);
    console.log('  - CreatedBy:', (this.afroshop as any)?.createdBy);
    
    if (!currentUser || !this.afroshop) {
      console.log('  ❌ Pas de user ou pas d\'afroshop');
      return false;
    }
    
    // Vérifier si l'utilisateur est le créateur
    const canEdit = (this.afroshop as any).createdBy === currentUser.uid;
    console.log('  ✅ Peut éditer:', canEdit);
    
    return canEdit;
  }

  // Vérifier si l'utilisateur est le propriétaire du shop
  isShopOwner(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.afroshop) return false;
    return (this.afroshop as any).createdBy === currentUser.uid;
  }

  // Parse and format opening hours for display
  private parseOpeningHours(hoursString: string): void {
    this.formattedHours = [];
    
    if (!hoursString) {
      return;
    }

    // Mapping des jours allemands
    const dayMapping: {[key: string]: string} = {
      'Mo': this.texts.monday,
      'Di': this.texts.tuesday, 
      'Mi': this.texts.wednesday,
      'Do': this.texts.thursday,
      'Fr': this.texts.friday,
      'Sa': this.texts.saturday,
      'So': this.texts.sunday
    };

    // Split par virgule pour avoir chaque période
    const periods = hoursString.split(',').map(p => p.trim());
    
    // Initialiser tous les jours comme fermés
    const weekDays = [this.texts.monday, this.texts.tuesday, this.texts.wednesday, this.texts.thursday, this.texts.friday, this.texts.saturday, this.texts.sunday];
    const dayStatus: {[key: string]: {isOpen: boolean, hours: string}} = {};
    
    weekDays.forEach(day => {
      dayStatus[day] = {isOpen: false, hours: this.texts.closed};
    });

    // Parser chaque période (ex: "Mo-Fr: 12:00-22:00")
    periods.forEach(period => {
      const colonIndex = period.indexOf(':');
      if (colonIndex === -1) return;
      
      const dayPart = period.substring(0, colonIndex).trim();
      const timePart = period.substring(colonIndex + 1).trim();
      
      // Gérer les plages de jours (Mo-Fr, Sa-So, etc.)
      if (dayPart.includes('-')) {
        const [startDay, endDay] = dayPart.split('-').map(d => d.trim());
        const startDayName = dayMapping[startDay];
        const endDayName = dayMapping[endDay];
        
        if (startDayName && endDayName) {
          const startIndex = weekDays.indexOf(startDayName);
          const endIndex = weekDays.indexOf(endDayName);
          
          if (startIndex !== -1 && endIndex !== -1) {
            // Gérer les plages qui traversent la semaine (ex: Sa-So)
            if (startIndex <= endIndex) {
              for (let i = startIndex; i <= endIndex; i++) {
                dayStatus[weekDays[i]] = {isOpen: true, hours: timePart};
              }
            } else {
              // Plage qui traverse la fin de semaine
              for (let i = startIndex; i < weekDays.length; i++) {
                dayStatus[weekDays[i]] = {isOpen: true, hours: timePart};
              }
              for (let i = 0; i <= endIndex; i++) {
                dayStatus[weekDays[i]] = {isOpen: true, hours: timePart};
              }
            }
          }
        }
      } else {
        // Jour unique (ex: "Sa")
        const dayName = dayMapping[dayPart];
        if (dayName) {
          dayStatus[dayName] = {isOpen: true, hours: timePart};
        }
      }
    });

    // Convertir en array pour l'affichage
    weekDays.forEach(day => {
      this.formattedHours.push({
        day: day,
        hours: dayStatus[day].hours,
        isOpen: dayStatus[day].isOpen
      });
    });
  }

  // Éditer l'Afroshop
  editAfroshop(): void {
    if (this.canEdit()) {
      this.router.navigate(['/edit-afroshop', this.shopId]);
    }
  }

  // Redirige vers la page Shop du commerce concerné
  goToShop(): void {
    this.router.navigate(['/shop', this.shopId]);
  }

  updateTranslations() {
    this.texts = {
      backToOverview: this.languageService.translate('detail.backToOverview'),
      edit: this.languageService.translate('detail.edit'),
      noImage: this.languageService.translate('detail.noImage'),
      address: this.languageService.translate('detail.address'),
      phone: this.languageService.translate('detail.phone'),
      notProvided: this.languageService.translate('detail.notProvided'),
      openingHours: this.languageService.translate('detail.openingHours'),
      aboutUs: this.languageService.translate('detail.aboutUs'),
      cuisine: this.languageService.translate('detail.cuisine'),
      monday: this.languageService.translate('day.monday'),
      tuesday: this.languageService.translate('day.tuesday'),
      wednesday: this.languageService.translate('day.wednesday'),
      thursday: this.languageService.translate('day.thursday'),
      friday: this.languageService.translate('day.friday'),
      saturday: this.languageService.translate('day.saturday'),
      sunday: this.languageService.translate('day.sunday'),
      closed: this.languageService.translate('day.closed'),
      // Action buttons
      call: this.languageService.translate('btn.call'),
      shop: this.languageService.translate('btn.shop'),
      back: this.languageService.translate('btn.back'),
      // Impressum modal
      impressumTitle: this.languageService.translate('impressum.title'),
      impressumNotice: this.languageService.translate('impressum.notice'),
      impressumDisclaimer: this.languageService.translate('impressum.disclaimer'),
      impressumNotSeller: this.languageService.translate('impressum.notSeller'),
      impressumName: this.languageService.translate('impressum.name'),
      impressumAddress: this.languageService.translate('impressum.address'),
      impressumEmail: this.languageService.translate('impressum.email'),
      impressumPhone: this.languageService.translate('impressum.phone'),
      impressumAdditional: this.languageService.translate('impressum.additional'),
      impressumHint: this.languageService.translate('impressum.hint'),
      impressumNotFound: this.languageService.translate('impressum.notFound'),
      impressumNotFoundMsg: this.languageService.translate('impressum.notFoundMsg')
    };
    
    // Reparse opening hours with new translations
    if (this.afroshop?.hours) {
      this.parseOpeningHours(this.afroshop.hours);
    }
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}