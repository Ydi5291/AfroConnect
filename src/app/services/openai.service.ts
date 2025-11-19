import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
   * Envoyer un message à ChatGPT et obtenir une réponse
   */
  sendMessage(userMessage: string): Observable<string> {
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
        
        // Gérer les erreurs courantes
        if (error.status === 401) {
          return throwError(() => new Error('Clé API OpenAI invalide'));
        } else if (error.status === 429) {
          return throwError(() => new Error('Limite de requêtes atteinte. Réessayez dans quelques secondes.'));
        } else if (error.status === 500) {
          return throwError(() => new Error('Erreur serveur OpenAI. Réessayez plus tard.'));
        }
        
        return throwError(() => new Error('Erreur de connexion à OpenAI'));
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
