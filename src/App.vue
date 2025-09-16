<script lang="ts">
import { defineComponent } from 'vue'
import Layout from './components/Layout.vue'

export default defineComponent({
  name: 'App',
  components: {
    Layout
  }
})
</script>

<template>
  <div id="app">
    <Layout />
    <div class="router-overlay">
      <router-view />
    </div>
  </div>
</template>


<style>
#app {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  overflow-y: hidden;
}

.router-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 50; /* Au-dessus du layout mais sous la sidebar */
  pointer-events: none; /* Permet aux clics de passer à travers quand vide */
}

.router-overlay > * {
  pointer-events: auto; /* Réactive les interactions sur le contenu */
}
</style>