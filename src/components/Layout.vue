<script lang="ts">
import { defineComponent } from 'vue'
import Sidebar from "./Sidebar.vue";

export default defineComponent({
  name: 'Layout',
  components: {
    Sidebar
  }
})
</script>

<template>
  <div class="layout-container">
    <Sidebar />
    
    <div class="full-background"></div>

    <h1 class="chalk-title">Class Manager</h1>
  </div>
</template>

<style scoped>
.layout-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.full-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('../assets/background.jpg');
  background-size: 100% 115%;
  background-position: center;
  background-repeat: no-repeat;  
  z-index: -1;
}

.chalk-title {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2rem;
  font-weight: bold;
}

@media screen and (min-width: 1920px) {
  .full-background {
    background-size: cover;
    transform: scale(1);
  }
}

@media screen and (max-width: 768px) {
  .full-background {
    background-size: cover;
  }
}
</style>