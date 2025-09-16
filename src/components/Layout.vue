<template>
  <div class="full-background">
    <slot />
  </div>
  <h1 class="chalk-title"> RANDOM ROLL</h1>
</template>

<style scoped>
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

h1 {
    align-items: center;
    text-align: center;
}
</style>