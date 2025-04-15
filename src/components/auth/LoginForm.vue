<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  email: '',
  password: ''
});

const loading = ref(false);
const error = ref('');
const rememberDevice = ref(false);

const login = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    console.log('Envoi de la requête de connexion...', formData.value);

    const response = await axios.post('http://localhost:8000/api/auth/login', {
      email: formData.value.email,
      password: formData.value.password
    });

    console.log('Réponse de connexion:', response.data);

    if (!response.data.token) {
      throw new Error('Aucun token reçu');
    }

    authStore.setToken(response.data.token);
    
    console.log('Token défini, redirection...', authStore.token);
    
    router.push('/ui/tables');
  } catch (err: any) {
    console.error('Erreur de connexion:', err);
    
    if (err.response) {
      error.value = err.response.data?.message || 
                   err.response.data?.error || 
                   'Email ou mot de passe incorrect';
    } else if (err.request) {
      error.value = 'Le serveur ne répond pas. Vérifiez votre connexion.';
    } else {
      error.value = err.message || 'Échec de la connexion';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            <span class="bg-surface px-5 py-3 position-relative text-subtitle-1 text-grey100">Connexion à votre compte</span>
        </div>
    </div>
    
    <div>
        <v-alert 
            v-if="error" 
            type="error" 
            class="mb-4"
            closable
            @click:close="error = ''"
        >
            {{ error }}
        </v-alert>
        
        <v-row class="mb-3">
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Adresse email</v-label>
                <v-text-field 
                    v-model="formData.email"
                    variant="outlined" 
                    class="pwdInput" 
                    hide-details 
                    color="primary"
                    type="email"
                    placeholder="votre@email.com"
                    :disabled="loading"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Mot de passe</v-label>
                <v-text-field 
                    v-model="formData.password"
                    variant="outlined" 
                    class="border-borderColor" 
                    type="password" 
                    hide-details
                    color="primary"
                    placeholder="Votre mot de passe"
                    :disabled="loading"
                    @keyup.enter="login"
                ></v-text-field>
            </v-col>
            
            <v-col cols="12">
                <v-btn 
                    size="large" 
                    rounded="pill" 
                    color="primary" 
                    class="rounded-pill" 
                    block 
                    :loading="loading"
                    :disabled="loading"
                    @click="login"
                >
                    {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>