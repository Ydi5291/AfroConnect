  // ...existing code...
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../services/image.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldValue, arrayUnion } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddProductComponent {
  showBankForm = false;
  bankSuccessMessage: string | null = null;
  iban: string = '';
  bic: string = '';
  @Input() afroshopId: string = '';
  @Output() productAdded = new EventEmitter<Product>();

  newProduct: Product = { id: '', name: '', price: 0, image: '', category: 'Lebensmittel' };
  productImagePreview: string | null = null;
  productImageFile: File | null = null;

  // Limitation produits
  showLimitModal = false;
  isPremium = false;
  currentProductCount = 0;
  readonly FREE_PRODUCT_LIMIT = 4; // 4 produits + 1 photo de profil = 5 photos total

  constructor(
    private firebaseService: FirebaseAfroshopService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  productIdToEdit: string | null = null;

  async ngOnInit(): Promise<void> {
    // Vérifier le statut Premium de l'utilisateur
    await this.checkPremiumStatus();

    this.route.queryParams.subscribe(async params => {
      console.log('[AddProduct] QueryParams:', params);
      if (params['afroshopId']) {
        this.afroshopId = params['afroshopId'];
        console.log('[AddProduct] afroshopId reçu:', this.afroshopId);
        // Vérifier si le shop a déjà IBAN/BIC
        const afroshop = await this.firebaseService.getAfroshopById(this.afroshopId);
        if (!afroshop?.iban || !afroshop?.bic) {
          this.showBankForm = true;
        } else {
          this.showBankForm = false;
        }

        // Compter les produits existants
        this.currentProductCount = afroshop?.products?.length || 0;
        console.log(`[AddProduct] Produits actuels: ${this.currentProductCount}, Premium: ${this.isPremium}`);
      } else {
        console.warn('[AddProduct] Aucun afroshopId reçu dans les queryParams');
      }
      // Pré-remplir le formulaire si modification
      if (params['productId']) {
        this.productIdToEdit = params['productId'];
        this.newProduct = {
          id: params['productId'],
          name: params['name'] || '',
          price: params['price'] ? Number(params['price']) : 0,
          image: params['image'] || '',
          category: params['category'] || 'Lebensmittel'
        };
        this.productImagePreview = params['image'] || null;
      }
    });
  }

  async onProductImageSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.productImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
    this.productImageFile = file;
    try {
      const url = await this.firebaseService.uploadImage(file);
      this.newProduct.image = url;
    } catch (error) {
      console.error('Erreur upload image produit:', error);
    }
  }

  async addProduct(): Promise<void> {
    if (this.showBankForm) {
      this.bankSuccessMessage = null;
      return; // Bloquer si coordonnées non remplies
    }
    if (!this.newProduct.name || !this.newProduct.price || !this.newProduct.image) return;

    // ⚠️ VÉRIFICATION LIMITE PRODUITS (uniquement pour ajout, pas modification)
    if (!this.productIdToEdit && !this.isPremium && this.currentProductCount >= this.FREE_PRODUCT_LIMIT) {
      console.warn(`[AddProduct] Limite atteinte: ${this.currentProductCount}/${this.FREE_PRODUCT_LIMIT}`);
      this.showLimitModal = true;
      return;
    }

    let prod = { ...this.newProduct };
    // Si modification, remplacer le produit existant
    if (this.productIdToEdit && this.afroshopId) {
      // Récupérer les produits existants
      const afroshop = await this.firebaseService.getAfroshopById(this.afroshopId);
      let products = afroshop?.products || [];
      products = products.map(p => p.id === this.productIdToEdit ? prod : p);
      await this.firebaseService.updateAfroshop(this.afroshopId, { products });
      this.router.navigate(['/shop', this.afroshopId]);
    } else if (this.afroshopId) {
      // Ajout classique
      prod.id = Date.now().toString();
      await this.firebaseService.updateAfroshop(this.afroshopId, {
        products: arrayUnion(prod)
      });
      this.router.navigate(['/shop', this.afroshopId]);
    }
    this.productAdded.emit(prod);
    this.newProduct = { id: '', name: '', price: 0, image: '', category: 'Lebensmittel' };
    this.productImagePreview = null;
    this.productImageFile = null;
    this.productIdToEdit = null;
  }

  async saveBankData() {
    if (!this.iban || !this.bic || !this.afroshopId) return;
    await this.firebaseService.updateAfroshop(this.afroshopId, { iban: this.iban, bic: this.bic });
    this.showBankForm = false;
    this.bankSuccessMessage = `Bankverbindung erfolgreich hinzugefügt!\nIBAN: ${this.iban}\nBIC: ${this.bic}`;
    const shopId = this.afroshopId;
    this.iban = '';
    this.bic = '';
    // Rediriger vers la page paiement du shop pour garantir l'affichage à jour
    setTimeout(() => {
      this.router.navigate(['/payment'], { queryParams: { shopId } });
    }, 1500);
  }
  goToShop(): void {
    console.log('Redirection vers le shop avec afroshopId:', this.afroshopId);
    if (this.afroshopId) {
      this.router.navigate(['/shop', this.afroshopId]);
    } else {
      console.warn('Aucun afroshopId trouvé pour la redirection !');
    }
  }

  goToGallery(): void {
    this.router.navigate(['/gallery']);
  }

  // Vérifier le statut Premium de l'utilisateur
  async checkPremiumStatus(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      this.isPremium = false;
      return;
    }

    try {
      const subscriptionDoc = await getDoc(
        doc(this.firestore, `users/${user.uid}/subscription/current`)
      );

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        this.isPremium = data['plan'] === 'premium' && data['subscriptionStatus'] === 'active';
        console.log('[AddProduct] Statut Premium:', this.isPremium);
      } else {
        this.isPremium = false;
        console.log('[AddProduct] Pas de subscription trouvée, utilisateur gratuit');
      }
    } catch (error) {
      console.error('[AddProduct] Erreur vérification Premium:', error);
      this.isPremium = false;
    }
  }

  // Fermer le modal de limitation
  closeLimitModal(): void {
    this.showLimitModal = false;
  }

  // Rediriger vers la page Premium
  goToPremium(): void {
    this.router.navigate(['/pricing']);
  }
}
