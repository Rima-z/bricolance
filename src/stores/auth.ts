import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const isAuthenticated = ref(false);
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token') || null);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
    isAuthenticated.value = true;
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  async function checkAuth() {
    if (!token.value) {
      isAuthenticated.value = false;
      return false;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      isAuthenticated.value = true;
      user.value = response.data.user;
      return true;
    } catch (error) {
      logout();
      return false;
    }
  }

  async function logout() {
    try {
      // Appel API pour déconnexion côté serveur
      await axios.post('http://localhost:8000/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion API:', error);
    } finally {
      // Nettoyage côté client quoi qu'il arrive
      localStorage.removeItem('auth_token');
      delete axios.defaults.headers.common['Authorization'];
      token.value = null;
      isAuthenticated.value = false;
      user.value = null;
      router.push('/');
    }
  }

  return { token, isAuthenticated, user, setToken, checkAuth, logout };
});