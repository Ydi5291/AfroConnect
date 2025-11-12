// ...existing code...
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AfroshopService, AfroshopData } from '../services/image.service';
import type { Product } from '../services/image.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-shop',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './shop.component.html',
	styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
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
			private authService: AuthService
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
			this.route.paramMap.subscribe(params => {
				const id = params.get('id');
				if (!id) return;
				this.shopId = id;
				this.loadCartFromLocalStorage();
				this.firebaseService.getAllAfroshops().subscribe(afroshops => {
					this.afroshop = afroshops.find(shop => shop.id === id || shop.id === +id || shop.id.toString() === id);
				});
			});
		}

	addToCart(product: Product): void {
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
				// Retirer le produit du tableau local
				const updatedProducts = (this.afroshop.products || []).filter(p => p.id !== product.id);
				// Mettre à jour dans Firebase
				try {
					await this.firebaseService.updateAfroshop(String(this.afroshop.id), { products: updatedProducts });
					// Mettre à jour localement pour l'UI
					this.afroshop.products = updatedProducts;
				} catch (error) {
					console.error('Erreur lors de la suppression du produit :', error);
					alert('Fehler beim Löschen des Produkts.');
				}
			}

			goToPayment(): void {
				this.toggleCart();
				this.router.navigate(['/payment'], { queryParams: { shopId: this.shopId } });
			}

  // Vérifier si l'utilisateur est le propriétaire du shop
  isShopOwner(): boolean {
    const currentUser = this.authService.getCurrentUser?.();
    if (!currentUser || !this.afroshop) return false;
    return (this.afroshop as any).createdBy === currentUser.uid;
  }
}

