<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

interface NavButton {
  label: string
  component: string
  icon?: string
}

export default defineComponent({
  name: 'Sidebar',
  setup() {
    const router = useRouter()
    const isOpen = ref(false)
    

    const navButtons: NavButton[] = [
      { label: 'Accueil', component: 'Home', icon: '🏠' },
      { label: 'Tirage', component: 'Roll', icon: '🎲' },
      { label: 'Paramètres', component: 'Settings', icon: '⚙️' },
    ]

    const toggleSidebar = () => {
      isOpen.value = !isOpen.value
    }

    const navigateTo = (componentName: string) => {
      console.log(componentName)
      console.log(router)
      router.push({ name: componentName })
      toggleSidebar()
    }

    return {
      isOpen,
      navButtons,
      toggleSidebar,
      navigateTo
    }
  }
})
</script>

<template>
  <div class="sidebar-container">
    <button 
      class="hamburger-btn" 
      @click="toggleSidebar"
      :class="{ active: isOpen }"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div 
      v-if="isOpen" 
      class="sidebar-overlay" 
      @click="toggleSidebar"
    ></div>

    <nav 
      class="sidebar" 
      :class="{ open: isOpen }"
    >
      <div class="sidebar-header">
        <h2>Navigation</h2>
        <button class="close-btn" @click="toggleSidebar">×</button>
      </div>

      <ul class="nav-list">
        <li 
          v-for="button in navButtons" 
          :key="button.component"
          class="nav-item"
        >
          <button 
            class="nav-button"
            @click="navigateTo(button.component)"
          >
            <span class="nav-icon" v-if="button.icon">{{ button.icon }}</span>
            <span class="nav-label">{{ button.label }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.sidebar-container {
  position: relative;
  z-index: 1000;
  overflow: hidden;
}

/* Bouton hamburger */
.hamburger-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.hamburger-btn span {
  width: 20px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
}

.hamburger-btn.active {
 opacity: 0;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar.open {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Liste de navigation */
.nav-list {
  list-style: none;
  padding: 20px 0;
  margin: 0;
}

.nav-item {
  margin: 0;
}

.nav-button {
  width: 100%;
  background: none;
  border: none;
  color: white;
  padding: 15px 20px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: #3498db;
  transform: translateX(5px);
}

.nav-button:active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-weight: 500;
}


@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar.open {
  animation: slideIn 0.3s ease;
}
</style>