import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product } from '../services/image.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldValue, arrayUnion } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddProductComponent {
  @Input() afroshopId: string = '';
  @Output() productAdded = new EventEmitter<Product>();

  newProduct: Product = { id: '', name: '', price: 0, image: '' };
  productImagePreview: string | null = null;
  productImageFile: File | null = null;

  constructor(private firebaseService: FirebaseAfroshopService) {}

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
    if (!this.newProduct.name || !this.newProduct.price || !this.newProduct.image) return;
    const prod = { ...this.newProduct, id: Date.now().toString() };
    // Ajout du produit dans Firestore sous le commerce correspondant
    if (this.afroshopId) {
      await this.firebaseService.updateAfroshop(this.afroshopId, {
        products: arrayUnion(prod)
      });
    }
    this.productAdded.emit(prod);
    this.newProduct = { id: '', name: '', price: 0, image: '' };
    this.productImagePreview = null;
    this.productImageFile = null;
  }
}
