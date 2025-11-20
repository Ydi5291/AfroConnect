import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SEOService } from './services/seo.service';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './impressum.component.html',
   styleUrls: ['./impressum.component.css']
})
export class ImpressumComponent implements OnInit {
  constructor(private seoService: SEOService) {}

  ngOnInit() {
    // SEO pour la page Impressum (noindex)
    this.seoService.setImpressumPage();
  }
}
