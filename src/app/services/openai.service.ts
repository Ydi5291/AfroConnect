import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly apiKey = environment.openaiApiKey;
  
  // Contexte personnalisé pour AfroConnect
  private readonly systemContext: ChatMessage = {
    role: 'system',
    content: `Tu es Diamal, l'assistant virtuel intelligent d'AfroConnect.

**À propos d'AfroConnect:**
- Plateforme qui connecte les commerces africains en Europe avec leur communauté
- Services: Annuaire de commerces (afroshops, restaurants, salons), système de commande en ligne, galerie photos
- Localisation: Allemagne (Berlin, Hambourg, Bremen, etc.)
- Contact: WhatsApp +49 178 4123151

**Ton rôle:**
1. Aider les utilisateurs à naviguer sur la plateforme
2. Répondre aux questions sur les commerces africains
3. Expliquer comment s'inscrire, commander, ou ajouter un commerce
4. Fournir des informations sur les cookies, popups et paramètres
5. Guider vers les bonnes pages (/join, /kontakt, /shop, etc.)

**Ton style:**
- Amical et professionnel
- Multilingue (détecte la langue de l'utilisateur)
- Concis mais complet (max 3-4 phrases par réponse)
- Utilise des emojis appropriés (🏪 🍽️ ✂️ 📱 🌍)

**Langues supportées:** Allemand (par défaut), Anglais, Français, Italien, Espagnol, Portugais

Réponds toujours dans la langue de l'utilisateur. Si tu ne comprends pas, demande de clarifier en allemand.`
  };

  private conversationHistory: ChatMessage[] = [this.systemContext];

  constructor(private http: HttpClient) {
    console.log('🤖 OpenAI Service initialized');
  }

  /**
   * Réponses locales intelligentes (fallback si OpenAI ne marche pas)
   */
  private getLocalResponse(message: string): string | null {
    const lowerMsg = message.toLowerCase();
    
    // Questions sur les statistiques/visiteurs
    if (lowerMsg.includes('visiteur') || lowerMsg.includes('visitor') || lowerMsg.includes('besucher') || 
        lowerMsg.includes('trafic') || lowerMsg.includes('traffic') || lowerMsg.includes('statistique') ||
        lowerMsg.includes('analytics') || lowerMsg.includes('par jour')) {
      return `📊 Pour consulter les statistiques de visiteurs d'AfroConnect :

1. **Google Analytics** - Connecte-toi à analytics.google.com avec ton compte Google
2. **Google Search Console** - Vérifie les impressions et clics sur search.google.com/search-console

🔍 Tu peux aussi voir :
- Nombre de shops inscrits dans Firebase Console
- Activité des utilisateurs dans l'admin AfroConnect

📱 Besoin d'aide pour configurer ? Contacte-nous sur WhatsApp : +49 178 4123151`;
    }
    
    // Questions sur l'inscription
    if (lowerMsg.includes('inscrire') || lowerMsg.includes('inscription') || lowerMsg.includes('register') ||
        lowerMsg.includes('join') || lowerMsg.includes('ajouter') || lowerMsg.includes('add shop')) {
      return `✨ Pour ajouter ton commerce sur AfroConnect :

1. 📝 **Inscription gratuite** : Va sur /join
2. 📸 Ajoute photos et infos de ton commerce
3. 🗺️ Géolocalisation automatique
4. ✅ Valide et publie !

💎 **Upgrade Premium** disponible pour :
- Priorité dans les résultats
- Badge "Vérifié"
- Plus de visibilité

🏪 Types de commerces : Restaurants, salons de coiffure, épiceries, boutiques, services...`;
    }
    
    // Questions sur les cookies/RGPD
    if (lowerMsg.includes('cookie') || lowerMsg.includes('rgpd') || lowerMsg.includes('gdpr') ||
        lowerMsg.includes('données') || lowerMsg.includes('privacy')) {
      return `🍪 **Cookies et confidentialité sur AfroConnect :**

✅ **Cookies essentiels** (obligatoires) :
- Authentification utilisateur
- Préférences de langue
- Sécurité du site

📊 **Cookies analytiques** (optionnels) :
- Google Analytics pour améliorer le site
- Statistiques anonymisées

🔒 Tu peux gérer tes préférences dans la bannière de cookies ou via /privacy

💡 Les cookies aident à personnaliser ton expérience et sont sécurisés selon le RGPD.`;
    }
    
    // Questions sur le contact
    if (lowerMsg.includes('contact') || lowerMsg.includes('kontakt') || lowerMsg.includes('whatsapp') ||
        lowerMsg.includes('aide') || lowerMsg.includes('help') || lowerMsg.includes('support')) {
      return `📞 **Contacte l'équipe AfroConnect :**

💬 **WhatsApp** : +49 178 4123151 (recommandé)
📧 **Email** : Via le formulaire sur /kontakt
🌍 **Réseaux sociaux** : Retrouve-nous sur nos pages

⏰ **Disponibilité** : Lun-Ven 9h-18h (CET)

🚀 Pour les questions urgentes, WhatsApp est le plus rapide !`;
    }
    
    // Questions sur les commandes/paiements
    if (lowerMsg.includes('commander') || lowerMsg.includes('order') || lowerMsg.includes('bestellen') ||
        lowerMsg.includes('paiement') || lowerMsg.includes('payment') || lowerMsg.includes('payer')) {
      return `💳 **Commandes sur AfroConnect :**

🛒 **Comment commander ?**
1. Parcours les shops dans /gallery
2. Clique sur un commerce
3. Ajoute des produits au panier
4. Valide ta commande

💰 **Paiements sécurisés via Stripe**
- Cartes bancaires (Visa, Mastercard)
- Paiement instantané

📦 **Livraison** selon le commerce (à domicile ou retrait)

🔐 Toutes les transactions sont sécurisées et conformes PCI-DSS.`;
    }
    
    // Questions sur les langues
    if (lowerMsg.includes('langue') || lowerMsg.includes('language') || lowerMsg.includes('sprache') ||
        lowerMsg.includes('traduire') || lowerMsg.includes('translate')) {
      return `🌍 **AfroConnect est multilingue !**

Langues disponibles :
- 🇩🇪 Allemand (Deutsch)
- 🇬🇧 Anglais (English)
- 🇫🇷 Français
- 🇮🇹 Italien (Italiano)
- 🇪🇸 Espagnol (Español)
- 🇵🇹 Portugais (Português)

🔄 Change la langue dans le sélecteur en haut à droite !

Le contenu du site s'adapte automatiquement à ta langue préférée.`;
    }
    
    return null; // Aucune réponse locale trouvée
  }

  /**
   * Envoyer un message à ChatGPT et obtenir une réponse
   */
  sendMessage(userMessage: string): Observable<string> {
    // 1️⃣ D'abord, essayer de répondre localement
    const localResponse = this.getLocalResponse(userMessage);
    if (localResponse) {
      console.log('💡 Réponse locale utilisée (pas d\'appel OpenAI)');
      return of(localResponse);
    }

    // 2️⃣ Si pas de réponse locale, utiliser OpenAI
    if (!this.apiKey) {
      console.error('❌ OpenAI API Key missing in environment');
      return throwError(() => new Error('OpenAI API Key not configured'));
    }

    // Ajouter le message utilisateur à l'historique
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage
    };
    this.conversationHistory.push(userMsg);

    // Préparer la requête
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {
      model: 'gpt-3.5-turbo', // Ou 'gpt-4' si vous avez accès
      messages: this.conversationHistory,
      temperature: 0.7,
      max_tokens: 300, // Réponses concises
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    console.log('📤 Sending message to OpenAI:', userMessage);

    return this.http.post<OpenAIResponse>(this.apiUrl, body, { headers }).pipe(
      map(response => {
        const assistantMessage = response.choices[0].message.content;
        
        // Ajouter la réponse à l'historique
        this.conversationHistory.push({
          role: 'assistant',
          content: assistantMessage
        });

        console.log('✅ OpenAI Response:', assistantMessage);
        console.log('📊 Tokens used:', response.usage.total_tokens);

        return assistantMessage;
      }),
      catchError(error => {
        console.error('❌ OpenAI API Error:', error);
        
        // 3️⃣ EN CAS D'ERREUR : Réponse générique utile
        const fallbackResponse = `🤖 Je rencontre un petit problème technique avec mon IA.

Mais je peux quand même t'aider ! Voici ce que je peux faire :

📊 **Statistiques** : Connecte-toi à Google Analytics
🏪 **Ajouter un commerce** : Va sur /join
💬 **Contacter l'équipe** : WhatsApp +49 178 4123151
🛒 **Commander** : Parcours /gallery
🍪 **Cookies/RGPD** : Infos sur /privacy

💡 Reformule ta question ou utilise les boutons ci-dessous !`;

        // Retourner une réponse au lieu d'une erreur
        return of(fallbackResponse);
      })
    );
  }

  /**
   * Réinitialiser la conversation
   */
  resetConversation(): void {
    this.conversationHistory = [this.systemContext];
    console.log('🔄 Conversation reset');
  }

  /**
   * Obtenir l'historique de la conversation
   */
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }

  /**
   * Obtenir le nombre de messages dans la conversation
   */
  getMessageCount(): number {
    return this.conversationHistory.length - 1; // -1 pour exclure le système
  }
}
