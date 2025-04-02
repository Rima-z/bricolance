<script setup lang="ts">
import { ref } from "vue";
import profilCard from "@/components/profil/profilCard.vue";
import ajoutService from "@/components/profil/ajoutService.vue";
</script>

<template>
    <v-row>
    <v-col cols="12" sm="12" lg="8">
            <div class="mb-6">
                <ajoutService/>
            </div>
            
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <profilCard />
        </v-col>
        
       
        
    </v-row>
</template>