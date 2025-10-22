
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})

export class CookieConsentComponent implements OnInit {
  consentGiven = localStorage.getItem('cookie_consent') === 'true';
  showBanner = !this.consentGiven;

  accept() {
    localStorage.setItem('cookie_consent', 'true');
    this.showBanner = false;
    this.loadAnalytics();
  }

  decline() {
    localStorage.setItem('cookie_consent', 'false');
    this.showBanner = false;
  }

  loadAnalytics() {
    if (!window.gaLoaded) {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-4VZ4WFYE9M';
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', 'G-4VZ4WFYE9M', { 'anonymize_ip': true });
        window.gaLoaded = true;
      };
    }
  }

  ngOnInit() {
    if (this.consentGiven) {
      this.loadAnalytics();
    }
  }
}
