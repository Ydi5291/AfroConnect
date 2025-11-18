import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderData } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { LanguageService } from '../services/language.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;

  texts = {
    title: 'Bestellungen für Ihren Shop',
    backToShop: 'Zurück zum Shop',
    noOrders: 'Keine Bestellungen gefunden.',
    tip: 'Tipp: Wischen Sie nach links/rechts und oben/unten, um alle Informationen zu sehen.',
    orders: 'Bestellung(en)',
    time: 'Uhrzeit',
    customer: 'Kunde',
    products: 'Produkte',
    quantity: 'Menge',
    totalAmount: 'Gesamtbetrag (€)',
    paymentMethod: 'Zahlungsart',
    deliveryType: 'Lieferart',
    pickup: 'Abholung',
    delivery: 'Lieferung',
    noClientInfo: 'Aucune info client'
  };

  currentUid: string | null = null;
  orders: OrderData[] = [];
  groupedOrders: { date: string, orders: OrderData[], label: string }[] = [];
  shopId: string = '';
  myShop: any = null;

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private afroshopService = inject(FirebaseAfroshopService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Language subscription
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();

    // 🔹 Observer l'utilisateur connecté
    this.authService.user$.subscribe(user => {
      this.currentUid = user?.uid || null;
    });

    // 🔹 Récupérer shopId depuis la route
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (!idFromRoute) return;

    this.shopId = idFromRoute;

    // 🔹 Récupérer les shops et trouver celui correspondant
    this.afroshopService.getAllAfroshops().subscribe(shops => {
      this.myShop = shops.find(s => String(s.id) === String(this.shopId));

      if (!this.myShop) return;

      // 🔹 Récupérer les commandes de ce shop
      this.orderService.getOrdersByShop(this.shopId).subscribe({
        next: (orders) => {
          console.log(`✅ Dashboard Shop ${this.shopId} - Commandes chargées:`, orders.length);
          this.orders = orders;
          this.groupOrdersByDay();
        },
        error: (error) => {
          console.error(`❌ Dashboard Shop ${this.shopId} - Erreur:`, error);
        }
      });
    });
  }

  get shopIdReady(): boolean {
    return !!this.myShop && !!this.myShop.id;
  }

  goToShop() {
    if (this.shopIdReady) {
      this.router.navigate(['/shop', this.myShop.id]);
    } else {
      this.router.navigate(['/gallery']);
    }
  }

  groupOrdersByDay() {
    const groups = new Map<string, OrderData[]>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    this.orders.forEach(order => {
      const orderDate = order.createdAt?.toDate();
      if (!orderDate) return;
      
      const dateKey = orderDate.toLocaleDateString('de-DE');
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(order);
    });

    this.groupedOrders = Array.from(groups.entries()).map(([date, orders]) => {
      const firstOrderDate = orders[0].createdAt?.toDate();
      firstOrderDate?.setHours(0, 0, 0, 0);
      
      let label = date;
      if (firstOrderDate?.getTime() === today.getTime()) {
        label = '📅 Heute - ' + date;
      } else if (firstOrderDate?.getTime() === yesterday.getTime()) {
        label = '📅 Gestern - ' + date;
      } else {
        label = '📅 ' + date;
      }
      
      return { date, orders, label };
    });
  }

  updateTranslations() {
    this.texts = {
      title: this.languageService.translate('dashboard.title'),
      backToShop: this.languageService.translate('dashboard.backToShop'),
      noOrders: this.languageService.translate('dashboard.noOrders'),
      tip: this.languageService.translate('dashboard.tip'),
      orders: this.languageService.translate('dashboard.orders'),
      time: this.languageService.translate('dashboard.time'),
      customer: this.languageService.translate('dashboard.customer'),
      products: this.languageService.translate('dashboard.products'),
      quantity: this.languageService.translate('dashboard.quantity'),
      totalAmount: this.languageService.translate('dashboard.totalAmount'),
      paymentMethod: this.languageService.translate('dashboard.paymentMethod'),
      deliveryType: this.languageService.translate('dashboard.deliveryType'),
      pickup: this.languageService.translate('dashboard.pickup'),
      delivery: this.languageService.translate('dashboard.delivery'),
      noClientInfo: this.languageService.translate('dashboard.noClientInfo')
    };
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}
