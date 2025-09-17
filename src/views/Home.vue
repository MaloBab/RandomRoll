<template>
  <div class="page-container">
    <div class="main-content">
      <h1 class="main-title chalk-title">Gestion des Classes</h1>
      
      <div class="add-section">
        <button 
          class="add-class-btn chalk-text" 
          @click="showAddModal = true"
          :class="{ 'pulse': classes.length === 0 }"
        >
          <span class="btn-icon">➕</span>
          Ajouter une Classe
        </button>
      </div>
      
      <!-- Zone scrollable pour les classes -->
      <div class="classes-scroll-container custom-scroll">
        <!-- Liste des classes -->
        <div v-if="classes.length > 0" class="classes-grid">
          <div 
            v-for="classe in classes" 
            :key="classe.id"
            class="class-card"
            :class="{ 'animating': animatingCards.includes(classe.id) }"
          >
            <!-- En-tête de la carte -->
            <div class="class-header">
              <h3 class="class-name chalk-text">{{ classe.nom }}</h3>
              <div class="class-info">
                <span class="student-count chalk-text">
                  👥 {{ classe.eleves.length }} élève{{ classe.eleves.length > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
            
            <!-- Liste des élèves (aperçu) -->
            <div class="students-preview">
              <div v-if="classe.eleves.length > 0" class="students-list">
                <span 
                  v-for="(eleve, idx) in classe.eleves.slice(0, 3)" 
                  :key="idx"
                  class="student-tag chalk-text"
                  :title="`Pondération: ${eleve.ponderation || 1}`"
                >
                  {{ eleve.nom }}
                  <span class="student-weight" v-if="eleve.ponderation !== 1">
                    ({{ eleve.ponderation }})
                  </span>
                </span>
                <span 
                  v-if="classe.eleves.length > 3" 
                  class="student-tag more chalk-text"
                >
                  +{{ classe.eleves.length - 3 }}
                </span>
              </div>
              <div v-else class="no-students chalk-text">
                Aucun élève pour le moment
              </div>
            </div>
            
            <!-- Boutons d'action -->
            <div class="class-actions">
              <button 
                class="action-btn fill-btn chalk-text" 
                @click="openFillModal(classe)"
                :title="`Remplir la classe ${classe.nom}`"
              >
                <span class="btn-icon">📝</span>
                Remplir
              </button>
              <button 
                class="action-btn edit-btn chalk-text"
                @click="editClass(classe)"
                :title="`Modifier ${classe.nom}`"
              >
                <span class="btn-icon">✏️</span>
                Modifier
              </button>
              <button 
                class="action-btn delete-btn chalk-text" 
                @click="confirmDelete(classe)"
                :title="`Supprimer ${classe.nom}`"
              >
                <span class="btn-icon">🗑️</span>
                Supprimer
              </button>
            </div>
          </div>
        </div>
        
        <!-- État vide -->
        <div v-else class="empty-state">
          <div class="empty-illustration">📚</div>
          <h3 class="empty-title chalk-text">Aucune classe créée</h3>
          <p class="empty-description chalk-text">
            Commencez par ajouter votre première classe pour organiser vos élèves
          </p>
        </div>
      </div>
    </div>
    
    <!-- Modal d'ajout/modification -->
    <div v-if="showAddModal || editingClass" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title chalk-text">
            {{ editingClass ? 'Modifier la classe' : 'Nouvelle Classe' }}
          </h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label chalk-text">Nom de la classe</label>
            <input 
              v-model="newClassName" 
              type="text" 
              class="form-input chalk-text"
              placeholder="Ex: 6ème A, CE2 B, Terminale S..."
              @keyup.enter="saveClass"
              ref="classNameInput"
            >
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn cancel-btn chalk-text" @click="closeModal">
            Annuler
          </button>
          <button 
            class="modal-btn save-btn chalk-text" 
            @click="saveClass"
            :disabled="!newClassName.trim()"
          >
            {{ editingClass ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de remplissage -->
    <div v-if="fillModal.show" class="modal-overlay" @click="closeFillModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title chalk-text">
            Remplir la classe <span class="classe-name"> {{ fillModal.classe?.nom }}</span>
          </h3>
          
          <button class="modal-close" @click="closeFillModal">×</button>
        </div>
        
        <div class="modal-body custom-scroll">
          <div class="form-group">
            <label class="form-label chalk-text">
              Liste des élèves (un par ligne)
            </label>
            <textarea 
              v-model="studentsText" 
              class="form-textarea chalk-text"
              placeholder="Prénom1  Nom1&#10;Prénom2  Nom2&#10;Prénom3  Nom3&#10;..."
              rows="12"
              ref="studentsTextarea"
            ></textarea>
            <div class="form-hint chalk-text">
              {{ parsedStudents.length }} élève(s) détecté(s)
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn cancel-btn chalk-text" @click="closeFillModal">
            Annuler
          </button>
          <button 
            class="modal-btn save-btn chalk-text" 
            @click="saveStudents"
            :disabled="parsedStudents.length === 0"
          >
            Enregistrer {{ parsedStudents.length }} élève(s)
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="deleteModal.show" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header danger">
          <h3 class="modal-title chalk-text">
            ⚠️ Confirmer la suppression
          </h3>
          <button class="modal-close" @click="closeDeleteModal">×</button>
        </div>
        
        <div class="modal-body">
          <p class="chalk-text">
            Êtes-vous sûr de vouloir supprimer la classe 
            <strong>"{{ deleteModal.classe?.nom }}"</strong> ?
          </p>
          <p class="chalk-text warning-text">
            Cette action supprimera définitivement la classe et ses 
            {{ deleteModal.classe?.eleves.length }} élève(s).
          </p>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn cancel-btn chalk-text" @click="closeDeleteModal">
            Annuler
          </button>
          <button 
            class="modal-btn delete-btn chalk-text" 
            @click="deleteClass"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, onMounted, computed } from 'vue'

interface Eleve {
  nom: string
  ponderation: number
  selections: number
  dateCreation: Date
  [key: string]: any // Permet d'ajouter des propriétés arbitraires
}

interface Classe {
  id: string
  nom: string
  eleves: Eleve[]
  dateCreation: Date
}

export default defineComponent({
  name: 'Home',
  setup() {
    const classes = ref<Classe[]>([])
    const showAddModal = ref(false)
    const newClassName = ref('')
    const editingClass = ref<Classe | null>(null)
    const animatingCards = ref<string[]>([])
    const classNameInput = ref<HTMLInputElement>()
    
    // Modal de remplissage
    const fillModal = ref({
      show: false,
      classe: null as Classe | null
    })
    const studentsText = ref('')
    const studentsTextarea = ref<HTMLTextAreaElement>()
    
    // Modal de suppression
    const deleteModal = ref({
      show: false,
      classe: null as Classe | null
    })
    
    // Parser le texte des élèves
    const parsedStudents = computed(() => {
      if (!studentsText.value) return []
      
      return studentsText.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const parts = line.split(':')
          const nom = parts[0]?.trim()
          
          // Validation du nom
          if (!nom) {
            return null
          }
          
          const ponderation = parts[1] ? parseFloat(parts[1].trim()) : 1
          
          return {
            nom,
            ponderation: isNaN(ponderation) ? 1 : Math.max(0.1, ponderation),
            selections: 0,
            dateCreation: new Date()
          }
        })
        .filter(student => student !== null) as Eleve[]
    })
    
    // Pondération moyenne
    const averagePonderation = computed(() => {
      if (parsedStudents.value.length === 0) return 1
      return parsedStudents.value.reduce((sum, s) => sum + s.ponderation, 0) / parsedStudents.value.length
    })
    
    // Charger les classes depuis le localStorage
    const loadClasses = () => {
      const savedClasses = localStorage.getItem('classes')
      if (savedClasses) {
        classes.value = JSON.parse(savedClasses).map((c: any) => ({
          ...c,
          dateCreation: new Date(c.dateCreation),
          eleves: c.eleves.map((e: any) => ({
            ...e,
            dateCreation: new Date(e.dateCreation || new Date()),
            ponderation: e.ponderation || 1,
            selections: e.selections || 0
          }))
        }))
      }
    }
    
    // Sauvegarder les classes dans le localStorage
    const saveClasses = () => {
      localStorage.setItem('classes', JSON.stringify(classes.value))
    }
    
    // Fonction de tirage pondéré
    const weightedRandomSelection = (students: Eleve[]): Eleve => {
      if (students.length === 0) {
        throw new Error('Cannot select from empty student list')
      }
      
      // Inverser la pondération : plus on a été sélectionné, moins on a de chances
      const weights = students.map(student => {
        const selections = student.selections || 0
        const ponderation = student.ponderation || 1
        const selectionPenalty = Math.max(0.1, 1 - (selections * 0.1))
        return ponderation * selectionPenalty
      })
      
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
      let random = Math.random() * totalWeight
      
      for (let i = 0; i < students.length; i++) {
        const weight = weights[i]
        const student = students[i]
        if (weight !== undefined && student !== undefined) {
          random -= weight
          if (random <= 0) {
            return student
          }
        }
      }
      
      // Fallback sécurisé - on sait que students n'est pas vide grâce à la vérification en début
      const lastStudent = students[students.length - 1]
      if (lastStudent === undefined) {
        throw new Error('Unexpected undefined student')
      }
      return lastStudent
    }
    
    // Tirer un élève au sort
    const rollStudent = (classe: Classe) => {
      if (classe.eleves.length === 0) return
      
      const selectedStudent = weightedRandomSelection(classe.eleves)
      selectedStudent.selections = (selectedStudent.selections || 0) + 1
      
      
      saveClasses()
    }
    
    // Obtenir la classe CSS pour la pondération
    const getPonderationClass = (ponderation: number) => {
      if (ponderation < 0.5) return 'low-weight'
      if (ponderation > 1.5) return 'high-weight'
      return 'normal-weight'
    }
    
    // Obtenir le texte descriptif de la pondération
    const getPonderationText = (ponderation: number) => {
      if (ponderation < 0.5) return 'Moins de chances'
      if (ponderation > 1.5) return 'Plus de chances'
      return 'Chances normales'
    }
    
    // Ajouter/Modifier une classe
    const saveClass = () => {
      if (!newClassName.value.trim()) return
      
      if (editingClass.value) {
        // Modification
        editingClass.value.nom = newClassName.value.trim()
      } else {
        // Ajout
        const newClass: Classe = {
          id: Date.now().toString(),
          nom: newClassName.value.trim(),
          eleves: [],
          dateCreation: new Date()
        }
        classes.value.push(newClass)
        
        // Animation d'apparition
        nextTick(() => {
          animatingCards.value.push(newClass.id)
          setTimeout(() => {
            animatingCards.value = animatingCards.value.filter(id => id !== newClass.id)
          }, 600)
        })
      }
      
      saveClasses()
      closeModal()
    }
    
    // Fermer la modal d'ajout/modification
    const closeModal = () => {
      showAddModal.value = false
      editingClass.value = null
      newClassName.value = ''
    }
    
    // Modifier une classe
    const editClass = (classe: Classe) => {
      editingClass.value = classe
      newClassName.value = classe.nom
      nextTick(() => {
        classNameInput.value?.focus()
      })
    }
    
    // Ouvrir la modal de remplissage
    const openFillModal = (classe: Classe) => {
      fillModal.value.classe = classe
      fillModal.value.show = true
      // Formatter les élèves existants pour l'édition
      studentsText.value = classe.eleves.map(eleve => {
        return eleve.ponderation !== 1 
          ? `${eleve.nom}:${eleve.ponderation}`
          : eleve.nom
      }).join('\n')
      nextTick(() => {
        studentsTextarea.value?.focus()
      })
    }
    
    // Fermer la modal de remplissage
    const closeFillModal = () => {
      fillModal.value.show = false
      fillModal.value.classe = null
      studentsText.value = ''
    }
    
    // Sauvegarder les élèves
    const saveStudents = () => {
      if (fillModal.value.classe && parsedStudents.value.length > 0) {
        // Conserver les statistiques des élèves existants
        const existingStudents = fillModal.value.classe.eleves
        const updatedStudents = parsedStudents.value.map(newStudent => {
          const existing = existingStudents.find(e => e.nom === newStudent.nom)
          return existing ? {
            ...existing,
            ponderation: newStudent.ponderation // Mettre à jour la pondération
          } : newStudent
        })
        
        fillModal.value.classe.eleves = updatedStudents
        saveClasses()
      }
      closeFillModal()
    }
    
    // Confirmer la suppression
    const confirmDelete = (classe: Classe) => {
      deleteModal.value.classe = classe
      deleteModal.value.show = true
    }
    
    // Fermer la modal de suppression
    const closeDeleteModal = () => {
      deleteModal.value.show = false
      deleteModal.value.classe = null
    }
    
    // Supprimer une classe
    const deleteClass = () => {
      if (deleteModal.value.classe) {
        const index = classes.value.findIndex(c => c.id === deleteModal.value.classe!.id)
        if (index !== -1) {
          classes.value.splice(index, 1)
          saveClasses()
        }
      }
      closeDeleteModal()
    }
    
    onMounted(() => {
      loadClasses()
      nextTick(() => {
        if (showAddModal.value) {
          classNameInput.value?.focus()
        }
      })
    })
    
    return {
      classes,
      showAddModal,
      newClassName,
      editingClass,
      animatingCards,
      classNameInput,
      fillModal,
      studentsText,
      studentsTextarea,
      deleteModal,
      parsedStudents,
      averagePonderation,
      rollStudent,
      getPonderationClass,
      getPonderationText,
      saveClass,
      closeModal,
      editClass,
      openFillModal,
      closeFillModal,
      saveStudents,
      confirmDelete,
      closeDeleteModal,
      deleteClass
    }
  }
})
</script>

<style scoped>
.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
  padding-top: 80px; 
  height: calc(100vh - 60px); 
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.main-title {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 20px; 
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
  flex-shrink: 0; 
}

.add-section {
  text-align: center;
  margin-bottom: 20px;
  flex-shrink: 0; 
}

.add-class-btn {
  background: linear-gradient(90deg, #3ad613, #13b940);
  border: #27ae60;
  border-radius: 15px;
  padding: 9px 18px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
  display: inline-flex; 
  align-items: center;
  gap: 10px;
}

.add-class-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
  border-color: rgba(255, 255, 255, 0.5);
}

.add-class-btn.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3); }
  50% { box-shadow: 0 6px 30px rgba(39, 174, 96, 0.6); }
  100% { box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3); }
}

.btn-icon {
  font-size: 1.1em;
}

.classes-scroll-container {
  flex: 1;
  overflow-y: auto; 
  overflow-x: hidden; 
  padding-right: 10px; 
  margin-right: -10px; 
}

/* Style personnalisé pour la scrollbar */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  padding-bottom: 5px;
}

.class-card {
  margin-top: 5px;
  background: rgba(0, 0, 0, 0.8);
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 25px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.class-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.class-card:hover::before {
  left: 100%;
}

.class-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.class-card.animating {
  animation: cardAppear 0.6s ease-out;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.class-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.class-name {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #ecf0f1;
}

.student-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.students-preview {
  margin-bottom: 20px;
  min-height: 60px;
}

.students-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.student-tag {
  background: rgba(52, 152, 219, 0.3);
  border: 1px solid rgba(52, 152, 219, 0.5);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.8rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.student-weight {
  font-size: 0.7rem;
  opacity: 0.8;
}

.student-tag.more {
  background: rgba(155, 89, 182, 0.3);
  border-color: rgba(155, 89, 182, 0.5);
}

.no-students {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.class-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 70px;
}

.roll-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border-color: rgba(155, 89, 182, 0.3);
}

.roll-btn:hover:not(:disabled) {
  border-color: rgba(155, 89, 182, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
}

.roll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.fill-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-color: rgba(52, 152, 219, 0.3);
}

.fill-btn:hover {
  border-color: rgba(52, 152, 219, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.edit-btn {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  border-color: rgba(243, 156, 18, 0.3);
}

.edit-btn:hover {
  border-color: rgba(243, 156, 18, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border-color: rgba(231, 76, 60, 0.3);
}

.delete-btn:hover {
  border-color: rgba(231, 76, 60, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-illustration {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 2rem;
  margin-bottom: 15px;
  opacity: 0.8;
}

.empty-description {
  font-size: 1.1rem;
  opacity: 0.6;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalAppear 0.3s ease-out;
}

.modal-content.large {
  max-width: 800px;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 25px 25px 15px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header.danger {
  border-bottom-color: rgba(231, 76, 60, 0.3);
}

.modal-title {
  margin: 0;
  font-size: 1.4rem;
}

.classe-name {
  font-size: 2rem;
  color: #159c56;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 25px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 1rem;
  opacity: 0.9;
}

.form-input, .form-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 15px;
  font-size: 1rem;
  color: white;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: rgba(52, 152, 219, 0.8);
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-hint {
  margin-top: 8px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.students-preview-modal {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}

.students-preview-modal h4 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.preview-students-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
}

.preview-student {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-student:last-child {
  border-bottom: none;
}

.student-name {
  font-weight: bold;
}

.student-pond {
  font-size: 0.85rem;
  text-align: right;
}

.student-pond.low-weight {
  color: #e74c3c;
}

.student-pond.high-weight {
  color: #27ae60;
}

.student-pond.normal-weight {
  color: #95a5a6;
}

.roll-result {
  text-align: center;
  padding: 40px 20px;
}

.selected-student {
  background: rgba(155, 89, 182, 0.1);
  border: 3px solid rgba(155, 89, 182, 0.3);
  border-radius: 20px;
  padding: 30px;
  animation: studentAppear 0.5s ease-out;
}

@keyframes studentAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.student-avatar {
  font-size: 4rem;
  margin-bottom: 20px;
}

.selected-student .student-name {
  margin: 0 0 20px 0;
  font-size: 2.5rem;
  color: #ecf0f1;
}

.student-details p {
  margin: 5px 0;
  font-size: 1.1rem;
  opacity: 0.8;
}

.warning-text {
  color: #e74c3c !important;
  font-weight: bold;
}

.modal-footer {
  padding: 15px 25px 25px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.modal-btn {
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 12px 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(149, 165, 166, 0.2);
  border-color: rgba(149, 165, 166, 0.3);
}

.cancel-btn:hover {
  background: rgba(149, 165, 166, 0.3);
  border-color: rgba(149, 165, 166, 0.8);
}

.save-btn {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  border-color: rgba(39, 174, 96, 0.3);
}

.save-btn:hover:not(:disabled) {
  border-color: rgba(39, 174, 96, 0.8);
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.modal-btn.delete-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border-color: rgba(231, 76, 60, 0.3);
}

.modal-btn.delete-btn:hover {
  border-color: rgba(231, 76, 60, 0.8);
  transform: translateY(-2px);
}
</style>