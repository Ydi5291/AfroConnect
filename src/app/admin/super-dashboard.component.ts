import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderData } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { Router } from '@angular/router';
import { AfroshopData } from '../services/image.service';

@Component({
  selector: 'app-super-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class SuperDashboardComponent implements OnInit {
  currentUid: string | null = null;
  allOrders: OrderData[] = [];
  filteredOrders: OrderData[] = [];
  groupedOrders: { date: string, orders: OrderData[], label: string }[] = [];
  
  allShops: AfroshopData[] = [];
  selectedShopId: string = 'all'; // 'all' pour toutes les commandes
  
  isLoading = true;

  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private afroshopService = inject(FirebaseAfroshopService);
  private router = inject(Router);

  ngOnInit() {
    // 🔹 Observer l'utilisateur connecté
    this.authService.user$.subscribe(user => {
      this.currentUid = user?.uid || null;
    });

    // 🔹 Récupérer tous les shops
    this.afroshopService.getAllAfroshops().subscribe(shops => {
      this.allShops = shops.sort((a, b) => a.name.localeCompare(b.name));
    });

    // 🔹 Récupérer TOUTES les commandes
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        console.log('✅ Super Dashboard - Commandes chargées:', orders.length);
        this.allOrders = orders;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Super Dashboard - Erreur chargement commandes:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (this.selectedShopId === 'all') {
      this.filteredOrders = this.allOrders;
    } else {
      this.filteredOrders = this.allOrders.filter(order => order.shopId === this.selectedShopId);
    }
    this.groupOrdersByDay();
  }

  onShopFilterChange() {
    this.applyFilter();
  }

  getShopName(shopId: string): string {
    const shop = this.allShops.find(s => String(s.id) === String(shopId));
    return shop ? shop.name : 'Shop inconnu';
  }

  goToGallery() {
    this.router.navigate(['/gallery']);
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  groupOrdersByDay() {
    const groups = new Map<string, OrderData[]>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    this.filteredOrders.forEach(order => {
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

  getTotalRevenue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }

  getTotalOrders(): number {
    return this.filteredOrders.length;
  }
}
