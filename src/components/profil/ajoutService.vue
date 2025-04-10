<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');
const services = ref([]);
const hasPrestataireProfile = ref(true); // Nouveau state

interface Service {
  id: number;
  prix: number;
  description: string;
  categorie: { id: number; nom: string };
  sous_categorie: { id: number; nom: string };
  portfolio?: { images: string[]; description: string };
}

const fetchServices = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get('http://localhost:8000/api/prestataire/services', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    services.value = response.data;

  } catch (err) {
    if (err.response?.status === 404 && err.response.data?.has_prestataire === false) {
      hasPrestataireProfile.value = false;
      error.value = 'Vous devez créer un profil prestataire avant d\'ajouter des services';
    } else {
      error.value = err.response?.data?.message || 
                  err.message || 
                  'Erreur lors du chargement des services';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchServices();
});
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

      <template v-if="hasPrestataireProfile">
        <!-- Afficher les services existants -->
        <v-table v-if="!loading && services.length > 0" class="mt-4">
          <!-- ... Table content ... -->
        </v-table>

        <v-card v-if="!loading && services.length === 0" class="mt-4">
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
      </template>

      <v-card v-else class="mt-4">
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