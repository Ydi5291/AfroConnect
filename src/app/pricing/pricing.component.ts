import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

interface SubscriptionData {
  plan: 'free' | 'premium';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  startDate?: Date;
  endDate?: Date;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit, OnDestroy {
  texts: any = {};
  private langSub?: Subscription;
  
  currentUser: any = null;
  userSubscription: SubscriptionData | null = null;
  isLoading = false;
  private stripe: Stripe | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private languageService: LanguageService
  ) {}

  async ngOnInit() {
    // Abonnement aux changements de langue
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();

    // Charger Stripe
    this.stripe = await loadStripe(environment.stripePublishableKey);

    // Écouter l'utilisateur connecté
    user(this.auth).subscribe(async (firebaseUser) => {
      this.currentUser = firebaseUser;
      if (firebaseUser) {
        await this.loadUserSubscription(firebaseUser.uid);
      }
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  updateTranslations() {
    const t = (key: string) => this.languageService.translate(key);
    this.texts = {
      title: t('pricing.title'),
      subtitle: t('pricing.subtitle'),
      freePlan: t('pricing.freePlan'),
      premiumPlan: t('pricing.premiumPlan'),
      freePrice: t('pricing.freePrice'),
      premiumPrice: t('pricing.premiumPrice'),
      perMonth: t('pricing.perMonth'),
      selectFree: t('pricing.selectFree'),
      selectPremium: t('pricing.selectPremium'),
      currentPlan: t('pricing.currentPlan'),
      // Features
      freeFeature1: t('pricing.freeFeature1'),
      freeFeature2: t('pricing.freeFeature2'),
      freeFeature3: t('pricing.freeFeature3'),
      freeFeature4: t('pricing.freeFeature4'),
      premiumFeature1: t('pricing.premiumFeature1'),
      premiumFeature2: t('pricing.premiumFeature2'),
      premiumFeature3: t('pricing.premiumFeature3'),
      premiumFeature4: t('pricing.premiumFeature4'),
      premiumFeature5: t('pricing.premiumFeature5'),
      premiumFeature6: t('pricing.premiumFeature6'),
      loginRequired: t('pricing.loginRequired'),
      processing: t('pricing.processing')
    };
  }

  async loadUserSubscription(uid: string) {
    try {
      const subDoc = await getDoc(doc(this.firestore, `users/${uid}/subscription/current`));
      if (subDoc.exists()) {
        this.userSubscription = subDoc.data() as SubscriptionData;
      } else {
        // Créer un abonnement gratuit par défaut
        this.userSubscription = { plan: 'free' };
        await setDoc(doc(this.firestore, `users/${uid}/subscription/current`), this.userSubscription);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'abonnement:', error);
    }
  }

  async selectPremium() {
    if (!this.currentUser) {
      alert(this.texts.loginRequired);
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;

    try {
      // Créer une session Stripe Checkout
      const url = `${environment.cloudFunctionsUrl}/createCheckoutSession`;
      console.log('Calling Cloud Function:', url);
      
      const body = {
        userId: this.currentUser.uid,
        priceId: environment.stripePremiumPriceId,
        successUrl: `${window.location.origin}/pricing?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`
      };
      console.log('Request body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      console.log('Response status:', response.status);
      const session = await response.json();
      console.log('Response data:', session);

      // Rediriger vers Stripe Checkout via l'URL de session
      if (session.url) {
        window.location.href = session.url;
      } else {
        console.error('Session object:', session);
        alert('Erreur: URL de paiement non reçue. Voir la console pour plus de détails.');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      alert('Erreur lors de la création de la session de paiement: ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }

  isPremium(): boolean {
    return this.userSubscription?.plan === 'premium' && 
           this.userSubscription?.subscriptionStatus === 'active';
  }
}
