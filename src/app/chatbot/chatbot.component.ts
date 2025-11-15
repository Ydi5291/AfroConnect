// ...existing code...
import { Component, HostListener, OnInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

export interface ChatbotMessage {
  from: string;
  text: string;
  isHtml?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked, OnInit, OnDestroy, OnChanges {
  private langSub?: Subscription;
  
  texts = {
    greeting: 'Hallo! Ich bin Diamal, dein Assistent. Ich erkläre dir, warum und wie du Popups aktivierst und warum Cookies wichtig sind.',
    prompt: 'Stelle mir eine Frage oder wähle ein Thema:',
    topic1: 'Warum Popups aktivieren?',
    topic2: 'Wie Popups aktivieren?',
    topic3: 'Warum Cookies akzeptieren?',
    topic4: 'Möchten Sie uns kontaktieren?',
    answer1: 'Popups ermöglichen wichtige Benachrichtigungen, Angebote und Infos. Sie sind nötig für Funktionen wie Login, Warnungen und mehr.',
    answer2: 'Um Popups zu aktivieren, prüfe die Einstellungen deines Browsers oder Geräts. Erlaube Benachrichtigungen für AfroConnect.',
    answer3: 'Cookies helfen, deine Erfahrung zu personalisieren, Einstellungen zu speichern und die Sicherheit zu gewährleisten. Sie sind für die Funktion der Seite wichtig.',
    answer4: 'Super! Ich leite Sie direkt zum Kontaktformular weiter.',
    linkText: 'Hier findest du eine Anleitung für Chrome und andere Browser (Google Support)'
  };
  
  // ...existing code...
  ngOnDestroy(): void {
    console.log('[Chatbot] ngOnDestroy appelé, composant démonté. isMobile:', this.isMobile, 'showChat:', this.showChat);
    this.langSub?.unsubscribe();
  }
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  isMobile = false;
  @Input() showChat = false;
  @Output() toggleChat = new EventEmitter<void>();
  messages: ChatbotMessage[] = [];
  topics: string[] = [];

  constructor(private router: Router, private languageService: LanguageService) {
    this.isMobile = window.innerWidth < 600;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showChat']) {
      console.log('[Chatbot] ngOnChanges showChat:', changes['showChat'].currentValue);
    }
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 600;
    console.log('[Chatbot] ngOnInit, isMobile:', this.isMobile, 'showChat:', this.showChat);
    
    // Language subscription
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
  }

  updateTranslations() {
    this.texts = {
      greeting: this.languageService.translate('chatbot.greeting'),
      prompt: this.languageService.translate('chatbot.prompt'),
      topic1: this.languageService.translate('chatbot.topic1'),
      topic2: this.languageService.translate('chatbot.topic2'),
      topic3: this.languageService.translate('chatbot.topic3'),
      topic4: this.languageService.translate('chatbot.topic4'),
      answer1: this.languageService.translate('chatbot.answer1'),
      answer2: this.languageService.translate('chatbot.answer2'),
      answer3: this.languageService.translate('chatbot.answer3'),
      answer4: this.languageService.translate('chatbot.answer4'),
      linkText: this.languageService.translate('chatbot.linkText')
    };
    
    // Reset messages with new translations
    this.messages = [
      { from: 'bot', text: this.texts.greeting },
      { from: 'bot', text: this.texts.prompt }
    ];
    
    // Update topics
    this.topics = [
      this.texts.topic1,
      this.texts.topic2,
      this.texts.topic3,
      this.texts.topic4
    ];
  }


  @HostListener('window:resize')
  onResize() {
  this.isMobile = window.innerWidth < 600;
  // Ne pas forcer showChat sur resize, laisse le contrôle à l'utilisateur
  }

  selectTopic(topic: string) {
    this.messages.push({ from: 'user', text: topic });
    let answer = '';
    
    if (topic === this.texts.topic1) {
      answer = this.texts.answer1;
    } else if (topic === this.texts.topic2) {
      answer = `${this.texts.answer2}<br><a href="https://support.google.com/chrome/answer/95472?hl=de" target="_blank" rel="noopener">${this.texts.linkText}</a>`;
    } else if (topic === this.texts.topic3) {
      answer = this.texts.answer3;
    } else if (topic === this.texts.topic4) {
      answer = this.texts.answer4;
      this.router.navigate(['/kontakt']);
    }
    
    if (answer) {
      this.messages.push({ from: 'bot', text: answer, isHtml: topic === this.texts.topic2 });
    }
    setTimeout(() => this.scrollToBottom(), 100);
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
