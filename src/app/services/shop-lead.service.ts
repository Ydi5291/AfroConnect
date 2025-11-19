import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, doc, updateDoc, Timestamp } from '@angular/fire/firestore';

export interface ShopLead {
  id?: string;
  name: string;
  ownerName?: string;
  phone: string;
  email?: string;
  address: string;
  plz: string;
  city: string;
  category: 'shop' | 'restaurant' | 'salon' | 'other';
  status: 'new' | 'contacted' | 'interested' | 'registered';
  source: 'website' | 'whatsapp' | 'phone' | 'visit';
  notes?: string;
  createdAt: Date | Timestamp;
  contactedAt?: Date | Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class ShopLeadService {

  constructor(private firestore: Firestore) {}

  /**
   * Créer un nouveau lead de commerce
   */
  async createShopLead(leadData: Partial<ShopLead>): Promise<string> {
    try {
      const leadsCollection = collection(this.firestore, 'shop-leads');
      
      const dataToSave = {
        ...leadData,
        createdAt: Timestamp.now(),
        status: leadData.status || 'new',
        source: leadData.source || 'website'
      };

      const docRef = await addDoc(leadsCollection, dataToSave);
      console.log('✅ Lead créé avec succès:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de la création du lead:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les leads par statut
   */
  async getLeadsByStatus(status: string): Promise<ShopLead[]> {
    try {
      const leadsCollection = collection(this.firestore, 'shop-leads');
      const q = query(leadsCollection, where('status', '==', status));
      const querySnapshot = await getDocs(q);

      const leads: ShopLead[] = [];
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as ShopLead);
      });

      return leads;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des leads:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les leads
   */
  async getAllLeads(): Promise<ShopLead[]> {
    try {
      const leadsCollection = collection(this.firestore, 'shop-leads');
      const querySnapshot = await getDocs(leadsCollection);

      const leads: ShopLead[] = [];
      querySnapshot.forEach((doc) => {
        leads.push({ id: doc.id, ...doc.data() } as ShopLead);
      });

      return leads;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des leads:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'un lead
   */
  async updateLeadStatus(leadId: string, status: string, notes?: string): Promise<void> {
    try {
      const leadRef = doc(this.firestore, 'shop-leads', leadId);
      
      const updateData: any = {
        status,
        contactedAt: Timestamp.now()
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(leadRef, updateData);
      console.log('✅ Statut du lead mis à jour:', leadId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du lead:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un numéro de téléphone existe déjà
   */
  async phoneExists(phone: string): Promise<boolean> {
    try {
      const leadsCollection = collection(this.firestore, 'shop-leads');
      const q = query(leadsCollection, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du téléphone:', error);
      return false;
    }
  }
}
