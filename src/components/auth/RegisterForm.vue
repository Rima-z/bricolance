<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const formData = ref({
    nom: '',
    prenom: '',
    email: '',
    num_tlf: '',
    region: '',
    adresse: '',
    password: '',
    password_confirmation: '',
    role: 'client' // Valeur par défaut
});

const loading = ref(false);
const error = ref('');

const register = async () => {
    loading.value = true;
    error.value = '';
    
    try {
        const response = await axios.post('http://localhost:8000/api/auth/register', formData.value);
        
        // Stocker le token (si nécessaire)
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        
        // Rediriger vers /login après inscription
        router.push('/auth/login');
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            error.value = err.response.data.message || 'Une erreur est survenue';
        } else {
            error.value = 'Erreur de connexion au serveur';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <v-row class="d-flex mb-3">
        <v-col cols="12">
            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
            
            <v-label class="font-weight-medium mb-1">Nom</v-label>
            <v-text-field v-model="formData.nom" variant="outlined" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Prénom</v-label>
            <v-text-field v-model="formData.prenom" variant="outlined" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Email</v-label>
            <v-text-field v-model="formData.email" variant="outlined" type="email" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Téléphone</v-label>
            <v-text-field v-model="formData.num_tlf" variant="outlined" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Région</v-label>
            <v-text-field v-model="formData.region" variant="outlined" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Adresse</v-label>
            <v-text-field v-model="formData.adresse" variant="outlined" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Mot de passe</v-label>
            <v-text-field v-model="formData.password" variant="outlined" type="password" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Confirmer le mot de passe</v-label>
            <v-text-field v-model="formData.password_confirmation" variant="outlined" type="password" hide-details color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="font-weight-medium mb-1">Rôle</v-label>
            <v-radio-group v-model="formData.role" inline>
                <v-radio label="Client" value="client"></v-radio>
                <v-radio label="Prestataire" value="prestataire"></v-radio>
            </v-radio-group>
        </v-col>
        
        <v-col cols="12">
            <v-btn 
                @click="register" 
                color="primary" 
                rounded="pill" 
                size="large" 
                block 
                flat
                :loading="loading"
            >
                S'inscrire
            </v-btn>
        </v-col>
    </v-row>
</template>