<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// Références pour les filtres
const selectedCategory = ref<number | null>(null);
const selectedSubCategory = ref<number | null>(null);
const searchQuery = ref('');
const services = ref<any[]>([]);
const categories = ref<{id: number, nom: string}[]>([]);
const subCategories = ref<{id: number, nom: string}[]>([]);
const loading = ref(false);
const error = ref('');

// Charger les services depuis l'API
const fetchServices = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:8000/api/services');
    services.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des services';
    console.error(err);
  }
};

// Charger les catégories depuis l'API
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/categories');
    categories.value = response.data.map((cat: any) => ({
      id: cat.id,
      nom: cat.nom
    }));
  } catch (err) {
    error.value = 'Erreur lors du chargement des catégories';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Charger les sous-catégories en fonction de la catégorie sélectionnée
const fetchSubCategories = async (categoryId: number | null) => {
  try {
    if (!categoryId) {
      subCategories.value = [];
      return;
    }
    
    const response = await axios.get(`http://localhost:8000/api/souscategories`, {
      params: { categorie_id: categoryId }
    });
    
    subCategories.value = response.data.map((subCat: any) => ({
      id: subCat.id,
      nom: subCat.nom
    }));
  } catch (err) {
    error.value = 'Erreur lors du chargement des sous-catégories';
    console.error(err);
  }
};

// Watcher pour charger les sous-catégories quand la catégorie change
watch(selectedCategory, (newVal) => {
  selectedSubCategory.value = null;
  fetchSubCategories(newVal);
});

// Filtrage des services
const filteredServices = computed(() => {
  return services.value.filter(service => {
    // Filtre par catégorie
    const matchesCategory = selectedCategory.value
      ? service.categorie?.id === selectedCategory.value
      : true;
    
    // Filtre par sous-catégorie
    const matchesSubCategory = selectedSubCategory.value
      ? service.sous_categorie_id === selectedSubCategory.value
      : true;
    
    // Filtre par recherche texte
    const matchesSearch = searchQuery.value
      ? service.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true;
    
    return matchesCategory && matchesSubCategory && matchesSearch;
  });
});

// Chargement initial
onMounted(async () => {
  await Promise.all([fetchServices(), fetchCategories()]);
});
</script>

<template>
  <v-row>
    <!-- Filtres -->
    <v-col cols="12">
      <v-row>
        <v-col cols="12" sm="4">
          <v-select
            v-model="selectedCategory"
            :items="categories"
            item-title="nom"
            item-value="id"
            label="Filtrer par catégorie"
            clearable
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="selectedSubCategory"
            :items="subCategories"
            item-title="nom"
            item-value="id"
            label="Filtrer par sous-catégorie"
            clearable
            :disabled="!selectedCategory"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="searchQuery"
            label="Rechercher par description"
            clearable
            :loading="loading"
          />
        </v-col>
      </v-row>
    </v-col>

    <!-- Message d'erreur -->
    <v-col cols="12" v-if="error">
      <v-alert type="error">{{ error }}</v-alert>
    </v-col>

    <!-- Liste des services -->
    <v-col 
      cols="12" 
      lg="4" 
      md="6" 
      v-for="service in filteredServices" 
      :key="service.id"
    >
      <v-card elevation="10" class="withbg">
        <RouterLink :to="`/services/${service.id}`">
          <v-img 
            v-if="service.prestataire?.portfolio?.images?.length"
            :src="service.prestataire.portfolio.images[0]" 
            height="200px" 
            cover
            class="rounded-t-md"
          />
          <v-img
            v-else
            src="@/assets/images/products/s1.jpg"
            height="200px"
            cover
            class="rounded-t-md"
          />
        </RouterLink>

        <v-card-item class="pt-2">
          <div class="d-flex justify-space-between align-center">
            <h6 class="text-h6">{{ service.sousCategorie?.nom || 'Service' }}</h6>
            <v-chip color="primary" class="ml-2">
              {{ service.prix }} DT
            </v-chip>
          </div>
          
          <div class="text-body-1 mt-2">
            {{ service.description || 'Aucune description disponible' }}
          </div>

          <div class="d-flex align-center justify-space-between mt-4">
            <div>
              <v-avatar size="small">
                <v-img 
                  v-if="service.prestataire?.photo"
                  :src="service.prestataire.photo"
                />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              <span class="ml-2">
                {{ service.prestataire?.nom || 'Prestataire' }}
              </span>
            </div>
            
            <v-rating 
              :model-value="service.commentaires?.length 
                ? service.commentaires.reduce((acc, c) => acc + c.note, 0) / service.commentaires.length 
                : 0"
              density="compact" 
              color="warning" 
              size="small" 
              readonly
            />
          </div>
        </v-card-item>
      </v-card>
    </v-col>

    <!-- Chargement -->
    <v-col cols="12" v-if="loading">
      <div class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </div>
    </v-col>

    <!-- Aucun résultat -->
    <v-col cols="12" v-if="!loading && filteredServices.length === 0">
      <v-alert type="info">Aucun service trouvé</v-alert>
    </v-col>
  </v-row>
</template>