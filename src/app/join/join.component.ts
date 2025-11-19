import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ShopLeadService } from '../services/shop-lead.service';
import { LanguageService } from '../services/language.service';
import { TranslationService } from '../services/translation.service';

export interface ShopLead {
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  plz: string;
  city: string;
  category: 'shop' | 'restaurant' | 'salon' | 'other';
  status: 'new' | 'contacted' | 'interested' | 'registered';
  source: 'website' | 'whatsapp' | 'phone' | 'visit';
  notes?: string;
  createdAt: Date;
  contactedAt?: Date;
}

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './join.component.html',
  styleUrl: './join.component.css'
})
export class JoinComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;
  texts: any = {};

  // Données du formulaire
  shopLead: Partial<ShopLead> = {
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    plz: '',
    city: '',
    category: 'shop',
    status: 'new',
    source: 'website',
    notes: ''
  };

  // États UI
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  constructor(
    private shopLeadService: ShopLeadService,
    private router: Router,
    private languageService: LanguageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadTranslations();
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.loadTranslations();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadTranslations(): void {
    this.texts = {
      title: this.translationService.translate('JOIN.TITLE'),
      subtitle: this.translationService.translate('JOIN.SUBTITLE'),
      shopName: this.translationService.translate('JOIN.SHOP_NAME'),
      shopNamePlaceholder: this.translationService.translate('JOIN.SHOP_NAME_PLACEHOLDER'),
      ownerName: this.translationService.translate('JOIN.OWNER_NAME'),
      ownerNamePlaceholder: this.translationService.translate('JOIN.OWNER_NAME_PLACEHOLDER'),
      phone: this.translationService.translate('JOIN.PHONE'),
      phonePlaceholder: this.translationService.translate('JOIN.PHONE_PLACEHOLDER'),
      email: this.translationService.translate('JOIN.EMAIL'),
      emailPlaceholder: this.translationService.translate('JOIN.EMAIL_PLACEHOLDER'),
      address: this.translationService.translate('JOIN.ADDRESS'),
      addressPlaceholder: this.translationService.translate('JOIN.ADDRESS_PLACEHOLDER'),
      plz: this.translationService.translate('JOIN.PLZ'),
      plzPlaceholder: this.translationService.translate('JOIN.PLZ_PLACEHOLDER'),
      city: this.translationService.translate('JOIN.CITY'),
      cityPlaceholder: this.translationService.translate('JOIN.CITY_PLACEHOLDER'),
      category: this.translationService.translate('JOIN.CATEGORY'),
      categoryShop: this.translationService.translate('JOIN.CATEGORY_SHOP'),
      categoryRestaurant: this.translationService.translate('JOIN.CATEGORY_RESTAURANT'),
      categorySalon: this.translationService.translate('JOIN.CATEGORY_SALON'),
      categoryOther: this.translationService.translate('JOIN.CATEGORY_OTHER'),
      notes: this.translationService.translate('JOIN.NOTES'),
      notesPlaceholder: this.translationService.translate('JOIN.NOTES_PLACEHOLDER'),
      submitButton: this.translationService.translate('JOIN.SUBMIT_BUTTON'),
      whatsappButton: this.translationService.translate('JOIN.WHATSAPP_BUTTON'),
      successTitle: this.translationService.translate('JOIN.SUCCESS_TITLE'),
      successMessage: this.translationService.translate('JOIN.SUCCESS_MESSAGE'),
      errorTitle: this.translationService.translate('JOIN.ERROR_TITLE'),
      benefit1: this.translationService.translate('JOIN.BENEFIT_1'),
      benefit2: this.translationService.translate('JOIN.BENEFIT_2'),
      benefit3: this.translationService.translate('JOIN.BENEFIT_3'),
      benefit4: this.translationService.translate('JOIN.BENEFIT_4'),
    };
  }

  async onSubmit(): Promise<void> {
    // Validation basique
    if (!this.shopLead.name || !this.shopLead.phone || !this.shopLead.address || !this.shopLead.plz || !this.shopLead.city) {
      this.errorMessage = this.translationService.translate('JOIN.ERROR_REQUIRED_FIELDS');
      this.submitError = true;
      setTimeout(() => this.submitError = false, 5000);
      return;
    }

    this.isSubmitting = true;
    this.submitError = false;

    try {
      // Ajouter timestamp et statut
      const leadData: Partial<ShopLead> = {
        ...this.shopLead,
        createdAt: new Date(),
        status: 'new'
      };

      await this.shopLeadService.createShopLead(leadData);
      
      this.submitSuccess = true;
      this.isSubmitting = false;

      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        this.resetForm();
      }, 3000);

    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      this.errorMessage = this.translationService.translate('JOIN.ERROR_SUBMIT');
      this.submitError = true;
      this.isSubmitting = false;
      
      setTimeout(() => this.submitError = false, 5000);
    }
  }

  openWhatsApp(): void {
    const currentLang = this.languageService.getCurrentLanguage();
    let message = '';

    switch (currentLang) {
      case 'de':
        message = 'Hallo AfroConnect! Ich möchte mein Geschäft kostenlos registrieren.';
        break;
      case 'en':
        message = 'Hello AfroConnect! I want to register my business for free.';
        break;
      case 'fr':
        message = 'Bonjour AfroConnect! Je veux inscrire mon commerce gratuitement.';
        break;
      case 'es':
        message = 'Hola AfroConnect! Quiero registrar mi negocio gratis.';
        break;
      case 'pt':
        message = 'Olá AfroConnect! Quero registrar meu negócio gratuitamente.';
        break;
      default:
        message = 'Hello AfroConnect! I want to register my business for free.';
    }

    // Numéro WhatsApp Business AfroConnect
    const phoneNumber = '49178412315'; // +49 178 4123151
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }

  private resetForm(): void {
    this.shopLead = {
      name: '',
      ownerName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      category: 'shop',
      status: 'new',
      source: 'website',
      notes: ''
    };
    this.submitSuccess = false;
  }
}
