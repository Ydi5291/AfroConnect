import { Component, OnInit } from '@angular/core';
import { SEOService } from '../services/seo.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="legal-container">
      <div class="legal-content">
        <h1>Datenschutzerklärung</h1>
        <p class="last-updated">Letzte Aktualisierung: {{currentDate}}</p>
        
        <section>
          <h2>1. Verantwortlicher</h2>
          <p>
            <strong>AfroConnect</strong><br>
            Kapuzinerring 26<br>
            59457 Werl<br>
            Deutschland<br><br>
            E-Mail: lamaid0502&#64;gmail.com<br><br>
            Der Verantwortliche im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist die oben genannte Person.
          </p>
        </section>

        <section>
          <h2>2. Erhobene Daten</h2>
          <h3>2.1 Nutzungsdaten</h3>
          <ul>
            <li>IP-Adresse</li>
            <li>Browser-Informationen</li>
            <li>Zugriffszeitpunkt</li>
            <li>Besuchte Seiten</li>
          </ul>
          
          <h3>2.2 Standortdaten</h3>
          <p>
            Mit Ihrer Einwilligung nutzen wir Ihren Standort, um Ihnen Afroshops 
            in Ihrer Nähe anzuzeigen. Die Standortdaten werden nicht gespeichert.
          </p>
          
          <h3>2.3 Registrierungsdaten</h3>
          <ul>
            <li>E-Mail-Adresse</li>
            <li>Benutzername</li>
            <li>Passwort (verschlüsselt)</li>
          </ul>
        </section>

        <section>
          <h2>3. Zweck der Datenverarbeitung</h2>
          <ul>
            <li>Bereitstellung der App-Funktionen</li>
            <li>Benutzerauthentifizierung</li>
            <li>Anzeige lokaler Afroshops</li>
            <li>Verbesserung der Nutzererfahrung</li>
          </ul>
        </section>

        <section>
          <h2>4. Rechtsgrundlage</h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von:
          </p>
          <ul>
            <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
            <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
            <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)</li>
          </ul>
        </section>

        <section>
          <h2>5. Datenweitergabe</h2>
          <p>
            Ihre Daten werden nicht an Dritte weitergegeben, außer:
          </p>
          <ul>
            <li>Google Firebase (Hosting und Datenbank)</li>
            <li>Bei gesetzlicher Verpflichtung</li>
          </ul>
        </section>

        <section>
          <h2>6. Speicherdauer</h2>
          <p>
            Daten werden gespeichert, solange Ihr Konto aktiv ist oder 
            zur Erfüllung rechtlicher Verpflichtungen erforderlich.
          </p>
        </section>

        <section>
          <h2>7. Ihre Rechte</h2>
          <ul>
            <li>Auskunft über gespeicherte Daten</li>
            <li>Berichtigung falscher Daten</li>
            <li>Löschung Ihrer Daten</li>
            <li>Einschränkung der Verarbeitung</li>
            <li>Datenübertragbarkeit</li>
            <li>Widerspruch gegen Verarbeitung</li>
          </ul>
        </section>

        <section>
          <h2>8. Kontakt</h2>
          <p>
            <strong>Verantwortlicher für den Datenschutz:</strong><br><br>
            <strong>AfroConnect</strong><br>
            Kapuzinerring 26<br>
            59457 Werl<br>
            Deutschland<br><br>
            E-Mail: lamaid0502&#64;gmail.com<br><br>
            Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns gerne über die oben genannten Kontaktdaten.
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      max-width: 700px;
      margin: 2rem auto;
      padding: 1.5rem;
      background: #f9f9f9;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(49,130,206,0.08);
    }
    h1, h2 {
      color: #3182ce;
      margin-bottom: 1rem;
    }
    .last-updated {
      font-size: 0.98rem;
      color: #4a5568;
      margin-bottom: 1.5rem;
    }
    p, ul, li {
      font-size: 1.08rem;
      margin-bottom: 1rem;
    }
    ul {
      padding-left: 1.2rem;
    }
    section {
      margin-bottom: 2rem;
    }
  `]
})
export class PrivacyComponent implements OnInit {
  currentDate = new Date().toLocaleDateString('de-DE');

  constructor(private seoService: SEOService) {}

  ngOnInit() {
    // SEO pour la page privacy (noindex)
    this.seoService.setPrivacyPage();
  }
}