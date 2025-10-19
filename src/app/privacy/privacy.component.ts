import { Component } from '@angular/core';

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
            AfroConnect<br>
            [Ihre Adresse]<br>
            [Ihre Stadt, PLZ]<br>
            Deutschland<br>
            E-Mail: contact&#64;afroconnect.de
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
            Bei Fragen zum Datenschutz kontaktieren Sie uns unter:<br>
            E-Mail: privacy&#64;afroconnect.de
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .legal-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      min-height: 100vh;
    }
    
    .legal-content {
      line-height: 1.6;
      color: #333;
    }
    
    h1 {
      color: #2c5530;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 0.5rem;
    }
    
    h2 {
      color: #2c5530;
      margin-top: 2rem;
    }
    
    h3 {
      color: #4CAF50;
    }
    
    .last-updated {
      color: #666;
      font-style: italic;
      margin-bottom: 2rem;
    }
    
    section {
      margin-bottom: 2rem;
    }
    
    ul {
      margin-left: 1rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
  `]
})
export class PrivacyComponent {
  currentDate = new Date().toLocaleDateString('de-DE');
}