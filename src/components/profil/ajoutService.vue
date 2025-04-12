<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');
const services = ref([]);
const hasPrestataireProfile = ref(true); // Contrôle affichage bouton créer profil

interface Categorie {
  id: number;
  nom: string;
}

interface SousCategorie {
  id: number;
  nom: string;
}

interface Portfolio {
  images: string[];
  description: string;
}

interface Service {
  id: number;
  prix: number;
  description: string;
  categorie: Categorie;
  sous_categorie: SousCategorie;
  portfolio?: Portfolio;
}

const fetchServices = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await axios.get('http://localhost:8000/api/auth/prestataire/services', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    if (Array.isArray(response.data)) {
      services.value = response.data;
    } else {
      services.value = response.data.services ?? [];
    }

  } catch (err: any) {
    if (err.response?.status === 404 && err.response?.data?.has_prestataire === false) {
      hasPrestataireProfile.value = false;
      error.value = 'Vous devez créer un profil prestataire avant d\'ajouter des services.';
    } else {
      error.value = err.response?.data?.message || err.message || 'Erreur lors du chargement des services';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchServices);
</script>

<template>
  <v-card elevation="10">
    <v-card-item class="pa-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h5 class="text-h5 mb-1 font-weight-semibold">Mes Services</h5>
        </div>

        <v-btn
          v-if="hasPrestataireProfile"
          color="primary"
          to="/services/add"
          prepend-icon="mdi-plus"
        >
          Ajouter un service
        </v-btn>

        <v-btn
          v-else
          color="warning"
          to="/prestataire/create-profile"
          prepend-icon="mdi-account-convert"
        >
          Créer mon profil prestataire
        </v-btn>
      </div>

      <v-alert v-if="error" type="error" class="mt-4">
        {{ error }}
      </v-alert>

      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mt-4"
      ></v-progress-linear>

      <!-- Table des services -->
      <v-table
        v-if="!loading && services.length > 0"
        class="mt-4"
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Sous-catégorie</th>
            <th>Portfolio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.id }}</td>
            <td>{{ service.description }}</td>
            <td>{{ service.prix }} €</td>
            <td>{{ service.categorie?.nom }}</td>
            <td>{{ service.sous_categorie?.nom }}</td>
            <td>
              <div v-if="service.portfolio">
                <div v-for="img in service.portfolio.images" :key="img">
                  <v-img :src="img" max-width="80" max-height="80" class="mb-2" />
                </div>
                <small>{{ service.portfolio.description }}</small>
              </div>
              <div v-else>-</div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Aucun service -->
      <v-card v-if="!loading && services.length === 0 && hasPrestataireProfile" class="mt-4">
        <v-card-text class="text-center py-8">
          <v-icon size="64" color="grey">mdi-tools</v-icon>
          <h5 class="text-h5 mt-4">Aucun service enregistré</h5>
          <v-btn
            color="primary"
            to="/services/add"
            prepend-icon="mdi-plus"
            class="mt-4"
          >
            Ajouter mon premier service
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Pas de profil prestataire -->
      <v-card v-if="!hasPrestataireProfile" class="mt-4">
        <v-card-text class="text-center py-8">
          <v-icon size="64" color="warning">mdi-alert-circle-outline</v-icon>
          <h5 class="text-h5 mt-4">Profil prestataire requis</h5>
          <p class="text-body-1 mt-2">
            Vous devez d'abord créer votre profil prestataire avant de pouvoir gérer des services.
          </p>
          <v-btn
            color="warning"
            to="/prestataire/create-profile"
            prepend-icon="mdi-account-convert"
            class="mt-4"
          >
            Créer mon profil prestataire
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card-item>
  </v-card>
</template>
