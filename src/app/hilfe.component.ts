import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { LanguageService } from './services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hilfe',
  standalone: true,
  imports: [CommonModule, ChatbotComponent],
  templateUrl: './hilfe.component.html',
  styleUrls: ['./hilfe.component.css']
})
export class HilfeComponent implements OnInit, OnDestroy {
  showChat = false;
  private langSub?: Subscription;

  texts = {
    title: 'Hilfe & Chatbot Diamal',
    intro: 'Hier findest du Unterstützung und Antworten auf häufige Fragen. Unser Assistent Diamal hilft dir gerne weiter!'
  };

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
  }

  updateTranslations() {
    this.texts = {
      title: this.languageService.translate('help.title'),
      intro: this.languageService.translate('help.intro')
    };
  }

  toggleChatFromChild() {
    this.showChat = !this.showChat;
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}
