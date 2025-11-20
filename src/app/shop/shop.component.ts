// ...existing code...
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AfroshopService, AfroshopData } from '../services/image.service';
import type { Product } from '../services/image.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { Storage, ref, deleteObject } from '@angular/fire/storage';
import { SEOService } from '../services/seo.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
	selector: 'app-shop',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './shop.component.html',
	styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
	private langSub?: Subscription;
	private seoService = inject(SEOService);
	private jsonLdService = inject(JsonLdService);

	texts = {
		toGallery: 'Zur Gallery',
		toShopInfo: 'Zur Shop-infos',
		addProducts: 'Produkte hinzufügen',
		dashboard: 'Dashboard',
		notice: 'Hinweis:',
		noOnlineOrder: 'Dieser Shop bietet keinen Online-Bestellservice an. Bitte besuchen Sie das Geschäft vor Ort oder rufen Sie an.',
		myCart: 'Mein Warenkorb',
		total: 'Gesamt:',
		checkout: 'Zur Kasse',
		close: 'Schließen',
		remove: 'Entfernen',
		deleteShop: 'Shop löschen',
		deleteConfirmTitle: 'Shop dauerhaft löschen?',
		deleteConfirmMessage: 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Produkte und Bilder werden gelöscht.',
		deleteConfirmButton: 'Löschen',
		deleteCancel: 'Abbrechen',
		deleteWait: 'Bitte warten...'
	};

	// Modal de suppression
	showDeleteModal = false;
	deleteCountdown = 3;
	deleteInProgress = false;

	openUrl(url: string, target: string = '_blank') {
		window.open(url, target);
	}
	showImpressum = false;
	goToDashboard(shopId?: string | number): void {
    const id = shopId || this.shopId;
    this.router.navigate(['/dashboard', id]);
  }
	cartOpen = false;
	toggleCart(): void {
		this.cartOpen = !this.cartOpen;
	}

	incrementQuantity(item: { product: Product; quantity: number }): void {
		item.quantity++;
		this.saveCartToLocalStorage();
	}

	decrementQuantity(item: { product: Product; quantity: number }): void {
		if (item.quantity > 1) {
			item.quantity--;
			this.saveCartToLocalStorage();
		} else {
			this.cartItems = this.cartItems.filter(i => i.product.id !== item.product.id);
			this.saveCartToLocalStorage();
		}
	}
	canEdit(): boolean {
		const currentUser = this.authService.getCurrentUser?.();
		if (!currentUser || !this.afroshop) {
			return false;
		}
		return (this.afroshop as any).createdBy === currentUser.uid;
	}
	afroshop: AfroshopData | undefined;
	shopId: string | number = '';
	cartItems: { product: Product; quantity: number }[] = [];

		constructor(
			private route: ActivatedRoute,
			public router: Router,
			private afroshopService: AfroshopService,
			private firebaseService: FirebaseAfroshopService,
			private authService: AuthService,
			private languageService: LanguageService,
			private storage: Storage
		) {}
	goToAddProduct(): void {
		this.router.navigate(['/add-product'], { queryParams: { afroshopId: this.shopId } });
	}

		private getCartKey(): string {
			return `cartItems_${this.shopId}`;
		}

		private saveCartToLocalStorage() {
			localStorage.setItem(this.getCartKey(), JSON.stringify(this.cartItems));
		}

		private loadCartFromLocalStorage() {
			const stored = localStorage.getItem(this.getCartKey());
			if (stored) {
				try {
					this.cartItems = JSON.parse(stored);
				} catch {}
			} else {
				this.cartItems = [];
			}
		}

		ngOnInit(): void {
			// Language subscription
			this.langSub = this.languageService.currentLanguage$.subscribe(() => {
				this.updateTranslations();
			});
			this.updateTranslations();

		this.route.paramMap.subscribe(params => {
			const id = params.get('id');
			if (!id) return;
			this.shopId = id;
			this.loadCartFromLocalStorage();
			this.firebaseService.getAllAfroshops().subscribe(afroshops => {
				this.afroshop = afroshops.find(shop => shop.id === id || shop.id === +id || shop.id.toString() === id);
				
				// SEO et JSON-LD après chargement du shop
				if (this.afroshop) {
					this.seoService.setShopPage(this.afroshop);
					
					const schema = this.jsonLdService.getCombinedSchema(
						this.jsonLdService.getLocalBusinessSchema(this.afroshop),
						this.jsonLdService.getBreadcrumbSchema([
							{ name: 'Home', url: 'https://afroconnect.shop' },
							{ name: 'Shops', url: 'https://afroconnect.shop/shops' },
							{ name: this.afroshop.name, url: `https://afroconnect.shop/shops/${this.afroshop.id}` }
						])
					);
					this.jsonLdService.insertSchema(schema);
				}
			});
		});
	}	addToCart(product: Product): void {
		const item = this.cartItems.find(i => i.product.id === product.id);
		if (item) {
			item.quantity++;
			this.saveCartToLocalStorage();
		} else {
			this.cartItems.push({ product, quantity: 1 });
			this.saveCartToLocalStorage();
		}
	}

	getCartItemCount(): number {
		return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
	}

	getCartTotal(): number {
		return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
	}

	editProduct(product: Product): void {
		// Redirige vers le formulaire add-product avec toutes les infos du produit à éditer
		this.router.navigate(['/add-product'], {
			queryParams: {
				afroshopId: this.shopId,
				productId: product.id,
				name: product.name,
				price: product.price,
				image: product.image,
				category: product.category
			}
		});
	}

	async deleteProduct(product: Product): Promise<void> {
		if (!this.afroshop) return;
		
		// Confirmation avant suppression
		if (!confirm(`Produkt "${product.name}" wirklich löschen?`)) {
			return;
		}
		
		try {
			console.log('🗑️ Suppression du produit:', product.name);
			console.log('📦 Produits avant:', this.afroshop.products?.length);
			
			// Retirer le produit du tableau local
			const updatedProducts = (this.afroshop.products || []).filter(p => p.id !== product.id);
			
			console.log('📦 Produits après filtre:', updatedProducts.length);
			console.log('🔥 Mise à jour Firebase pour shop:', this.afroshop.id);
			
			// Mettre à jour dans Firebase
			await this.firebaseService.updateAfroshop(String(this.afroshop.id), { 
				products: updatedProducts 
			});
			
			console.log('✅ Produit supprimé avec succès');
			
			// Mettre à jour localement pour l'UI
			this.afroshop.products = updatedProducts;
			
			alert(`Produkt "${product.name}" erfolgreich gelöscht!`);
		} catch (error) {
			console.error('❌ Erreur lors de la suppression du produit:', error);
			console.error('❌ Type d\'erreur:', typeof error);
			console.error('❌ Détails:', error);
			
			// Message d'erreur plus détaillé
			if (error instanceof Error) {
				alert(`Fehler beim Löschen des Produkts: ${error.message}`);
			} else {
				alert('Fehler beim Löschen des Produkts. Bitte überprüfen Sie die Konsole für Details.');
			}
		}
	}			goToPayment(): void {
				this.toggleCart();
				this.router.navigate(['/payment'], { queryParams: { shopId: this.shopId } });
			}

  // Vérifier si l'utilisateur est le propriétaire du shop
  isShopOwner(): boolean {
    const currentUser = this.authService.getCurrentUser?.();
    if (!currentUser || !this.afroshop) return false;
    return (this.afroshop as any).createdBy === currentUser.uid;
  }

	updateTranslations() {
		this.texts = {
			toGallery: this.languageService.translate('shop.toGallery'),
			toShopInfo: this.languageService.translate('shop.toShopInfo'),
			addProducts: this.languageService.translate('shop.addProducts'),
			dashboard: this.languageService.translate('shop.dashboard'),
			notice: this.languageService.translate('shop.notice'),
			noOnlineOrder: this.languageService.translate('shop.noOnlineOrder'),
			myCart: this.languageService.translate('shop.myCart'),
			total: this.languageService.translate('shop.total'),
			checkout: this.languageService.translate('shop.checkout'),
			close: this.languageService.translate('shop.close'),
			remove: this.languageService.translate('shop.remove'),
			deleteShop: this.languageService.translate('shop.deleteShop'),
			deleteConfirmTitle: this.languageService.translate('shop.deleteConfirmTitle'),
			deleteConfirmMessage: this.languageService.translate('shop.deleteConfirmMessage'),
			deleteConfirmButton: this.languageService.translate('shop.deleteConfirmButton'),
			deleteCancel: this.languageService.translate('shop.deleteCancel'),
			deleteWait: this.languageService.translate('shop.deleteWait')
		};
	}

	// Ouvrir le modal de confirmation de suppression
	openDeleteModal(): void {
		this.showDeleteModal = true;
		this.deleteCountdown = 3;
		this.startCountdown();
	}

	// Fermer le modal
	closeDeleteModal(): void {
		this.showDeleteModal = false;
		this.deleteCountdown = 3;
	}

	// Compte à rebours avant activation du bouton de suppression
	private startCountdown(): void {
		const interval = setInterval(() => {
			this.deleteCountdown--;
			if (this.deleteCountdown <= 0) {
				clearInterval(interval);
			}
		}, 1000);
	}

	// Supprimer le shop définitivement
	async confirmDeleteShop(): Promise<void> {
		if (this.deleteCountdown > 0 || this.deleteInProgress || !this.afroshop) return;

		this.deleteInProgress = true;

		try {
			// 1. Supprimer toutes les images des produits
			if (this.afroshop.products && this.afroshop.products.length > 0) {
				for (const product of this.afroshop.products) {
					if (product.image) {
						try {
							const imageRef = ref(this.storage, product.image);
							await deleteObject(imageRef);
						} catch (error) {
							console.warn('Erreur suppression image produit:', error);
						}
					}
				}
			}

			// 2. Supprimer l'image de profil du shop
			if (this.afroshop.image) {
				try {
					const shopImageRef = ref(this.storage, this.afroshop.image);
					await deleteObject(shopImageRef);
				} catch (error) {
					console.warn('Erreur suppression image shop:', error);
				}
			}

			// 3. Supprimer le document Firestore
			await this.firebaseService.deleteAfroshop(String(this.afroshop.id));

			// 4. Supprimer le panier du localStorage
			localStorage.removeItem(this.getCartKey());

			console.log('Shop supprimé avec succès');

			// 5. Rediriger vers la galerie
			this.router.navigate(['/gallery']);
		} catch (error) {
			console.error('Erreur lors de la suppression du shop:', error);
			alert('Fehler beim Löschen des Shops. Bitte versuchen Sie es erneut.');
			this.deleteInProgress = false;
		}
	}

	ngOnDestroy() {
		this.langSub?.unsubscribe();
	}
}

