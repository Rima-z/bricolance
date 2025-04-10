<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Import axios

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');

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

    // Modification ici pour correspondre à la structure de votre réponse backend
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
      // Si vous voulez gérer le cas où il n'y a pas de client
      profile.value = {
        ...profile.value,
        email: response.data.user.email,
        role: response.data.user.role
      };
    }
  } catch (err) {
    error.value = 'Erreur de chargement du profil';
    console.error(err);
    // Redirection vers la page de connexion si non authentifié
    if (err.response?.status === 401) {
      router.push('/login');
    }
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
    <v-card-title>Mon Profil</v-card-title>
    
    <v-card-text>
      <v-alert v-if="error" type="error" closable>{{ error }}</v-alert>
      
      <template v-if="loading">
        <v-skeleton-loader type="article, actions"></v-skeleton-loader>
      </template>
      
      <template v-else>
        <v-text-field v-model="profile.nom" label="Nom" readonly></v-text-field>
        <v-text-field v-model="profile.prenom" label="Prénom" readonly></v-text-field>
        <v-text-field v-model="profile.email" label="Email" readonly></v-text-field>
        <v-text-field v-model="profile.num_tlf" label="Téléphone" readonly></v-text-field>
        <v-text-field v-model="profile.region" label="Région" readonly></v-text-field>
        <v-textarea v-model="profile.adresse" label="Adresse" readonly></v-textarea>
        
        <v-chip v-if="profile.role" color="primary">
          {{ profile.role === 'prestataire' ? 'Prestataire' : 'Client' }}
        </v-chip>
      </template>
    </v-card-text>
  </v-card>
</template>