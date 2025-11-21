# 📜 Guide Scroll Smooth - AfroConnect

## ✅ Ce qui a été ajouté

### **1. Scroll smooth global (CSS)**
- ✅ `scroll-behavior: smooth` sur tout le site
- ✅ `scroll-padding-top: 80px` pour compenser le header fixe
- ✅ `:target` avec `scroll-margin-top: 100px` pour les ancres

### **2. Scroll automatique au changement de page**
- ✅ Scroll vers le top à chaque navigation (AppComponent)
- ✅ Animation smooth automatique

### **3. ScrollService** (src/app/services/scroll.service.ts)
Service utilitaire avec 12 méthodes :
- `scrollToTop()` - Scroll vers le haut
- `scrollToElement(id)` - Scroll vers un élément par ID
- `scrollToPosition(y)` - Scroll vers une position Y
- `scrollToElementWithOffset(element, offset)` - Scroll avec décalage
- `scrollToSelector(selector)` - Scroll vers un sélecteur CSS
- `isElementInViewport(element)` - Vérifier si visible
- `getCurrentScrollPosition()` - Position actuelle
- `isAtTop()` / `isAtBottom()` - Détecter position
- `enableSmoothScroll()` / `disableSmoothScroll()` - Toggle

### **4. SmoothScrollDirective** (src/app/directives/smooth-scroll.directive.ts)
Directive Angular pour les liens et boutons :
```typescript
<a smoothScroll>Lien</a>
<button smoothScroll scrollTarget="section-id">Bouton</button>
```

---

## 🚀 Utilisation

### **Méthode 1 : Automatique (déjà actif)**
Le scroll smooth fonctionne automatiquement sur :
- ✅ Tous les liens de navigation
- ✅ Tous les changements de page
- ✅ Toutes les ancres (`<a href="#section">`)

### **Méthode 2 : Utiliser le service dans un composant**

```typescript
import { ScrollService } from './services/scroll.service';

export class MyComponent {
  constructor(private scrollService: ScrollService) {}

  goToTop() {
    this.scrollService.scrollToTop();
  }

  goToSection() {
    this.scrollService.scrollToElement('section-id', 80);
  }

  goToShop(shop: AfroshopData) {
    this.router.navigate(['/shop', shop.id]);
    // Scroll automatique géré par AppComponent
  }
}
```

### **Méthode 3 : Utiliser la directive**

**Dans le template HTML** :
```html
<!-- Scroll vers le top -->
<button smoothScroll>Retour en haut</button>

<!-- Scroll vers une section spécifique -->
<a smoothScroll scrollTarget="contact-section">Contact</a>

<!-- Avec offset personnalisé -->
<button smoothScroll scrollTarget="gallery" [scrollOffset]="100">
  Voir la galerie
</button>
```

**Importer la directive** :
```typescript
import { SmoothScrollDirective } from './directives/smooth-scroll.directive';

@Component({
  imports: [CommonModule, SmoothScrollDirective],
  // ...
})
```

---

## 📋 Exemples concrets

### **1. Bouton "Retour en haut"** (Footer)

```html
<button 
  class="back-to-top"
  (click)="scrollToTop()">
  ↑ Haut de page
</button>
```

```typescript
scrollToTop() {
  this.scrollService.scrollToTop();
}
```

### **2. Navigation vers section** (Header)

```html
<nav>
  <a smoothScroll scrollTarget="about-section">À propos</a>
  <a smoothScroll scrollTarget="shops-section">Nos shops</a>
  <a smoothScroll scrollTarget="contact-section">Contact</a>
</nav>
```

### **3. Scroll après chargement de données**

```typescript
loadShops() {
  this.afroshopService.getAllAfroshops().subscribe(shops => {
    this.shops = shops;
    
    // Scroll vers la section des résultats
    setTimeout(() => {
      this.scrollService.scrollToElement('results-section');
    }, 300);
  });
}
```

### **4. Scroll conditionnel**

```typescript
showShopDetails(shop: AfroshopData) {
  // Naviguer vers la page shop
  this.router.navigate(['/shop', shop.id]);
  
  // Le scroll vers le top est automatique (AppComponent)
  // Pas besoin de code supplémentaire !
}
```

### **5. Détecter la position de scroll**

```typescript
@HostListener('window:scroll', [])
onWindowScroll() {
  // Afficher le bouton "Retour en haut" si pas au top
  this.showBackToTop = !this.scrollService.isAtTop();
  
  // Charger plus de contenu si en bas
  if (this.scrollService.isAtBottom(200)) {
    this.loadMoreShops();
  }
}
```

---

## 🎨 Styles CSS pour bouton "Retour en haut"

```css
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
}
```

```typescript
showBackToTop = false;

@HostListener('window:scroll', [])
onScroll() {
  this.showBackToTop = window.pageYOffset > 300;
}
```

```html
<button 
  class="back-to-top"
  [class.visible]="showBackToTop"
  (click)="scrollService.scrollToTop()">
  ↑
</button>
```

---

## ⚙️ Configuration avancée

### **Désactiver temporairement le smooth scroll**

Utile pour les animations ou le positionnement précis :

```typescript
// Désactiver
this.scrollService.disableSmoothScroll();

// Positionner instantanément
window.scrollTo(0, 500);

// Réactiver
this.scrollService.enableSmoothScroll();
```

### **Changer l'offset du header**

Dans `styles.css` :
```css
html {
  scroll-padding-top: 100px; /* Augmenter si header plus grand */
}
```

Ou programmatiquement :
```typescript
this.scrollService.scrollToElement('section-id', 120); // Offset personnalisé
```

---

## 🔧 Intégration dans les composants existants

### **GalleryComponent**
```typescript
// Ajouter au constructeur
constructor(
  // ... autres services
  private scrollService: ScrollService
) {}

// Après filtrage des shops
filterShops() {
  // ... logique de filtrage
  
  // Scroll vers les résultats
  this.scrollService.scrollToElement('shops-grid');
}
```

### **CityComponent**
```typescript
goToShop(shop: AfroshopData): void {
  this.router.navigate(['/shop', shop.id]);
  // Scroll automatique géré par AppComponent ✅
}
```

### **ShopComponent**
```typescript
// Scroll vers les produits après ajout au panier
addToCart(product: Product): void {
  this.cartItems.push({ product, quantity: 1 });
  this.saveCartToLocalStorage();
  
  // Scroll vers le panier
  this.scrollService.scrollToElement('cart-section');
}
```

---

## 📊 Avantages

✅ **UX améliorée** - Navigation fluide et agréable  
✅ **Accessibilité** - Meilleure pour les utilisateurs avec mobilité réduite  
✅ **Moderne** - Standard web actuel  
✅ **SEO friendly** - Google aime les sites avec bonne UX  
✅ **Mobile-friendly** - Fonctionne parfaitement sur mobile  
✅ **Performant** - Utilise l'API native du navigateur  

---

## 🎯 Résultat

Maintenant, sur AfroConnect :
- ✅ Chaque clic sur un lien = scroll smooth vers le top
- ✅ Chaque ancre (#section) = scroll smooth avec offset
- ✅ Navigation fluide et professionnelle
- ✅ Expérience utilisateur premium

**Ton site est maintenant plus moderne et agréable à utiliser ! 🚀**
