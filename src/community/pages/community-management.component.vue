<script>
import {Community} from "@/community/model/community.entity.js";
import CommunityItemCreateAndEditComponent from "@/community/components/community-item-create-and-edit.component.vue";
import DataManager from "@/shared/components/data-manager.component.vue";
import {CommunityService} from "@/community/services/community.service.js"

export default {
  name: "community-management",
  components: {CommunityItemCreateAndEditComponent, DataManager},
  props: {
    searchQuery: String
  },
  data() {
    return {
      title: {singular: "Community", plural: "Communities"},

      communities: [],

      community: new Community({}),

      selectedCommunities: [],

      communityService: null,

      createAndEditDialogIsVisible: false,

      isEdit: false,

      submitted: false,
      currentUser: JSON.parse(localStorage.getItem("user")) || null,
      selectedTab: 'discover'
    }
  },
  methods: {

    notifySuccessfulAction(message) {
      this.$toast.add({severity: 'success', summary: 'Success', detail: message, life: 3000});
    },

    findIndexById(id) {
      return this.communities.findIndex(community => community.id === id);
    },


    onNewItem() {
      this.community = new Community({});
      this.isEdit = false;
      this.submitted = false;
      this.createAndEditDialogIsVisible = true;
      console.log(this.createAndEditDialogIsVisible);
    },

    onEditItem(item) {
      this.community = new Community(item);
      this.isEdit = true;
      this.submitted = false;
      this.createAndEditDialogIsVisible = true;
    },


    onDeleteItem(item) {
      this.community = {...item};
      this.deleteCommunity();
    },

    onDeleteSelectedItems(selectedItems) {
      this.selectedCommunities = selectedItems;
      this.deleteSelectedCommunities();
    },

    onCancelRequested() {
      this.createAndEditDialogIsVisible = false;
      this.submitted = false;
      this.isEdit = false;
    },

    onSaveRequested(item) {
      console.log('onSaveRequested');
      this.submitted = true;
      if (this.community.name.trim()) {
        if (item.id) {
          this.updateCommunity();
        } else {
          this.createCommunity();
        }
        this.createAndEditDialogIsVisible = false;
        this.isEdit = false;
      }
    },

    createCommunity() {
      const dataToSend = { ...this.community };
      if (!dataToSend.id || dataToSend.id === '') {
        delete dataToSend.id;
      }

      this.communityService.create(dataToSend).then(response => {
        let community = new Community(response.data);
        this.communities.push(community);
        this.notifySuccessfulAction("Community Created");
      }).catch(error => {
        console.error('Error al crear comunidad ', error);
      });
    },

    updateCommunity() {
      this.communityService.update(this.community.id, this.community).then(response => {
        console.log('updateCommunity');
        let index = this.findIndexById(this.community.id);
        this.communities[index] = new Community(response.data);
        console.log(this.communities);
        this.notifySuccessfulAction("Community Updated");
      }).catch(error => console.error(error));
    },

    deleteCommunity() {
      this.communityService.delete(this.community.id).then(() => {
        let index = this.findIndexById(this.community.id);
        this.communities.splice(index, 1);
        this.notifySuccessfulAction("Community Deleted");
      }).catch(error => console.error(error));
    },

    deleteSelectedCommunities() {
      this.selectedCommunities.forEach((community) => {
        this.communityService.delete(community.id).then(() => {
          this.community = this.communities.filter((t) => t.id !== this.community.id);
        });
      });
      this.notifySuccessfulAction("Communities Deleted");
    }
  },

  computed: {
    filteredCommunities() {
      const term = this.searchQuery?.toLowerCase() || '';
      if (!term) return this.communities;

      return this.communities.filter(c =>
          c.name.toLowerCase().includes(term) ||
          (c.tags && c.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    },
    joinedCommunities() {
      if (!this.currentUser || !Array.isArray(this.currentUser.communitiesJoined)) return [];
      return this.communities.filter(c => this.currentUser.communitiesJoined.includes(c.id));
    },
    discoverCommunities() {
      if (!this.currentUser || !Array.isArray(this.currentUser.communitiesJoined)) return this.communities;
      return this.communities.filter(c => !this.currentUser.communitiesJoined.includes(c.id));
    }
  },

  created() {
    this.communityService = new CommunityService();
    this.communityService.getAll().then(response => {
      this.communities = response.data.map(c => new Community(c));
    });
    this.communityService.getAll().then(response => {
      console.log('API response:', response.data);
      this.communities = response.data.map(c => new Community(c));
    }).catch(error => console.error(' Error al cargar comunidades ', error));
  }
}
</script>

<template>
  <div class="w-full">
    <!-- DIALOGO PARA CREAR NUEVA COMUNIDAD-->
    <div class="flex justify-content-between align-items-center mb-4" style="margin-left: 1.5rem;">
      <h2 class="text-2xl">Comunidades</h2>
      <pv-button  label="Nueva comunidad" icon="pi pi-plus" severity="success" @click="onNewItem" style="background-color: #CB6CE6; border-radius: 25px; border: none; color: white; font-weight: bold;"/>
    </div>

    <div class="communities-group-container flex gap-5">
      <!-- SIDEBAR -->
      <div class="groups-container">
        <div class="groups-header">Grupos</div>
        <div class="groups-options">
          <a @click="selectedTab = 'discover'" :class="{ active: selectedTab === 'discover' }">Descubrir</a>
          <a @click="selectedTab = 'joined'" :class="{ active: selectedTab === 'joined' }">Tus Grupos</a>
        </div>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">

        <div v-for="community in selectedTab === 'discover' ? discoverCommunities : joinedCommunities"
             :key="community.id" class="community-card">
          <img :src="community.image" :alt="community.name" />
          <div class="info">
            <h3>{{ community.name }}</h3>
            <!-- <p>{{ community.memberQuantity }} miembros</p>-->
          </div>
          <router-link style="display: flex; align-content: center; text-decoration: none" :to="`/communities/${community.id}`">
            <button class="join-button">Ver comunidad</button>
          </router-link>
             </div>
           </div>

           <!-- DiÃ¡logo Crear / Editar -->
      <community-item-create-and-edit-component
          :edit="isEdit"
          :item="community"
          :visible="createAndEditDialogIsVisible"
          @cancel-requested="onCancelRequested"
          @save-requested="onSaveRequested($event)"
      />
    </div>
  </div>
</template>

<style >
.groups-container {
  background-color: #1a1a1a;
  border: 1px solid #cb6ce6;
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 200px;
  max-width: 240px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido horizontalmente */
}

.groups-header {
  font-size: 1.1rem; 
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
  border-bottom: 1px solid #cb6ce6;
  width: 100%;
  padding-bottom: 0.5rem;
}

.groups-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.groups-options a {
  cursor: pointer;
  font-size: 0.95rem; /* Reducido */
  font-weight: 500;
  color: #aaa;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: background-color 0.3s, color 0.3s;
  text-decoration: none;
  width: 100%;
  text-align: center;
}

.groups-options a:hover {
  background-color: #2a2a2a;
  color: white;
}

.groups-options a.active {
  background-color: #CB6CE6;
  color: white;
}

</style>
