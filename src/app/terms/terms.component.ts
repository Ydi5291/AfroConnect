import { Component } from '@angular/core';

@Component({
  selector: 'app-terms',
  standalone: true,
  template: `
    <div class="legal-container">
      <div class="legal-content">
        <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p class="last-updated">Letzte Aktualisierung: {{currentDate}}</p>
        
        <section>
          <h2>§ 1 Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung 
            der AfroConnect-App und aller damit verbundenen Dienste.
          </p>
        </section>

        <section>
          <h2>§ 2 Beschreibung der Dienstleistung</h2>
          <p>
            AfroConnect ist eine Plattform zur Entdeckung afrikanischer 
            Geschäfte, Restaurants und Dienstleistungen in Deutschland.
          </p>
          <h3>2.1 Funktionen</h3>
          <ul>
            <li>Suche nach Afroshops in der Nähe</li>
            <li>Detailinformationen zu Geschäften</li>
            <li>Bewertungen und Kommentare</li>
            <li>Kartenansicht und Navigation</li>
          </ul>
        </section>

        <section>
          <h2>§ 3 Nutzerkonto</h2>
          <h3>3.1 Registrierung</h3>
          <p>
            Für bestimmte Funktionen ist eine Registrierung erforderlich. 
            Sie verpflichten sich, wahrheitsgemäße Angaben zu machen.
          </p>
          
          <h3>3.2 Passwort und Sicherheit</h3>
          <p>
            Sie sind für die Geheimhaltung Ihres Passworts verantwortlich 
            und haften für alle Aktivitäten unter Ihrem Konto.
          </p>
        </section>

        <section>
          <h2>§ 4 Nutzungsregeln</h2>
          <p>Bei der Nutzung von AfroConnect verpflichten Sie sich:</p>
          <ul>
            <li>Keine rechtswidrigen Inhalte zu veröffentlichen</li>
            <li>Keine beleidigenden oder diskriminierenden Inhalte</li>
            <li>Nur wahrheitsgemäße Informationen anzugeben</li>
            <li>Die Rechte Dritter zu respektieren</li>
          </ul>
        </section>

        <section>
          <h2>§ 5 Inhalte und Urheberrecht</h2>
          <h3>5.1 Nutzergenerierte Inhalte</h3>
          <p>
            Durch das Hochladen von Inhalten gewähren Sie AfroConnect 
            das Recht, diese Inhalte zu nutzen, zu bearbeiten und zu veröffentlichen.
          </p>
          
          <h3>5.2 Verantwortung</h3>
          <p>
            Sie sind allein verantwortlich für die von Ihnen hochgeladenen Inhalte 
            und deren Rechtmäßigkeit.
          </p>
        </section>

        <section>
          <h2>§ 6 Haftung</h2>
          <p>
            AfroConnect haftet nur für Schäden, die auf vorsätzlichem oder 
            grob fahrlässigem Verhalten beruhen.
          </p>
        </section>

        <section>
          <h2>§ 7 Änderungen der AGB</h2>
          <p>
            Wir behalten uns vor, diese AGB jederzeit zu ändern. 
            Änderungen werden per E-Mail mitgeteilt.
          </p>
        </section>

        <section>
          <h2>§ 8 Kündigung</h2>
          <p>
            Sie können Ihr Konto jederzeit löschen. Wir können Konten bei 
            Verstößen gegen diese AGB sperren oder löschen.
          </p>
        </section>

        <section>
          <h2>§ 9 Anwendbares Recht</h2>
          <p>
            Es gilt deutsches Recht. Gerichtsstand ist Werl, Deutschland.
          </p>
        </section>

        <section>
          <h2>§ 10 Kontakt</h2>
          <p>
            <strong>AfroConnect</strong><br>
            Kapuzinerring 26<br>
            59457 Werl<br>
            Deutschland<br><br>
            E-Mail: lamaid0502&#64;gmail.com<br><br>
            Bei Fragen zu diesen AGB oder zur Nutzung der App kontaktieren Sie uns gerne über die oben genannten Kontaktdaten.
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
      text-align: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      color: #2c5530;
      margin-top: 2rem;
      text-align: center;
    }
    h3 {
      color: #4CAF50;
      text-align: center;
    }
    .last-updated {
      color: #666;
      font-style: italic;
      margin-bottom: 2rem;
      text-align: center;
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
    .legal-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .legal-content {
      width: 100%;
      max-width: 800px;
    }
    @media (max-width: 600px) {
      .legal-container {
        padding: 0.5rem;
        min-height: 90vh;
      }
      h1 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
      }
      h2 {
        font-size: 1.05rem;
        margin-top: 1.2rem;
      }
      h3 {
        font-size: 1rem;
      }
      .legal-content {
        padding: 0.2rem;
      }
      section {
        margin-bottom: 1.2rem;
      }
    }
  `]
})
export class TermsComponent {
  currentDate = new Date().toLocaleDateString('de-DE');
}