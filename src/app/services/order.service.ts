import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, Timestamp, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface OrderData {
  id?: string;
  shopId: string;
  userId?: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    street: string;
    number: string;
    plz: string;
    city: string;
    phone: string;
    email?: string;
  };
  products: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  paymentMethod: string;
  createdAt: any;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  // 🔹 Ajouter une commande
  async addOrder(order: Omit<OrderData, 'id' | 'createdAt'>): Promise<void> {
    const ordersRef = collection(this.firestore, 'orders');
    await addDoc(ordersRef, {
      ...order,
      createdAt: Timestamp.now(),
    });
  }

  // 🔹 Récupérer toutes les commandes (admin)
  getAllOrders(): Observable<OrderData[]> {
    return runInInjectionContext(this.injector, () => {
      const ordersRef = collection(this.firestore, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<OrderData[]>;
    });
  }

  // 🔹 Récupérer les commandes d’un shop précis
  getOrdersByShop(shopId: string): Observable<OrderData[]> {
    return runInInjectionContext(this.injector, () => {
      const ordersRef = collection(this.firestore, 'orders');
      const q = query(ordersRef, where('shopId', '==', shopId), orderBy('createdAt', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<OrderData[]>;
    });
  }

  // 🔹 (Optionnel) Récupérer les commandes d’un client spécifique
  getOrdersByUser(userId: string): Observable<OrderData[]> {
    return runInInjectionContext(this.injector, () => {
      const ordersRef = collection(this.firestore, 'orders');
      const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<OrderData[]>;
    });
  }
}
