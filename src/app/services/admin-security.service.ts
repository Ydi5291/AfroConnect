import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminSecurityService {

  constructor() { }

  /**
   * 🔐 Vérification sécurisée des droits admin
   * En production, cette vérification doit être faite côté serveur
   */
  isAdminUser(user: any): boolean {
    if (!user || !user.email) {
      return false;
    }

    // En production, retourner false - la vérification doit se faire côté serveur
    if (environment.production) {
      console.warn('🚫 Admin check disabled in production - use server-side verification');
      return false;
    }

    // En développement uniquement
  // Utiliser Firestore pour la vérification admin, ne pas utiliser adminConfig
  const adminEmails: string[] = [];
    return adminEmails.includes(user.email);
  }

  /**
   * 🛡️ Message de sécurité pour la production
   */
  getSecurityMessage(): string {
    if (environment.production) {
      return 'Administration désactivée en production pour des raisons de sécurité. Contactez l\'administrateur système.';
    }
    return 'Mode développement - Accès admin disponible.';
  }

  /**
   * 🔒 Vérification si l'interface admin doit être cachée
   */
  shouldHideAdminInterface(): boolean {
    return environment.production;
  }
}