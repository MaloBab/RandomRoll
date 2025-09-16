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
    
    <div class="content-area">
      <router-view />
    </div>

    <h1 class="chalk-title">Class Manager</h1>
  </div>
</template>

<style scoped>
.layout-container {
  position: relative;
}

.full-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-image: url('../assets/background.jpg');
  background-size: cover;      
  background-position: center; 
  background-repeat: no-repeat;
  z-index: -1;
}

.content-area {
  position: relative;
  z-index: 1;
  padding: 80px 20px 20px 20px;
  min-height: 100vh;
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
}
</style>