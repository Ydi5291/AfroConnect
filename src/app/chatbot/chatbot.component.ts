import { Component, HostListener, OnInit } from '@angular/core';
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
export class ChatbotComponent implements AfterViewChecked, OnInit {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  isMobile = false;
  showChat = false;
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
    this.showChat = false;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 600;
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

  toggleChat() {
    this.showChat = !this.showChat;
  }
}
