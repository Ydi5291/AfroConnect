import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GeocodingService, GeocodeResult } from '../services/geocoding.service';
import { FirebaseAfroshopService } from '../services/firebase-afroshop.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-geocoding-diagnostic',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="diagnostic-container" *ngIf="isAdmin">
      <div class="diagnostic-header">
        <div class="header-content">
          <h2>🔧 Diagnostic du Géocodage</h2>
          <a routerLink="/admin" class="back-to-admin-btn">
            ← Zurück zur Admin-Seite
          </a>
        </div>
      </div>
      
      <!-- Test d'adresse unique -->
      <div class="test-section">
        <h3>Test d'Adresse</h3>
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="testAddress" 
            placeholder="Saisissez une adresse allemande..."
            class="test-input">
          <button (click)="testSingleAddress()" [disabled]="isGeocoding" class="test-btn">
            <span *ngIf="!isGeocoding">🗺️ Tester</span>
            <span *ngIf="isGeocoding">⏳ Test...</span>
          </button>
        </div>
        
        <div *ngIf="testResult" class="result-box">
          <div *ngIf="testResult.success" class="success-result">
            <h4>✅ Géocodage Réussi</h4>
            <p><strong>Coordonnées:</strong> {{testResult.lat}}, {{testResult.lng}}</p>
            <p><strong>Adresse formatée:</strong> {{testResult.formatted_address}}</p>
            <p><strong>Précision:</strong> {{testResult.accuracy}}</p>
          </div>
          
          <div *ngIf="!testResult.success" class="error-result">
            <h4>❌ Géocodage Échoué</h4>
            <p>L'adresse n'a pas pu être géocodée.</p>
            <p><em>Vérifiez que l'adresse contient une ville allemande connue.</em></p>
          </div>
        </div>
      </div>

      <!-- Scan des Afroshops existants -->
      <div class="test-section">
        <h3>Audit des Coordonnées</h3>
        <button (click)="auditAfroshops()" [disabled]="isAuditing" class="audit-btn">
          <span *ngIf="!isAuditing">🔍 Auditer tous les Afroshops</span>
          <span *ngIf="isAuditing">⏳ Audit en cours...</span>
        </button>
        
        <div *ngIf="auditResults.length > 0" class="audit-results">
          <h4>Résultats de l'Audit</h4>
          
          <div class="stats">
            <div class="stat-item">
              <span class="stat-number">{{validCoordinates}}</span>
              <span class="stat-label">Coordonnées Valides</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{invalidCoordinates}}</span>
              <span class="stat-label">Coordonnées Invalides</span>
            </div>
          </div>
          
          <div *ngIf="invalidAfroshops.length > 0" class="invalid-list">
            <h5>⚠️ Afroshops avec Coordonnées Invalides</h5>
            <div *ngFor="let afroshop of invalidAfroshops" class="invalid-item">
              <strong>{{afroshop.name}}</strong><br>
              <small>{{afroshop.address}}</small><br>
              <span class="coordinates">Coordonnées: {{afroshop.coordinates.lat}}, {{afroshop.coordinates.lng}}</span>
              <button (click)="regeocodeAfroshop(afroshop)" [disabled]="isRegeocoding" class="regeocode-btn">
                🔄 Re-géocoder
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Configuration actuelle -->
      <div class="test-section">
        <h3>Configuration Système</h3>
        <div class="config-info">
          <div class="config-item">
            <strong>Mode de géocodage:</strong> 
            <span class="mode-indicator">{{geocodingMode}}</span>
          </div>
          <div class="config-item">
            <strong>Villes supportées:</strong> 
            <span>{{supportedCitiesCount}} villes</span>
          </div>
          <div class="config-item">
            <strong>Estimation par code postal:</strong> 
            <span class="feature-enabled">✅ Activée</span>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!isAdmin" class="no-access">
      🔒 Accès réservé aux administrateurs
    </div>
  `,
  styles: [`
    .diagnostic-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .diagnostic-header {
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .header-content h2 {
      margin: 0;
      color: #333;
    }

    .back-to-admin-btn {
      background: linear-gradient(135deg, #6c757d, #5a6268);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .back-to-admin-btn:hover {
      background: linear-gradient(135deg, #5a6268, #495057);
      transform: translateY(-1px);
      text-decoration: none;
      color: white;
    }

    .test-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .test-section h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 8px;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .test-input {
      flex: 1;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .test-btn, .audit-btn {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }

    .test-btn:hover, .audit-btn:hover {
      background: #0056b3;
    }

    .test-btn:disabled, .audit-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .result-box {
      margin-top: 15px;
      padding: 15px;
      border-radius: 6px;
    }

    .success-result {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }

    .error-result {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .stats {
      display: flex;
      gap: 20px;
      margin: 15px 0;
    }

    .stat-item {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stat-number {
      display: block;
      font-size: 24px;
      font-weight: bold;
      color: #007bff;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }

    .invalid-item {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 6px;
      border-left: 4px solid #ffc107;
    }

    .coordinates {
      color: #666;
      font-family: monospace;
    }

    .regeocode-btn {
      margin-top: 8px;
      padding: 5px 10px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 3px;
      font-size: 12px;
      cursor: pointer;
    }

    .config-info {
      background: white;
      padding: 15px;
      border-radius: 6px;
    }

    .config-item {
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
    }

    .mode-indicator {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 14px;
    }

    .feature-enabled {
      color: #28a745;
    }

    .no-access {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 18px;
    }
  `]
})
export class GeocodingDiagnosticComponent {
  isAdmin = false;
  testAddress = '';
  isGeocoding = false;
  isAuditing = false;
  isRegeocoding = false;
  
  testResult: any = null;
  auditResults: any[] = [];
  invalidAfroshops: any[] = [];
  
  get validCoordinates() {
    return this.auditResults.filter(a => 
      this.geocodingService.isValidCoordinates(a.coordinates.lat, a.coordinates.lng)
    ).length;
  }
  
  get invalidCoordinates() {
    return this.auditResults.length - this.validCoordinates;
  }

  get geocodingMode() {
    // Vérifier si une clé API Google Maps est configurée
    return 'Fallback (Villes prédéfinies)';
  }

  get supportedCitiesCount() {
    return 50; // Nombre approximatif de villes supportées
  }

  constructor(
    private geocodingService: GeocodingService,
    private firebaseService: FirebaseAfroshopService,
    private authService: AuthService
  ) {
    // Vérifier si l'utilisateur est admin
    this.authService.user$.subscribe(user => {
      this.isAdmin = user?.email === 'youssoufdiamaldiallo@gmail.com';
    });
  }

  async testSingleAddress() {
    if (!this.testAddress.trim()) return;
    
    this.isGeocoding = true;
    this.testResult = null;
    
    try {
      this.geocodingService.geocodeAddress(this.testAddress).subscribe({
        next: (result: GeocodeResult | null) => {
          this.isGeocoding = false;
          if (result) {
            this.testResult = {
              success: true,
              lat: result.lat,
              lng: result.lng,
              formatted_address: result.formatted_address,
              accuracy: result.accuracy
            };
          } else {
            this.testResult = { success: false };
          }
        },
        error: (error) => {
          this.isGeocoding = false;
          this.testResult = { success: false, error: error.message };
          console.error('Erreur test géocodage:', error);
        }
      });
    } catch (error) {
      this.isGeocoding = false;
      this.testResult = { success: false };
      console.error('Erreur test géocodage:', error);
    }
  }

  async auditAfroshops() {
    this.isAuditing = true;
    this.auditResults = [];
    this.invalidAfroshops = [];
    
    try {
      this.firebaseService.getAllAfroshops().subscribe({
        next: (afroshops) => {
          this.auditResults = afroshops;
          
          this.invalidAfroshops = afroshops.filter((afroshop: any) => 
            !this.geocodingService.isValidCoordinates(
              afroshop.coordinates.lat, 
              afroshop.coordinates.lng
            )
          );
          
          console.log(`Audit terminé: ${this.validCoordinates}/${this.auditResults.length} coordonnées valides`);
          this.isAuditing = false;
        },
        error: (error) => {
          console.error('Erreur audit:', error);
          this.isAuditing = false;
        }
      });
    } catch (error) {
      console.error('Erreur audit:', error);
      this.isAuditing = false;
    }
  }

  async regeocodeAfroshop(afroshop: any) {
    this.isRegeocoding = true;
    
    try {
      this.geocodingService.geocodeAddress(afroshop.address).subscribe({
        next: async (result: GeocodeResult | null) => {
          if (result) {
            // Mettre à jour les coordonnées dans Firebase
            const updateData = {
              coordinates: {
                lat: result.lat,
                lng: result.lng
              }
            };
            
            await this.firebaseService.updateAfroshop(afroshop.id, updateData);
            
            // Mettre à jour localement
            const index = this.invalidAfroshops.findIndex(a => a.id === afroshop.id);
            if (index >= 0) {
              this.invalidAfroshops[index].coordinates = updateData.coordinates;
            }
            
            console.log(`✅ Re-géocodage réussi pour ${afroshop.name}`);
          } else {
            console.warn(`❌ Re-géocodage échoué pour ${afroshop.name}`);
          }
          this.isRegeocoding = false;
        },
        error: (error) => {
          console.error(`Erreur re-géocodage ${afroshop.name}:`, error);
          this.isRegeocoding = false;
        }
      });
    } catch (error) {
      console.error(`Erreur re-géocodage ${afroshop.name}:`, error);
      this.isRegeocoding = false;
    }
  }
}