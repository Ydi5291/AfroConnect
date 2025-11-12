// ...existing code...
import { Component, HostListener, OnInit, OnDestroy, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  // ...existing code...
  ngOnDestroy(): void {
    console.log('[Chatbot] ngOnDestroy appelé, composant démonté. isMobile:', this.isMobile, 'showChat:', this.showChat);
  }
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  isMobile = false;
  @Input() showChat = false;
  @Output() toggleChat = new EventEmitter<void>();
  messages: ChatbotMessage[] = [
    { from: 'bot', text: 'Hallo! Ich bin Diamal, dein Assistent. Ich erkläre dir, warum und wie du Popups aktivierst und warum Cookies wichtig sind.' },
    { from: 'bot', text: 'Stelle mir eine Frage oder wähle ein Thema:' },
  ];
  topics = [
    'Warum Popups aktivieren?',
    'Wie Popups aktivieren?',
    'Warum Cookies akzeptieren?',
    'Möchten Sie uns kontaktieren?'
  ];

  constructor(private router: Router) {
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
  // Ne pas toucher à showChat ici, laisse le contrôle à l'utilisateur
  }


  @HostListener('window:resize')
  onResize() {
  this.isMobile = window.innerWidth < 600;
  // Ne pas forcer showChat sur resize, laisse le contrôle à l'utilisateur
  }

  selectTopic(topic: string) {
    this.messages.push({ from: 'user', text: topic });
    let answer = '';
    if (topic === this.topics[0]) {
      answer = 'Popups ermöglichen wichtige Benachrichtigungen, Angebote und Infos. Sie sind nötig für Funktionen wie Login, Warnungen und mehr.';
    } else if (topic === this.topics[1]) {
      answer = `Um Popups zu aktivieren, prüfe die Einstellungen deines Browsers oder Geräts. Erlaube Benachrichtigungen für AfroConnect.<br><a href="https://support.google.com/chrome/answer/95472?hl=de" target="_blank" rel="noopener">Hier findest du eine Anleitung für Chrome und andere Browser (Google Support)</a>`;
    } else if (topic === this.topics[2]) {
      answer = 'Cookies helfen, deine Erfahrung zu personalisieren, Einstellungen zu speichern und die Sicherheit zu gewährleisten. Sie sind für die Funktion der Seite wichtig.';
    } else if (topic === this.topics[3]) {
      answer = 'Super! Ich leite Sie direkt zum Kontaktformular weiter.';
      this.router.navigate(['/kontakt']);
    }
    if (answer) {
      this.messages.push({ from: 'bot', text: answer, isHtml: topic === this.topics[1] });
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
    this.toggleChat.emit();
    console.log('[Chatbot] toggleChatHandler appelé, showChat:', this.showChat, 'isMobile:', this.isMobile);
  }
}
