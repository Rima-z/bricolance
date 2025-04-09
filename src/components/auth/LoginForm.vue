<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Import du store Pinia

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
    email: '',
    password: ''
});

const loading = ref(false);
const error = ref('');

const login = async () => {
    loading.value = true;
    error.value = '';
    
    try {
        const response = await axios.post('http://localhost:8000/api/auth/login', {
            email: formData.value.email,
            password: formData.value.password
        });
        
        // Utilisation du store pour gérer la connexion
        authStore.login(response.data.token);
        
        // Redirection vers la page souhaitée
        router.push('/ui/cards');
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                error.value = err.response.data.message || 'Email ou mot de passe incorrect';
            } else if (err.request) {
                error.value = 'Le serveur ne répond pas. Veuillez réessayer plus tard.';
            } else {
                error.value = 'Une erreur inattendue est survenue';
            }
        } else {
            error.value = 'Erreur de connexion au serveur';
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            <span class="bg-surface px-5 py-3 position-relative text-subtitle-1 text-grey100">Your Social Campaigns</span>
        </div>
    </div>
    
    <div>
        <v-row class="mb-3">
            <v-col cols="12">
                <v-alert 
                    v-if="error" 
                    type="error" 
                    class="mb-4"
                    closable
                    @click:close="error = ''"
                >
                    {{ error }}
                </v-alert>
                
                <v-label class="font-weight-medium mb-1">Email</v-label>
                <v-text-field 
                    v-model="formData.email" 
                    variant="outlined" 
                    class="pwdInput" 
                    hide-details 
                    color="primary"
                    type="email"
                    :disabled="loading"
                    placeholder="Entrez votre email"
                    @keyup.enter="login"
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
                    :disabled="loading"
                    placeholder="Entrez votre mot de passe"
                    @keyup.enter="login"
                ></v-text-field>
            </v-col>
            
            <v-col cols="12" class="py-0">
                <div class="d-flex flex-wrap align-center w-100">
                    <v-checkbox 
                        hide-details 
                        color="primary"
                        label="Se souvenir de moi"
                        :disabled="loading"
                    ></v-checkbox>
                    
                    <div class="ml-sm-auto">
                        <RouterLink 
                            to="/auth/forgot-password"
                            class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
                        >
                            Mot de passe oublié ?
                        </RouterLink>
                    </div>
                </div>
            </v-col>
            
            <v-col cols="12">
                <v-btn 
                    @click="login"
                    size="large" 
                    rounded="pill" 
                    color="primary" 
                    block 
                    :loading="loading"
                    :disabled="loading || !formData.email || !formData.password"
                    flat
                >
                    <template v-if="!loading">
                        Se connecter
                    </template>
                    <template v-else>
                        Connexion en cours...
                    </template>
                </v-btn>
            </v-col>
            
            <v-col cols="12" class="text-center pt-2">
                <span class="text-body-1">Vous n'avez pas de compte ? </span>
                <RouterLink 
                    to="/auth/register"
                    class="text-primary text-decoration-none font-weight-medium"
                >
                    S'inscrire
                </RouterLink>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>
.auth-divider {
    position: relative;
    z-index: 1;
}

.auth-divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.12);
    z-index: -1;
}

.pwdInput {
    border-radius: 6px;
}

.v-btn--disabled {
    opacity: 0.7;
}
</style>