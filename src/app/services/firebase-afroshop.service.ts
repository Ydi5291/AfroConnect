import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDocs,
  getDoc,
  limit
} from '@angular/fire/firestore';
import { 
  Storage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AfroshopData } from './image.service';

export interface FirebaseAfroshop extends Omit<AfroshopData, 'id'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  verified: boolean;
  ownerId?: string; // ID du propriétaire
  views: number;
  likes: number;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseAfroshopService {

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) { }

  // Obtenir tous les Afroshops
  getAllAfroshops(): Observable<AfroshopData[]> {
    console.log('🔥 Début getAllAfroshops()');
    const afroshopsRef = collection(this.firestore, 'afroshops');
    
    return from(getDocs(afroshopsRef)).pipe(
      map((querySnapshot) => {
        console.log('🔥 Documents bruts depuis Firebase:', querySnapshot.size);
        
        const docs: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data['id'] = doc.id; // Ajouter l'ID du document
          docs.push(data);
        });
        
        console.log('🔥 Premier document:', docs[0]);
        console.log('🔥 Tous les noms:', docs.map(d => d.name));
        
        const mapped = docs.map(doc => this.mapFirebaseDocToAfroshopData(doc));
        console.log('🔥 Documents mappés:', mapped.length);
        console.log('🔥 Noms après mapping:', mapped.map(m => m.name));
        
        // Tri manuel par nom
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        
        return mapped;
      })
    );
  }

  // Mapper un document Firebase vers AfroshopData
  private mapFirebaseDocToAfroshopData(doc: any): AfroshopData {
    console.log('🔥 Mapping document:', doc.name, doc);
    
    const result: any = {
      id: doc.id, // Garder comme string pour les IDs Firebase
      name: doc.name || '',
      type: doc.type || 'services',
      address: doc.address || '',
      coordinates: {
        lat: doc.coordinates?.lat || 0,
        lng: doc.coordinates?.lng || 0
      },
      phone: doc.phone || '',
      description: doc.description || '',
      rating: doc.rating || 4.0,
      image: doc.image || '',
      cuisine: doc.cuisine || '',
      priceLevel: doc.priceLevel || 2,
      hours: doc.hours || '',
      website: doc.website || '',
      // Champs additionnels Firebase
      createdBy: doc.createdBy,
      createdByName: doc.createdByName,
      createdAt: doc.createdAt,
      verified: doc.verified
    };
    
    console.log('🔥 Résultat mapping:', result.name, result);
    console.log('🔥 CreatedBy dans mapping:', result.createdBy);
    return result;
  }

  // Obtenir les Afroshops par ville
  getAfroshopsByCity(city: string): Observable<AfroshopData[]> {
    const afroshopsRef = collection(this.firestore, 'afroshops');
    const q = query(
      afroshopsRef, 
      where('city', '==', city.toLowerCase()),
      orderBy('name')
    );
    return collectionData(q, { idField: 'id' }) as Observable<AfroshopData[]>;
  }

  // Obtenir les Afroshops par type
  getAfroshopsByType(type: AfroshopData['type']): Observable<AfroshopData[]> {
    const afroshopsRef = collection(this.firestore, 'afroshops');
    const q = query(
      afroshopsRef, 
      where('type', '==', type),
      orderBy('rating', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<AfroshopData[]>;
  }

  // Obtenir un Afroshop par ID
  async getAfroshopById(id: string): Promise<AfroshopData | undefined> {
    try {
      const afroshopRef = doc(this.firestore, 'afroshops', id);
      const docSnap = await getDoc(afroshopRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return this.mapFirebaseDocToAfroshopData({ ...data, id: docSnap.id });
      }
      return undefined;
    } catch (error) {
      console.error('Fehler beim Laden des Afroshops:', error);
      return undefined;
    }
  }

  // Ajouter un nouvel Afroshop
  async addAfroshop(afroshop: Omit<FirebaseAfroshop, 'createdAt' | 'updatedAt' | 'views' | 'likes'>): Promise<string> {
    const afroshopsRef = collection(this.firestore, 'afroshops');
    const newAfroshop = {
      ...afroshop,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      verified: false // Par défaut non vérifié
    };
    
    const docRef = await addDoc(afroshopsRef, newAfroshop);
    return docRef.id;
  }

  // Mettre à jour un Afroshop
  async updateAfroshop(id: string, afroshop: Partial<FirebaseAfroshop>): Promise<void> {
    const afroshopRef = doc(this.firestore, 'afroshops', id);
    const updateData = {
      ...afroshop,
      updatedAt: new Date()
    };
    await updateDoc(afroshopRef, updateData);
  }

  // Supprimer un Afroshop
  async deleteAfroshop(id: string): Promise<void> {
    const afroshopRef = doc(this.firestore, 'afroshops', id);
    await deleteDoc(afroshopRef);
  }

  // Rechercher des Afroshops
  searchAfroshops(searchTerm: string): Observable<AfroshopData[]> {
    const afroshopsRef = collection(this.firestore, 'afroshops');
    // Note: Firestore ne supporte pas la recherche full-text native
    // Pour une vraie recherche, vous pourriez utiliser Algolia ou ElasticSearch
    // Ici on fait une recherche simple par nom commençant par le terme
    const q = query(
      afroshopsRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(20)
    );
    return collectionData(q, { idField: 'id' }) as Observable<AfroshopData[]>;
  }

  // Obtenir les Afroshops les mieux notés
  getTopRatedAfroshops(limitCount: number = 10): Observable<AfroshopData[]> {
    const afroshopsRef = collection(this.firestore, 'afroshops');
    const q = query(
      afroshopsRef,
      where('verified', '==', true),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    return collectionData(q, { idField: 'id' }) as Observable<AfroshopData[]>;
  }

  // Incrémenter le nombre de vues
  async incrementViews(id: string): Promise<void> {
    try {
      const afroshopRef = doc(this.firestore, 'afroshops', id);
      // Utiliser une mise à jour simple pour éviter les conflits de types
      await updateDoc(afroshopRef, {
        views: 1 // Sera amélioré plus tard avec increment()
      });
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  }

  // Upload d'image vers Firebase Storage
  async uploadImage(file: File): Promise<string> {
    try {
      console.log('🔥 Firebase Storage upload démarré...');
      console.log('📁 Fichier à upload:', file.name, `${(file.size / 1024).toFixed(0)}KB`);
      
      // Vérifier que le storage est initialisé
      if (!this.storage) {
        throw new Error('Firebase Storage non initialisé');
      }
      
      // Créer un nom unique pour le fichier
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `afroshops/${timestamp}_${cleanFileName}`;
      console.log('📝 Nom du fichier:', fileName);
      
      const storageRef = ref(this.storage, fileName);
      console.log('📍 Référence créée:', storageRef);
      
      // Upload du fichier
      console.log('⬆️ Upload en cours...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('✅ Upload terminé, snapshot:', snapshot);
      
      // Récupérer l'URL de téléchargement
      console.log('🔗 Récupération URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ URL obtenue:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Erreur Firebase Storage:', error);
      console.error('❌ Type d\'erreur:', typeof error);
      console.error('❌ Stack:', error instanceof Error ? error.stack : 'Pas de stack');
      
      if (error instanceof Error) {
        throw new Error(`Firebase Storage Fehler: ${error.message}`);
      } else {
        throw new Error('Unbekannter Firebase Storage Fehler');
      }
    }
  }
}
