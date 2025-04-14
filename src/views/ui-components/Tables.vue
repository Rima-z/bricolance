<script setup>
import { ref } from 'vue';
import UiChildCard from '@/components/shared/UiChildCard.vue';

// Données de démonstration
const stats = ref([
  { title: "Utilisateurs", value: "1,245", icon: "mdi-account-group", color: "primary" },
  { title: "Services", value: "568", icon: "mdi-briefcase", color: "secondary" },
  { title: "Commentaires", value: "2,340", icon: "mdi-comment", color: "success" },
  { title: "Revenus", value: "1,222,450DT", icon: "mdi-cash", color: "warning" },
]);

const recentActivities = ref([
  { user: "Jean Dupont", action: "a ajouté un nouveau service", time: "Il y a 5 min", avatar: "" },
  { user: "Marie Martin", action: "a posté un commentaire", time: "Il y a 15 min", avatar: "" },
  { user: "Pierre Lambert", action: "a mis à jour son profil", time: "Il y a 30 min", avatar: "" },
  { user: "Sophie Leroy", action: "a terminé une réservation", time: "Il y a 2h", avatar: "" },
]);

const popularServices = ref([
  { name: "Plomberie", category: "Bricolage", rating: 4.8, bookings: 124 },
  { name: "Cours de piano", category: "Musique", rating: 4.9, bookings: 98 },
  { name: "Déménagement", category: "Transport", rating: 4.7, bookings: 87 },
  { name: "Jardinage", category: "Extérieur", rating: 4.6, bookings: 76 },
]);
</script>

<template>
  <v-container>
    <!-- Section Bienvenue -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card color="primary" dark>
          <v-card-title class="text-h4">
            Bienvenue sur notre plateforme !
          </v-card-title>
          <v-card-subtitle>
            Trouvez les meilleurs services près de chez vous
          </v-card-subtitle>
          <v-card-actions>
            <v-btn variant="outlined" color="white">Explorer</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Statistiques -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-avatar :color="stat.color" class="me-4" size="56">
              <v-icon size="32">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1">{{ stat.title }}</div>
              <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Services populaires -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <UiChildCard title="Services populaires">
          <v-table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Catégorie</th>
                <th>Note</th>
                <th>Réservations</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in popularServices" :key="service.name">
                <td>{{ service.name }}</td>
                <td>{{ service.category }}</td>
                <td>
                  <v-rating :model-value="service.rating" half-increments readonly size="small" color="amber" />
                  {{ service.rating }}
                </td>
                <td>{{ service.bookings }}</td>
              </tr>
            </tbody>
          </v-table>
        </UiChildCard>
      </v-col>

      <!-- Activités récentes -->
      <v-col cols="12" md="4">
        <UiChildCard title="Activités récentes">
          <v-timeline side="end" align="start">
            <v-timeline-item
              v-for="activity in recentActivities"
              :key="activity.user"
              dot-color="primary"
              size="small"
            >
              <div class="d-flex">
                <v-avatar class="me-4">
                  <v-img :src="activity.avatar || 'https://cdn.vuetifyjs.com/images/lists/1.jpg'"></v-img>
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ activity.user }}</div>
                  <div>{{ activity.action }}</div>
                  <div class="text-caption text-grey">{{ activity.time }}</div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </UiChildCard>
      </v-col>
    </v-row>

    <!-- Call to action -->
    <v-row>
      <v-col cols="12">
        <v-card color="secondary" dark>
          <v-card-title class="text-h5">
            Prêt à commencer ?
          </v-card-title>
          <v-card-text>
            Rejoignez notre communauté dès aujourd'hui et profitez des meilleurs services.
          </v-card-text>
          <v-card-actions>
            <v-btn color="white" variant="text">S'inscrire</v-btn>
            <v-btn color="white" variant="outlined">En savoir plus</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card {
  transition: transform 0.3s ease;
}
.v-card:hover {
  transform: translateY(-5px);
}
</style>