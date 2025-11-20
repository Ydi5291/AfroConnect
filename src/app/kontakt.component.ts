import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from './services/language.service';
import { Subscription } from 'rxjs';
import { SEOService } from './services/seo.service';
import { JsonLdService } from './services/json-ld.service';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kontakt.component.html',
  styleUrls: ['./kontakt.component.css']
})
export class KontaktComponent implements OnInit, OnDestroy {
  name: string = '';
  email: string = '';
  message: string = '';
  submitted: boolean = false;
  private langSub?: Subscription;

  texts = {
    title: 'Kontakt',
    intro: '',
    name: 'Name',
    email: 'E-Mail',
    message: 'Nachricht',
    submit: 'Absenden',
    thankYou: 'Danke für deine Nachricht!',
    response: 'Wir melden uns so schnell wie möglich bei dir.',
    otherOptions: 'Weitere Kontaktmöglichkeiten'
  };

  constructor(
    private languageService: LanguageService,
    private seoService: SEOService,
    private jsonLdService: JsonLdService
  ) {}

  ngOnInit() {
    // SEO pour la page contact
    this.seoService.setContactPage();
    
    // JSON-LD breadcrumb
    const schema = this.jsonLdService.getBreadcrumbSchema([
      { name: 'Home', url: 'https://afroconnect.shop' },
      { name: 'Kontakt', url: 'https://afroconnect.shop/kontakt' }
    ]);
    this.jsonLdService.insertSchema(schema);

    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
  }

  updateTranslations() {
    this.texts = {
      title: this.languageService.translate('contact.title'),
      intro: this.languageService.translate('contact.intro'),
      name: this.languageService.translate('contact.name'),
      email: this.languageService.translate('contact.email'),
      message: this.languageService.translate('contact.message'),
      submit: this.languageService.translate('contact.submit'),
      thankYou: this.languageService.translate('contact.thankYou'),
      response: this.languageService.translate('contact.response'),
      otherOptions: this.languageService.translate('contact.otherOptions')
    };
  }

  submitForm() {
    this.submitted = true;
    // Ici, tu pourrais envoyer le message à une API ou par email
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}
