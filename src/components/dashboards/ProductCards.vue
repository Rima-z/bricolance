<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// Références pour les filtres
const selectedCategory = ref<number | null>(null);
const selectedSubCategory = ref<number | null>(null);
const searchQuery = ref('');
const services = ref<any[]>([]);
const categories = ref<{ id: number, nom: string }[]>([]);
const subCategories = ref<{ id: number, nom: string }[]>([]);
const loading = ref(false);
const error = ref('');

// Informations de l'utilisateur connecté
const currentUser = ref<any>(null);

// Vérification du rôle client
const isClient = computed(() => {
  return currentUser.value?.user?.role?.toLowerCase() === 'client';
});

// Pour le commentaire
const dialog = ref(false);
const selectedServiceId = ref<number | null>(null);
const commentText = ref('');
const commentRating = ref(0);

// Pour le portfolio
const portfolioDialog = ref(false);
const selectedPortfolio = ref<any>(null);

// Charger les services
const fetchServices = async () => {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:8000/api/services');
    services.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des services';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Charger les catégories
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/categories');
    categories.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des catégories';
    console.error(err);
  }
};

// Charger les sous-catégories
const fetchSubCategories = async (categoryId: number | null) => {
  try {
    if (!categoryId) {
      subCategories.value = [];
      return;
    }
    const response = await axios.get('http://localhost:8000/api/souscategories', {
      params: { categorie_id: categoryId }
    });
    subCategories.value = response.data;
  } catch (err) {
    error.value = 'Erreur lors du chargement des sous-catégories';
    console.error(err);
  }
};

// Vérifier l'état de connexion
const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      currentUser.value = null;
      return;
    }
    
    const response = await axios.get('http://localhost:8000/api/auth/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    currentUser.value = response.data;
  } catch (err) {
    console.error('Auth error:', err);
    currentUser.value = null;
  }
};

// Watch catégorie
watch(selectedCategory, (newVal) => {
  selectedSubCategory.value = null;
  fetchSubCategories(newVal);
});

// Filtrage des services
const filteredServices = computed(() => {
  return services.value.filter(service => {
    const matchesCategory = selectedCategory.value
      ? service.categorie?.id === selectedCategory.value
      : true;

    const matchesSubCategory = selectedSubCategory.value
      ? service.sous_categorie_id === selectedSubCategory.value
      : true;

    const matchesSearch = searchQuery.value
      ? service.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true;

    return matchesCategory && matchesSubCategory && matchesSearch;
  });
});

// Ouvrir le dialogue de commentaire
const openCommentDialog = (serviceId: number) => {
  if (!isClient.value) {
    alert(`Vous devez être connecté en tant que client pour commenter. ${currentUser.value ? `(Rôle actuel: ${currentUser.value.user?.role})` : '(Non connecté)'}`);
    return;
  }
  selectedServiceId.value = serviceId;
  commentText.value = '';
  commentRating.value = 0;
  dialog.value = true;
};

// Envoyer le commentaire
const submitComment = async () => {
  if (!selectedServiceId.value || !commentText.value || commentRating.value <= 0) {
    alert('Veuillez remplir tous les champs et donner une note');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expirée, veuillez vous reconnecter');
      return;
    }

    await axios.post('http://localhost:8000/api/commentaires', {
      service_id: selectedServiceId.value,
      texte: commentText.value,
      note: commentRating.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    dialog.value = false;
    await fetchServices();
    alert('Commentaire envoyé avec succès!');
  } catch (err: any) {
    console.error('Erreur:', err.response);
    alert(err.response?.data?.message || 'Erreur lors de l\'envoi du commentaire');
  }
};

// Ouvrir le portfolio - Version corrigée mais conservant votre style
const openPortfolioDialog = async (service: any) => {
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:8000/api/services/${service.id}`);
    const fullService = response.data;

    if (fullService.portfolio) {
      selectedPortfolio.value = {
        images: fullService.portfolio.images || [],
        description: fullService.portfolio.description || 'Aucune description disponible',
        prestataire: {
          nom: fullService.prestataire?.client?.nom || '',
          prenom: fullService.prestataire?.client?.prenom || '',
          email: fullService.prestataire?.client?.email || '',
          photo: fullService.prestataire?.client?.photo
        },
        service: {
          description: fullService.description || 'Aucune description disponible',
          prix: fullService.prix || 0,
          categorie: fullService.categorie?.nom || 'Non spécifiée',
          sousCategorie: fullService.sous_categorie?.nom || 'Non spécifiée'
        }
      };
      portfolioDialog.value = true;
    } else {
      alert('Ce service n\'a pas de portfolio disponible');
    }
  } catch (err) {
    console.error('Erreur:', err);
    alert('Erreur lors du chargement du portfolio');
  } finally {
    loading.value = false;
  }
};

// Initialisation
onMounted(async () => {
  await checkAuthStatus();
  await Promise.all([fetchServices(), fetchCategories()]);
});
</script>

<template>
  <v-row>
    <!-- Debug auth status -->
    <v-col cols="12" v-if="currentUser">
      <v-alert type="info" density="compact">
        Connecté en tant que: {{ currentUser.user?.role }} | 
        Client: {{ currentUser.client?.nom }} {{ currentUser.client?.prenom }}
      </v-alert>
    </v-col>

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

    <!-- Erreur -->
    <v-col cols="12" v-if="error">
      <v-alert type="error">{{ error }}</v-alert>
    </v-col>

    <!-- Services -->
    <v-col
      cols="12"
      lg="4"
      md="6"
      v-for="service in filteredServices"
      :key="service.id"
    >
      <v-card 
        elevation="10" 
        class="withbg"
        @click="openPortfolioDialog(service)"
        style="cursor: pointer;"
      >
        <v-img
          v-if="service.portfolio?.images?.length"
          :src="service.portfolio.images[0]"
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
                  v-if="service.prestataire?.client?.photo"
                  :src="service.prestataire.client.photo"
                />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              <span class="ml-2">
                {{ service.prestataire?.client?.nom || 'Prestataire' }}
                {{ service.prestataire?.client?.prenom || '' }}
              </span>
              <div class="text-caption text-grey mt-1">
                {{ service.prestataire?.client?.email || 'Email non disponible' }}
              </div>
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

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            color="primary"
            variant="tonal"
            size="small"
            @click.stop="openCommentDialog(service.id)"
            :disabled="!isClient"
          >
            {{ isClient ? 'Laisser un commentaire' : `Commenter (${currentUser ? 'Rôle: ' + currentUser.user?.role : 'Non connecté'})` }}
          </v-btn>
        </v-card-actions>
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

  <!-- Dialogue commentaire -->
  <v-dialog v-model="dialog" max-width="500px">
    <v-card>
      <v-card-title>Laisser un commentaire</v-card-title>
      <v-card-text>
        <v-rating
          v-model="commentRating"
          color="warning"
          background-color="grey-lighten-2"
          half-increments
          length="5"
          size="large"
        />
        <v-textarea
          v-model="commentText"
          label="Votre commentaire"
          rows="4"
          auto-grow
          class="mt-4"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="dialog = false">Annuler</v-btn>
        <v-btn color="primary" @click="submitComment">Envoyer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialogue portfolio -->
  <v-dialog v-model="portfolioDialog" max-width="900px" scrollable>
    <v-card v-if="selectedPortfolio">
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          Portfolio de {{ selectedPortfolio.prestataire.nom }} {{ selectedPortfolio.prestataire.prenom }}
        </div>
        <v-btn icon @click="portfolioDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-subtitle>
        <v-chip class="mr-2" color="primary">
          {{ selectedPortfolio.service.prix }} DT
        </v-chip>
        <v-chip class="mr-2">
          {{ selectedPortfolio.service.categorie }} / {{ selectedPortfolio.service.sousCategorie }}
        </v-chip>
      </v-card-subtitle>
      
      <v-divider></v-divider>
      
      <v-card-text>
        <!-- Carrousel d'images -->
        <v-carousel 
          v-if="selectedPortfolio.images.length > 0"
          cycle
          height="400"
          hide-delimiters
          show-arrows="hover"
          class="mb-4"
        >
          <v-carousel-item
            v-for="(image, i) in selectedPortfolio.images"
            :key="i"
          >
            <v-img
              :src="image"
              contain
              height="100%"
              class="portfolio-image"
            ></v-img>
          </v-carousel-item>
        </v-carousel>
        <v-alert v-else type="info" class="mb-4">
          Aucune image disponible dans ce portfolio
        </v-alert>
        
        <!-- Description du service -->
        <v-card outlined class="mb-4">
          <v-card-title class="text-subtitle-1">Description du service</v-card-title>
          <v-card-text>{{ selectedPortfolio.service.description }}</v-card-text>
        </v-card>
        
        <!-- Description du portfolio -->
        <v-card outlined>
          <v-card-title class="text-subtitle-1">Description du portfolio</v-card-title>
          <v-card-text>{{ selectedPortfolio.description }}</v-card-text>
        </v-card>
      </v-card-text>
      
      <v-divider></v-divider>
      
      <v-card-actions class="pa-4">
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-2">
            <v-img
              v-if="selectedPortfolio.prestataire.photo"
              :src="selectedPortfolio.prestataire.photo"
            />
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
          <div>
            <div>{{ selectedPortfolio.prestataire.nom }} {{ selectedPortfolio.prestataire.prenom }}</div>
            <div class="text-caption">{{ selectedPortfolio.prestataire.email }}</div>
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="portfolioDialog = false">Fermer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.portfolio-image {
  object-fit: contain;
  background-color: #f5f5f5;
}

.withbg {
  transition: transform 0.2s;
}

.withbg:hover {
  transform: translateY(-5px);
}
</style>