<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');
const services = ref([]);
const hasPrestataireProfile = ref(true);
const showAddDialog = ref(false);

// Données du formulaire
const form = ref({
  prix: 0,
  description: '',
  categorie_id: null as number | null,
  sous_categorie_id: null as number | null,
  portfolio_images: [] as string[],
  portfolio_description: ''
});

const categories = ref<Array<{id: number, nom: string}>>([]);
const sousCategories = ref<Array<{id: number, nom: string}>>([]);

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

    services.value = response.data?.services ?? response.data ?? [];
    
    hasPrestataireProfile.value = services.value.length > 0 || 
                                 !(response.data?.has_prestataire === false);

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

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/categories');
    categories.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des catégories';
  }
};

const fetchSousCategories = async (categorieId: number) => {
  if (!categorieId) return;
  
  try {
    const response = await axios.get(`http://localhost:8000/api/souscategories`, {
      params: { categorie_id: categorieId }
    });
    sousCategories.value = response.data;
    form.value.sous_categorie_id = null;
  } catch (err) {
    console.error('Erreur détaillée:', err);
    error.value = 'Erreur lors du chargement des sous-catégories';
    sousCategories.value = [];
  }
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    form.value.portfolio_images = Array.from(input.files).map(file => file.name);
    // À remplacer par un vrai upload si nécessaire
  }
};

const addService = async () => {
  loading.value = true;
  error.value = '';

  try {
    const prestataireResponse = await axios.get(
      'http://localhost:8000/api/auth/me', 
      {
        headers: { Authorization: `Bearer ${authStore.token}` }
      }
    );

    await axios.post(
      'http://localhost:8000/api/services',
      {
        ...form.value,
        prestataire_id: prestataireResponse.data.id
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    await fetchServices();
    showAddDialog.value = false;
    resetForm();
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de l\'ajout du service';
    if (err.response?.status === 404) {
      hasPrestataireProfile.value = false;
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = {
    prix: 0,
    description: '',
    categorie_id: null,
    sous_categorie_id: null,
    portfolio_images: [],
    portfolio_description: ''
  };
  sousCategories.value = [];
};

const openAddDialog = () => {
  showAddDialog.value = true;
  fetchCategories();
  resetForm();
};

onMounted(fetchServices);
</script>

<template>
  <v-card elevation="10">
    <v-card-item class="pa-6">
      <div class="d-flex align-center justify-space-between">
        <h5 class="text-h5 font-weight-semibold">Mes Services</h5>
        <v-btn
          v-if="hasPrestataireProfile"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
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

      <v-table v-if="!loading && services.length > 0" class="mt-4">
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
            <td>{{ service.prix }} DT</td>
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

      <v-card v-if="!loading && services.length === 0 && hasPrestataireProfile" class="mt-4">
        <v-card-text class="text-center py-8">
          <v-icon size="64" color="grey">mdi-tools</v-icon>
          <h5 class="text-h5 mt-4">Aucun service enregistré</h5>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            class="mt-4"
            @click="openAddDialog"
          >
            Ajouter mon premier service
          </v-btn>
        </v-card-text>
      </v-card>

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

  <v-dialog v-model="showAddDialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Ajouter un nouveau service</span>
        <v-btn icon @click="showAddDialog = false" :disabled="loading">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="addService">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="form.prix"
                label="Prix (€)"
                type="number"
                min="0"
                step="0.01"
                required
                :disabled="loading"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description du service"
                required
                rows="3"
                :disabled="loading"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.categorie_id"
                :items="categories"
                item-title="nom"
                item-value="id"
                label="Catégorie"
                required
                :disabled="loading"
                @update:modelValue="fetchSousCategories"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.sous_categorie_id"
                :items="sousCategories"
                item-title="nom"
                item-value="id"
                label="Sous-catégorie"
                :disabled="!form.categorie_id || loading"
                required
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-file-input
                label="Images du portfolio"
                multiple
                prepend-icon="mdi-camera"
                @change="handleImageUpload"
                :disabled="loading"
              ></v-file-input>
              <div v-if="form.portfolio_images.length > 0" class="mt-2">
                <v-chip
                  v-for="(image, index) in form.portfolio_images"
                  :key="index"
                  class="ma-1"
                >
                  {{ image }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.portfolio_description"
                label="Description du portfolio"
                rows="2"
                :disabled="loading"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-card-actions class="justify-end mt-4">
            <v-btn
              text
              @click="resetForm"
              :disabled="loading"
            >
              Réinitialiser
            </v-btn>
            <v-btn
              color="primary"
              :loading="loading"
              type="submit"
            >
              Ajouter
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
