import { Component, HostListener } from '@angular/core';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  isMobile = false;
  showChat = false;
  messages = [
    { from: 'bot', text: 'Hallo! Ich bin Diamal, dein Assistent. Ich erkläre dir, warum und wie du Popups aktivierst und warum Cookies wichtig sind.' },
    { from: 'bot', text: 'Stelle mir eine Frage oder wähle ein Thema:' },
  ];
  topics = [
    'Warum Popups aktivieren?',
    'Wie Popups aktivieren?',
    'Warum Cookies akzeptieren?',
    'Möchten Sie uns kontaktieren?'
  ];

  constructor() {
    this.isMobile = window.innerWidth < 600;
    this.showChat = !this.isMobile;
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth < 600;
    this.showChat = !this.isMobile;
  }

  selectTopic(topic: string) {
    this.messages.push({ from: 'user', text: topic });
    let answer = '';
    if (topic === this.topics[0]) {
      answer = 'Popups ermöglichen wichtige Benachrichtigungen, Angebote und Infos. Sie sind nötig für Funktionen wie Login, Warnungen und mehr.';
    } else if (topic === this.topics[1]) {
      answer = 'Um Popups zu aktivieren, prüfe die Einstellungen deines Browsers oder Geräts. Erlaube Benachrichtigungen für AfroConnect.';
    } else if (topic === this.topics[2]) {
      answer = 'Cookies helfen, deine Erfahrung zu personalisieren, Einstellungen zu speichern und die Sicherheit zu gewährleisten. Sie sind für die Funktion der Seite wichtig.';
    } else if (topic === this.topics[3]) {
      answer = 'Super! Ich leite Sie direkt zum Kontaktformular weiter.';
      window.location.href = '/kontakt';
    }
    if (answer) {
      this.messages.push({ from: 'bot', text: answer });
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
