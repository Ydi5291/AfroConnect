import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderData } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUid: string | null = null;
  orders: OrderData[] = [];
  shopId: string = '';
  myShop: any = null;

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private afroshopService = inject(FirebaseAfroshopService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
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
      this.orderService.getOrdersByShop(this.shopId).subscribe(orders => {
        this.orders = orders;
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
}
