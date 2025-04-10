<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const isEditing = ref(false);
const successMessage = ref('');

interface Profile {
  id: number | null;
  nom: string;
  prenom: string;
  email: string;
  num_tlf: string;
  region: string;
  adresse: string;
  role?: string;
}

const profile = ref<Profile>({
  id: null,
  nom: '',
  prenom: '',
  email: '',
  num_tlf: '',
  region: '',
  adresse: ''
});

const fetchProfile = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    if (!authStore.isAuthenticated && !(await authStore.checkAuth())) {
      throw new Error('Not authenticated');
    }

    const response = await axios.get('http://localhost:8000/api/auth/me', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    if (response.data?.client) {
      profile.value = {
        id: response.data.client.id,
        nom: response.data.client.nom || '',
        prenom: response.data.client.prenom || '',
        email: response.data.user.email,
        num_tlf: response.data.client.num_tlf || '',
        region: response.data.client.region || '',
        adresse: response.data.client.adresse || '',
        role: response.data.user.role
      };
    } else if (response.data?.user) {
      profile.value = {
        ...profile.value,
        email: response.data.user.email,
        role: response.data.user.role
      };
    }
  } catch (err) {
    error.value = 'Erreur de chargement du profil';
    console.error(err);
    if (err.response?.status === 401) {
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  loading.value = true;
  error.value = '';
  successMessage.value = '';
  
  try {
    const response = await axios.put(
      'http://localhost:8000/api/auth/profile/update',
      {
        nom: profile.value.nom,
        prenom: profile.value.prenom,
        email: profile.value.email,
        num_tlf: profile.value.num_tlf,
        region: profile.value.region,
        adresse: profile.value.adresse
      },
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    );

    successMessage.value = 'Profil mis à jour avec succès';
    isEditing.value = false;
    // Rafraîchir les données
    await fetchProfile();
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <v-card elevation="10" class="mx-auto" max-width="800">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Mon Profil</span>
      <v-btn
        v-if="!isEditing"
        @click="isEditing = true"
        color="primary"
        variant="outlined"
      >
        Modifier
      </v-btn>
      <div v-else>
        <v-btn @click="isEditing = false" variant="text" class="mr-2">Annuler</v-btn>
        <v-btn @click="updateProfile" color="primary" :loading="loading">Enregistrer</v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <v-alert v-if="error" type="error" closable @click:close="error = ''">{{ error }}</v-alert>
      <v-alert v-if="successMessage" type="success" closable @click:close="successMessage = ''">
        {{ successMessage }}
      </v-alert>
      
      <template v-if="loading && !isEditing">
        <v-skeleton-loader type="article, actions"></v-skeleton-loader>
      </template>
      
      <template v-else>
        <v-text-field 
          v-model="profile.nom" 
          label="Nom" 
          :readonly="!isEditing"
          :variant="isEditing ? 'outlined' : 'underlined'"
        ></v-text-field>
        
        <v-text-field 
          v-model="profile.prenom" 
          label="Prénom" 
          :readonly="!isEditing"
          :variant="isEditing ? 'outlined' : 'underlined'"
        ></v-text-field>
        
        <v-text-field 
          v-model="profile.email" 
          label="Email" 
          :readonly="!isEditing"
          :variant="isEditing ? 'outlined' : 'underlined'"
        ></v-text-field>
        
        <v-text-field 
          v-model="profile.num_tlf" 
          label="Téléphone" 
          :readonly="!isEditing"
          :variant="isEditing ? 'outlined' : 'underlined'"
        ></v-text-field>
        
        <v-text-field 
          v-model="profile.region" 
          label="Région" 
          :readonly="!isEditing"
          :variant="isEditing ? 'outlined' : 'underlined'"
        ></v-text-field>
        
        <v-textarea 
          v-model="profile.adresse" 
          label="Adresse" 
          :readonly="!isEditing"
          :variant="isEditing ? 'outlined' : 'underlined'"
        ></v-textarea>
        
        <v-chip v-if="profile.role" color="primary">
          {{ profile.role === 'prestataire' ? 'Prestataire' : 'Client' }}
        </v-chip>
      </template>
    </v-card-text>
  </v-card>
</template>