import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AfroshopService, AfroshopData } from '../services/image.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-detail.component.html',
  styleUrl: './image-detail.component.css'
})
export class ImageDetailComponent implements OnInit { 
  afroshop: AfroshopData | undefined;
  shopId: string | number = '';
  formattedHours: Array<{day: string, hours: string, isOpen: boolean}> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private afroshopService: AfroshopService,
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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
            
            // Parser les heures d'ouverture pour l'affichage formaté
            this.parseOpeningHours(this.afroshop.hours || '');
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
        }
      });
    }
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

  // Ouvrir dans Google Maps
  openInMaps(): void {
    if (this.afroshop) {
      const url = `https://www.google.com/maps/search/?api=1&query=${this.afroshop.coordinates.lat},${this.afroshop.coordinates.lng}`;
      window.open(url, '_blank');
    }
  }

  // Obtenir l'itinéraire vers l'Afroshop
  getDirections(): void {
    if (this.afroshop) {
      // Ouvrir Google Maps avec l'itinéraire
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.afroshop.coordinates.lat},${this.afroshop.coordinates.lng}`;
      window.open(url, '_blank');
    }
  }

  // Obtenir l'icône selon le type
  getTypeIcon(type: AfroshopData['type']): string {
    const icons = {
      restaurant: '🍽️',
      epicerie: '🛒',
      coiffeur: '✂️',
      vetement: '👗',
      services: '🏦'
    };
    return icons[type];
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
    console.log('  - User email:', currentUser?.email);
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

  // Parse and format opening hours for display
  private parseOpeningHours(hoursString: string): void {
    this.formattedHours = [];
    
    if (!hoursString) {
      return;
    }

    // Mapping des jours allemands
    const dayMapping: {[key: string]: string} = {
      'Mo': 'Montag',
      'Di': 'Dienstag', 
      'Mi': 'Mittwoch',
      'Do': 'Donnerstag',
      'Fr': 'Freitag',
      'Sa': 'Samstag',
      'So': 'Sonntag'
    };

    // Split par virgule pour avoir chaque période
    const periods = hoursString.split(',').map(p => p.trim());
    
    // Initialiser tous les jours comme fermés
    const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const dayStatus: {[key: string]: {isOpen: boolean, hours: string}} = {};
    
    weekDays.forEach(day => {
      dayStatus[day] = {isOpen: false, hours: 'Geschlossen'};
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
}
