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
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);
const currentServiceId = ref<number | null>(null);

// Données des formulaires
const form = ref({
  prix: 0,
  description: '',
  categorie_id: null as number | null,
  sous_categorie_id: null as number | null,
  portfolio_images: [] as string[],
  portfolio_description: ''
});

const editForm = ref({
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

// Récupérer les services
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

// Récupérer les catégories
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/categories');
    categories.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des catégories';
  }
};

// Récupérer les sous-catégories
const fetchSousCategories = async (categorieId: number) => {
  if (!categorieId) return;
  
  try {
    const response = await axios.get(`http://localhost:8000/api/souscategories`, {
      params: { categorie_id: categorieId }
    });
    sousCategories.value = response.data;
  } catch (err) {
    console.error('Erreur détaillée:', err);
    error.value = 'Erreur lors du chargement des sous-catégories';
    sousCategories.value = [];
  }
};

// Gérer l'upload d'images
const handleImageUpload = (event: Event, isEditForm = false) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const images = Array.from(input.files).map(file => file.name);
    if (isEditForm) {
      editForm.value.portfolio_images = images;
    } else {
      form.value.portfolio_images = images;
    }
  }
};

// Ajouter un service
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

// Modifier un service
const updateService = async () => {
  loading.value = true;
  error.value = '';

  try {
    await axios.put(
      `http://localhost:8000/api/services/${currentServiceId.value}`,
      editForm.value,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    await fetchServices();
    showEditDialog.value = false;
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du service';
  } finally {
    loading.value = false;
  }
};

// Supprimer un service
const deleteService = async () => {
  loading.value = true;
  error.value = '';

  try {
    await axios.delete(
      `http://localhost:8000/api/services/${currentServiceId.value}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );

    await fetchServices();
    showDeleteDialog.value = false;
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Erreur lors de la suppression du service';
  } finally {
    loading.value = false;
  }
};

// Réinitialiser les formulaires
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

// Ouvrir le dialogue d'ajout
const openAddDialog = () => {
  showAddDialog.value = true;
  fetchCategories();
  resetForm();
};

// Ouvrir le dialogue d'édition
const openEditDialog = (service: Service) => {
  currentServiceId.value = service.id;
  editForm.value = {
    prix: service.prix,
    description: service.description,
    categorie_id: service.categorie.id,
    sous_categorie_id: service.sous_categorie.id,
    portfolio_images: service.portfolio?.images || [],
    portfolio_description: service.portfolio?.description || ''
  };
  
  fetchCategories();
  if (service.categorie.id) {
    fetchSousCategories(service.categorie.id);
  }
  
  showEditDialog.value = true;
};

// Ouvrir le dialogue de suppression
const openDeleteDialog = (serviceId: number) => {
  currentServiceId.value = serviceId;
  showDeleteDialog.value = true;
};

// Au montage du composant
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
          to="/auth/register"
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
            <th>Actions</th>
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
            <td>
  <div class="d-flex align-center" style="gap: 8px">
    <v-btn
      icon
      variant="text"
      color="primary"
      size="small"
      @click="openEditDialog(service)"
    >
      <v-icon size="20">mdi-pencil</v-icon>
    </v-btn>
    <v-btn
      icon
      variant="text"
      color="error"
      size="small"
      @click="openDeleteDialog(service.id)"
    >
      <v-icon size="20">mdi-delete</v-icon>
    </v-btn>
  </div>
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
            to="/auth/register"
            prepend-icon="mdi-account-convert"
            class="mt-4"
          >
            Créer mon profil prestataire
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card-item>
  </v-card>

  <!-- Dialogue d'ajout -->
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
                label="Prix (DT)"
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
                @change="(e) => handleImageUpload(e, false)"
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

  <!-- Dialogue d'édition -->
  <v-dialog v-model="showEditDialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Modifier le service</span>
        <v-btn icon @click="showEditDialog = false" :disabled="loading">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="updateService">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="editForm.prix"
                label="Prix (DT)"
                type="number"
                min="0"
                step="0.01"
                required
                :disabled="loading"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editForm.description"
                label="Description du service"
                required
                rows="3"
                :disabled="loading"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="editForm.categorie_id"
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
                v-model="editForm.sous_categorie_id"
                :items="sousCategories"
                item-title="nom"
                item-value="id"
                label="Sous-catégorie"
                :disabled="!editForm.categorie_id || loading"
                required
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-file-input
                label="Images du portfolio"
                multiple
                prepend-icon="mdi-camera"
                @change="(e) => handleImageUpload(e, true)"
                :disabled="loading"
              ></v-file-input>
              <div v-if="editForm.portfolio_images.length > 0" class="mt-2">
                <v-chip
                  v-for="(image, index) in editForm.portfolio_images"
                  :key="index"
                  class="ma-1"
                >
                  {{ image }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="editForm.portfolio_description"
                label="Description du portfolio"
                rows="2"
                :disabled="loading"
              ></v-textarea>
            </v-col>
          </v-row>

          <v-card-actions class="justify-end mt-4">
            <v-btn
              text
              @click="showEditDialog = false"
              :disabled="loading"
            >
              Annuler
            </v-btn>
            <v-btn
              color="primary"
              :loading="loading"
              type="submit"
            >
              Enregistrer
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Dialogue de suppression -->
  <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h5">Confirmer la suppression</v-card-title>
      <v-card-text>
        Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          text
          @click="showDeleteDialog = false"
          :disabled="loading"
        >
          Annuler
        </v-btn>
        <v-btn
          color="error"
          text
          @click="deleteService"
          :loading="loading"
        >
          Supprimer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>