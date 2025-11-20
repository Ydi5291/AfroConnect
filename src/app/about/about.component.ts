import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';
import { SEOService } from '../services/seo.service';
import { JsonLdService } from '../services/json-ld.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  private langSub?: Subscription;

  texts = {
    title: 'Über uns',
    slogan: 'Wir verbinden Afrika mit Europa',
    intro: '',
    goal: '',
    impact: '',
    meaning: '',
    features: '',
    vision: ''
  };

  constructor(
    private languageService: LanguageService,
    private seoService: SEOService,
    private jsonLdService: JsonLdService
  ) {}

  ngOnInit() {
    // SEO pour la page About
    this.seoService.setAboutPage();
    
    // JSON-LD avec organization et breadcrumb
    const schema = this.jsonLdService.getCombinedSchema(
      this.jsonLdService.getOrganizationSchema(),
      this.jsonLdService.getBreadcrumbSchema([
        { name: 'Home', url: 'https://afroconnect.shop' },
        { name: 'Über uns', url: 'https://afroconnect.shop/about' }
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
      title: this.languageService.translate('about.title'),
      slogan: this.languageService.translate('about.slogan'),
      intro: this.languageService.translate('about.intro'),
      goal: this.languageService.translate('about.goal'),
      impact: this.languageService.translate('about.impact'),
      meaning: this.languageService.translate('about.meaning'),
      features: this.languageService.translate('about.features'),
      vision: this.languageService.translate('about.vision')
    };
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }
}
