// AfroConnect Chatbot avec intégration OpenAI

import { Component, HostListener, OnInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// ...existing code...
import { LanguageService } from '../services/language.service';
import { OpenAIService } from '../services/openai.service';
import { Subscription } from 'rxjs';

export interface ChatbotMessage {
  from: string;
  text: string;
  isHtml?: boolean;
  isLoading?: boolean;
  isPwaButton?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked, OnInit, OnDestroy, OnChanges {
        @Output() requestPwaButton = new EventEmitter<void>();
      /**
       * Affiche le prompt d'installation PWA
       */
      installPWA() {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          this.deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('PWA installation accepted');
            } else {
              console.log('PWA installation dismissed');
            }
            this.deferredPrompt = null;
            this.showInstallButton = false;
          });
        }
      }
    deferredPrompt: any = null;
    showInstallButton: boolean = false;
  private langSub?: Subscription;
  showPwaButtonInAnswer: boolean = false;
  
  texts = {
    greeting: 'Hallo! Ich bin Diamal, dein intelligenter Assistent. Stelle mir jede Frage über AfroConnect!',
    prompt: 'Stelle mir eine Frage oder wähle ein Thema:',
    topic1: 'Warum Popups aktivieren?',
    topic2: 'Wie Popups aktivieren?',
    topic3: 'Warum Cookies akzeptieren?',
    topic4: "Möchten Sie AfroConnect auf Ihrem Gerät installieren? AfroConnect ist als App installierbar!",
    topic5: 'Kontakt & Support',
    answer1: 'Popups ermöglichen wichtige Benachrichtigungen, Angebote und Infos. Sie sind nötig für Funktionen wie Login, Warnungen und mehr.',
    answer2: 'Um Popups zu aktivieren, prüfen Sie die Einstellungen Ihres Browsers oder Geräts und erlauben Sie Benachrichtigungen für AfroConnect.',
    answer3: 'Cookies helfen, Ihre Erfahrung zu personalisieren, Einstellungen zu speichern und die Sicherheit zu gewährleisten. Sie sind für die Funktion der Seite wichtig.',
    answer4: "AfroConnect ist als App installierbar!\n\nSo geht's:\n1. Klicke unten auf den Button <b>'AfroConnect installieren'</b> (falls sichtbar).\n2. Falls der Button nicht erscheint, folge diesen Schritten:\n- Auf Android: Öffne das Chrome-Menü (⋮) > 'Zum Startbildschirm hinzufügen'.\n- Auf iPhone: Tippe auf das Teilen-Symbol (Quadrat mit Pfeil) > 'Zum Home-Bildschirm'.\n3. Nach der Installation findest du AfroConnect direkt auf deinem Handy oder Desktop!\n\nVorteile: Schneller Zugriff, offline nutzbar, wie eine echte App!\n\nBesuche einfach www.afroconnect.shop für alle Funktionen.",
    answer5: 'Super! Ich leite Sie direkt zum Kontaktformular oder Support weiter.',
    linkText: 'Hier findest du eine Anleitung für Chrome und andere Browser (Google Support)'
  };
  
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  isMobile = false;
  @Input() showChat = false;
  @Output() toggleChat = new EventEmitter<void>();
  messages: ChatbotMessage[] = [];
  topics: string[] = [];
  userInput: string = '';
  isAIMode: boolean = true; // Mode IA activé par défaut
  isTyping: boolean = false;

  constructor(
    private router: Router, 
    private languageService: LanguageService,
    private openaiService: OpenAIService
  ) {
    this.isMobile = window.innerWidth < 600;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showChat']) {
      console.log('[Chatbot] ngOnChanges showChat:', changes['showChat'].currentValue);
    }
  }

  ngOnInit() {
    // Gestion de l'événement PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton = true;
    });

    // Expose installPWA sur window pour le bouton HTML
    (window as any).installPWA = () => this.installPWA();
    this.isMobile = window.innerWidth < 600;
    console.log('[Chatbot] ngOnInit, isMobile:', this.isMobile, 'showChat:', this.showChat);

    // Force la langue par défaut à 'de' une seule fois au démarrage
    this.languageService['currentLanguageSubject'].next('de');
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', () => {});
    console.log('[Chatbot] ngOnDestroy appelé, composant démonté. isMobile:', this.isMobile, 'showChat:', this.showChat);
    this.langSub?.unsubscribe();
  }

  updateTranslations() {
    this.texts = {
      greeting: 'Hallo! Ich bin Diamal, dein intelligenter Assistent. Stelle mir jede Frage über AfroConnect!',
      prompt: 'Stelle mir eine Frage oder wähle ein Thema:',
      topic1: 'Warum Popups aktivieren?',
      topic2: 'Wie Popups aktivieren?',
      topic3: 'Warum Cookies akzeptieren?',
      topic4: "Möchten Sie AfroConnect auf Ihrem Gerät installieren? ",
      topic5: 'Kontakt & Support',
      answer1: 'Popups ermöglichen wichtige Benachrichtigungen, Angebote und Infos. Sie sind nötig für Funktionen wie Login, Warnungen und mehr.',
      answer2: 'Um Popups zu aktivieren, prüfen Sie die Einstellungen Ihres Browsers oder Geräts und erlauben Sie Benachrichtigungen für AfroConnect.',
      answer3: 'Cookies helfen, Ihre Erfahrung zu personalisieren, Einstellungen zu speichern und die Sicherheit zu gewährleisten. Sie sind für die Funktion der Seite wichtig.',
      answer4: "So installierst du AfroConnect als App:\n\n1. Klicke unten rechts auf den Button 'AfroConnect installieren'.\n2. Auf Android: Öffne das Chrome-Menü (⋮) > 'Zum Startbildschirm hinzufügen'.\n3. Auf iPhone: Tippe auf das Teilen-Symbol (Quadrat mit Pfeil) > 'Zum Home-Bildschirm'.\n4. Die App erscheint dann direkt auf deinem Handy oder Desktop!\n\nVorteile: Schneller Zugriff, offline nutzbar, wie eine echte App!",
      answer5: 'Super! Ich leite Sie direkt zum Kontaktformular oder Support weiter.',
      linkText: 'Hier findest du eine Anleitung für Chrome und andere Browser (Google Support)'
    };
    
    // Reset messages with new translations
    const greetingText = this.isAIMode ? 
      this.texts.greeting + ' 🤖' : 
      this.texts.greeting;
    
    this.messages = [
      { from: 'bot', text: greetingText },
      { from: 'bot', text: this.texts.prompt }
    ];
    
    // Update topics
    this.topics = [
      this.texts.topic1,
      this.texts.topic2,
      this.texts.topic3,
      this.texts.topic4,
      this.texts.topic5
    ];
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 600;
    // Ne pas forcer showChat sur resize, laisse le contrôle à l'utilisateur
  }

  selectTopic(topic: string) {
    // Pour topic4, toujours réponse prédéfinie
    if (topic === this.texts.topic4) {
      this.handlePredefinedResponse(topic);
    } else if (this.isAIMode) {
      // Mode IA : envoyer à OpenAI
      this.sendMessageToAI(topic);
    } else {
      // Mode classique : réponses prédéfinies
      this.handlePredefinedResponse(topic);
    }
  }

  /**
   * Envoyer un message personnalisé à l'IA
   */
  sendUserMessage() {
    if (!this.userInput.trim()) return;

    const message = this.userInput.trim();
    this.userInput = '';

    if (this.isAIMode) {
      this.sendMessageToAI(message);
    } else {
      this.messages.push({ from: 'user', text: message });
      this.messages.push({ 
        from: 'bot', 
        text: 'En mode manuel, seules les réponses prédéfinies sont disponibles. Activez le mode IA pour des réponses personnalisées.' 
      });
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /**
   * Envoyer un message à OpenAI
   */
  private sendMessageToAI(message: string) {
    // Ajouter le message de l'utilisateur
    this.messages.push({ from: 'user', text: message });
    
    // Afficher l'indicateur de chargement
    this.isTyping = true;
    this.messages.push({ from: 'bot', text: '...', isLoading: true });
    
    console.log('🤖 Sending to OpenAI:', message);

    // Appeler OpenAI
    this.openaiService.sendMessage(message).subscribe({
      next: (response) => {
        // Retirer l'indicateur de chargement
        this.messages = this.messages.filter(m => !m.isLoading);
        this.isTyping = false;

        // Ajouter la réponse de l'IA
        this.messages.push({ from: 'bot', text: response });
        
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('❌ OpenAI Error:', error);
        
        // Retirer l'indicateur de chargement
        this.messages = this.messages.filter(m => !m.isLoading);
        this.isTyping = false;

        // Message d'erreur convivial
        let errorMessage = 'Désolé, une erreur est survenue. ';
        
        if (error.message.includes('invalide')) {
          errorMessage += 'La clé API est invalide. Veuillez contacter l\'administrateur.';
        } else if (error.message.includes('Limite')) {
          errorMessage += 'Trop de requêtes. Veuillez patienter quelques secondes.';
        } else {
          errorMessage += 'Veuillez réessayer ou utiliser les options prédéfinies ci-dessous.';
        }

        this.messages.push({ 
          from: 'bot', 
          text: errorMessage
        });
        
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  /**
   * Gérer les réponses prédéfinies (mode classique)
   */
  private handlePredefinedResponse(topic: string) {
    this.messages.push({ from: 'user', text: topic });
    let answer = '';
    this.showPwaButtonInAnswer = false;
    if (topic === this.texts.topic1) {
      answer = this.texts.answer1;
    } else if (topic === this.texts.topic2) {
      answer = `${this.texts.answer2}<br><a href="https://support.google.com/chrome/answer/95472?hl=de" target="_blank" rel="noopener">${this.texts.linkText}</a>`;
    } else if (topic === this.texts.topic3) {
      answer = this.texts.answer3;
    } else if (topic === this.texts.topic4) {
      answer = this.texts.answer4;
      this.showPwaButtonInAnswer = false;
      this.requestPwaButton.emit();
    }
    if (answer) {
      this.messages.push({ from: 'bot', text: answer, isHtml: topic === this.texts.topic2 });
    }
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /**
   * Basculer entre mode IA et mode manuel
   */
  toggleAIMode() {
    this.isAIMode = !this.isAIMode;
    const modeText = this.isAIMode ? 
      '🤖 Mode IA activé ! Je peux maintenant répondre à toutes vos questions de manière personnalisée.' : 
      '📋 Mode manuel activé. Utilisez les boutons ci-dessous pour les réponses prédéfinies.';
    
    this.messages.push({ from: 'bot', text: modeText });
    
    if (!this.isAIMode) {
      // Reset OpenAI conversation en mode manuel
      this.openaiService.resetConversation();
    }
    
    setTimeout(() => this.scrollToBottom(), 100);
  }

  /**
   * Réinitialiser la conversation
   */
  resetConversation() {
    this.openaiService.resetConversation();
    this.updateTranslations(); // Réinitialise les messages
    this.userInput = '';
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messagesEnd) {
      this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleChatHandler() {
    // éviter le comportement de bubbling qui ferme immédiatement sur mobile
    // Ne pas modifier la valeur d'input ici; on émet un événement pour que le parent change showChat
    this.toggleChat.emit();
    console.log('[Chatbot] toggleChatHandler appelé, showChat (avant emit):', this.showChat, 'isMobile:', this.isMobile);
  }
}
