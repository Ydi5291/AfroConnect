import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { LanguageService } from './services/language.service';
import { Subscription } from 'rxjs';
import { SEOService } from './services/seo.service';
import { JsonLdService } from './services/json-ld.service';

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

  faqs = [
    {
      question: 'Wie kann ich mein Geschäft bei AfroConnect registrieren?',
      answer: 'Gehen Sie auf die Seite "Geschäft eintragen" und füllen Sie das Formular aus. Die Registrierung ist kostenlos und dauert nur wenige Minuten.'
    },
    {
      question: 'Ist die Registrierung wirklich kostenlos?',
      answer: 'Ja, die Basisregistrierung ist komplett kostenlos. Sie können Ihr Geschäft hinzufügen, Fotos hochladen und Ihre Informationen verwalten ohne jegliche Kosten.'
    },
    {
      question: 'Wie finde ich ein Afroshop in meiner Nähe?',
      answer: 'Nutzen Sie unsere Suchfunktion auf der Startseite. Geben Sie Ihre Stadt oder PLZ ein und wählen Sie den Typ des Geschäfts aus.'
    },
    {
      question: 'Kann ich mehrere Geschäfte registrieren?',
      answer: 'Ja, Sie können mehrere Geschäfte unter einem Account registrieren und verwalten.'
    },
    {
      question: 'Wie kann ich mein Geschäft bearbeiten?',
      answer: 'Melden Sie sich mit Ihrem Account an und gehen Sie zu "Meine Geschäfte". Dort können Sie alle Informationen bearbeiten.'
    }
  ];

  constructor(
    private languageService: LanguageService,
    private seoService: SEOService,
    private jsonLdService: JsonLdService
  ) {}

  ngOnInit() {
    // SEO pour la page d'aide
    this.seoService.setHelpPage();
    
    // JSON-LD avec FAQ schema pour les featured snippets Google
    const schema = this.jsonLdService.getCombinedSchema(
      this.jsonLdService.getFAQSchema(this.faqs),
      this.jsonLdService.getBreadcrumbSchema([
        { name: 'Home', url: 'https://afroconnect.shop' },
        { name: 'Hilfe', url: 'https://afroconnect.shop/hilfe' }
      ])
    );
    this.jsonLdService.insertSchema(schema);

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
