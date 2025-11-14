import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})

export class PaymentComponent {
  shopId: string | null = null;
  selectedMethod: string = '';
  deliveryType: 'abholung' | 'lieferung' = 'abholung'; // Par défaut: enlèvement
  paymentConfirmed = false;
  confirmationMessage = '';
  iban: string = '';
  bic: string = '';

  clientInfo = {
    firstName: '',
    lastName: '',
    street: '',
    number: '',
    plz: '',
    city: '',
    phone: '',
    email: ''
  };
  clientInfoValid(): boolean {
    return !!(
      this.clientInfo.firstName &&
      this.clientInfo.lastName &&
      this.clientInfo.street &&
      this.clientInfo.number &&
      this.clientInfo.plz &&
      this.clientInfo.city &&
      this.clientInfo.phone
    );
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: FirebaseAfroshopService,
    private orderService: OrderService,
    private authService: AuthService
  ) {
    this.route.queryParamMap.subscribe(async params => {
      this.shopId = params.get('shopId');
      if (this.shopId) {
        const afroshop = await this.firebaseService.getAfroshopById(this.shopId);
        this.iban = afroshop?.iban || '';
        this.bic = afroshop?.bic || '';
      }
    });
  }

  goBackToShop() {
    if (this.shopId) {
      this.router.navigate(['/shop', this.shopId]);
    } else {
      this.router.navigate(['/shop']);
    }
  }

  async confirmPayment() {
    // Validation stricte des infos client
    if (!this.clientInfoValid()) {
      this.paymentConfirmed = false;
      this.confirmationMessage = 'Bitte füllen Sie alle Pflichtfelder für Ihre Kontaktdaten aus.';
      return;
    }
    // Récupérer le panier du shop courant depuis le localStorage (clé: 'cartItems_{shopId}')
    let cartItems: any[] = [];
    try {
      const stored = localStorage.getItem('cartItems_' + this.shopId);
      if (stored) cartItems = JSON.parse(stored);
    } catch {}
    const products = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));
    const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    if (!this.shopId || products.length === 0) {
      this.paymentConfirmed = true;
      this.confirmationMessage = 'Ihr Warenkorb ist leer oder ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    // Récupérer le propriétaire du shop (createdBy)
    let shopOwnerId: string | undefined = undefined;
    if (this.shopId) {
  const afroshop = await this.firebaseService.getAfroshopById(this.shopId);
  shopOwnerId = (afroshop as any)?.createdBy;
    }
    const orderData: any = {
      shopId: this.shopId!,
      clientInfo: {
        firstName: this.clientInfo.firstName,
        lastName: this.clientInfo.lastName,
        street: this.clientInfo.street,
        number: this.clientInfo.number,
        plz: this.clientInfo.plz,
        city: this.clientInfo.city,
        phone: this.clientInfo.phone,
        email: this.clientInfo.email
      },
      products,
      total,
      paymentMethod: this.selectedMethod,
      deliveryType: this.deliveryType, // Enlèvement ou livraison
      createdAt: new Date(),
      shopOwnerId: shopOwnerId // Ajout systématique pour diagnostic
    };
    if (currentUser) {
      orderData.userId = currentUser.uid;
    }
    await this.orderService.addOrder(orderData);
    // Vider le panier du shop courant après validation
    if (this.shopId) {
      localStorage.removeItem('cartItems_' + this.shopId);
    }
    this.paymentConfirmed = true;
    if (this.selectedMethod === 'bar') {
      if (this.deliveryType === 'abholung') {
        this.confirmationMessage = 'Ihre Bestellung wurde gespeichert. Bitte bezahlen Sie bar bei Abholung im Geschäft.';
      } else {
        this.confirmationMessage = 'Ihre Bestellung wurde gespeichert. Bitte bezahlen Sie bar bei Lieferung.';
      }
    } else if (this.selectedMethod === 'vorkasse') {
      if (this.iban && this.bic) {
        this.confirmationMessage = 'Ihre Bestellung wurde gespeichert. Vielen Dank für Ihren Einkauf!<br>Bitte überweisen Sie den Gesamtbetrag auf das folgende Konto:<br><b>IBAN: ' + this.iban + '</b><br><b>BIC: ' + this.bic + '</b><br><small>Ihre Bestellung wird nach Zahlungseingang bearbeitet.</small>';
      } else {
        this.confirmationMessage = 'Bankverbindung nicht verfügbar. Bitte wenden Sie sich an den Shop.';
      }
    } else {
      this.confirmationMessage = 'Ihre Bestellung wurde gespeichert. Vielen Dank für Ihren Einkauf!';
    }
  }
}
