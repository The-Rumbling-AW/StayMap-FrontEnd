<template>
  <div class="community-content">
    <!-- Encabezado -->
    <div class="community-toolbar">
      <button class="go-back-btn" @click="onGoBackClicked()">←</button>
      <span class="spacer-1"></span>
      <div>
        <h2>{{ community.name }}</h2>
        <span>{{ community.posts.length }} posts</span>
      </div>
    </div>

    <!-- Imagen -->
    <div class="community-img">
      <img :src="community.image" :alt="community.name" />
    </div>

    <!-- Info principal -->
    <div class="community-header">
      <div class="community-info">
        <span>{{ community.name }}</span>
        <span class="spacer-2"></span>

        <button class="violet-btn" @click="loadCommunityMembers">View Members</button>

        <Dialog
            v-model:visible="showMembersDialog"
            modal
            draggable={false}
            dismissableMask
            header="Miembros de la Comunidad"
            class="custom-dialog"
        >
          <div class="dialog-content">
            <div v-if="membersDetails.length === 0">
              <p>No hay miembros aún.</p>
            </div>
            <div v-else>
              <div v-for="member in membersDetails" :key="member.id" class="member-card">
                <img :src="member.profileImage || 'https://via.placeholder.com/50'" class="member-avatar" />
                <div class="member-info">
                  <p class="username">@{{ member.name.toLowerCase().replace(/\s+/g, '') }}</p>
                  <p>{{ member.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </Dialog>

        <button
            class="violet-btn"
            @click="onJoinClicked()"
            @mouseenter="hoveringJoinBtn = true"
            @mouseleave="hoveringJoinBtn = false"
        >
          {{ alreadyJoined ? (hoveringJoinBtn ? "Leave" : "Joined") : "Join" }}
        </button>
      </div>

      <div class="community-description">
        {{ community.description }}
      </div>
    </div>

    <!-- Posts -->
    <div class="posts-tabs">
      <div :class="['posts-btn', { active: isPostsBtnActive }]">
        <div>
          <div>Posts</div>
          <div class="underline" v-if="isPostsBtnActive"></div>
        </div>
      </div>
    </div>

    <div class="community-posts">
      <button v-if="isMember" class="violet-btn post-btn" @click="isPostFormVisible = true">
        + Nuevo post
      </button>

      <community-post-item
          v-if="isPostFormVisible"
          :post="new Post({ id: 0, userId: user.id, communityId: community.id, content: '', postedAt: '', imageUrl: '' })"
          @post-submitted="handlePostSubmitted"
          @cancel-post="handleCancelPost"
      />

      <div v-for="post in posts" :key="post.id" class="post-wrapper">
        <community-post-item :post="post" />
      </div>
    </div>
  </div>
</template>

<script>
import { CommunityService } from "@/community/services/community.service.js";
import { UserService } from "@/users/services/user.service.js";
import { PostService } from "@/community/services/post.service.js";
import { Community } from "@/community/model/community.entity.js";
import CommunityPostList from "@/community/components/community-post-list.vue";
import CommunityPostItem from "@/community/components/community-post-item.vue";
import { Post } from "@/community/model/post.entity.js";
import { User } from "@/users/model/user.entity.js";
import Dialog from 'primevue/dialog';

export default {
  name: "community-details",
  components: { CommunityPostItem, CommunityPostList, Dialog },
  data() {
    return {
      communityService: new CommunityService(),
      postService: new PostService(),
      userService: new UserService(),
      community: new Community({}),
      posts: [],
      alreadyJoined: false,
      hoveringJoinBtn: false,
      isPostsBtnActive: true,
      newPost: null,
      isEditMode: false,
      isPostFormVisible: false,
      user: null,
      showMembersDialog: false,
      membersDetails: []
    };
  },
  computed: {
    isMember() {
      return this.user && this.community.members.map(id => +id).includes(+this.user.id);
    },
    Post() {
      return Post;
    }
  },
  created() {
    const communityId = this.$route.params.id;
    const storedUser = localStorage.getItem("user");
    if (storedUser) this.user = new User(JSON.parse(storedUser));

    this.communityService.getById(communityId).then(res => {
      this.community = new Community({ ...res.data });
      this.community.posts = this.community.posts.reverse();

      if (this.user && this.community.members.map(id => +id).includes(+this.user.id)) {
        this.alreadyJoined = true;
      }

      this.postService.getByCommunityId(communityId).then(res => {
        this.posts = res.data.map(item => new Post(item)).reverse();
      });
    });
  },
  methods: {
    handlePostSubmitted(payload) {
      this.postService
          .create(this.community.id, this.user.id, payload)
          .then(res => {
            const newPost = new Post(res.data);
            this.posts.unshift(newPost);
            this.isPostFormVisible = false;
          })
          .catch(err => {
            console.error("Error al crear el post:", err);
          });
    },
    handleCancelPost() {
      this.isPostFormVisible = false;
    },
    onGoBackClicked() {
      this.$router.back();
    },
    onJoinClicked() {
      if (!this.alreadyJoined) this.joinCommunity();
      else this.leaveCommunity();
    },
    joinCommunity() {
      this.communityService.join(this.community.id, this.user.id)
          .then(() => {
            this.alreadyJoined = true;
            if (!this.community.members.includes(this.user.id)) this.community.members.push(this.user.id);
            if (!this.user.communitiesJoined.includes(this.community.id)) this.user.communitiesJoined.push(this.community.id);
            localStorage.setItem("user", JSON.stringify(this.user));
          })
          .catch(err => {
            console.error("Error al unirse a la comunidad:", err);
          });
    },
    leaveCommunity() {
      if (!this.user || !this.user.id || !this.community.id) return;
      this.communityService.leave(this.community.id, this.user.id)
          .then(() => {
            this.alreadyJoined = false;
            this.community.members = this.community.members.filter(id => id !== this.user.id);
            this.user.communitiesJoined = this.user.communitiesJoined.filter(id => id !== this.community.id);
            localStorage.setItem("user", JSON.stringify(this.user));
          })
          .catch(error => {
            console.error("Error al salir de la comunidad:", error);
          });
    },
    async loadCommunityMembers() {
      try {
        const users = await Promise.all(
            this.community.members.map(id => this.userService.getById(id).then(res => res.data))
        );
        this.membersDetails = users;
        this.showMembersDialog = true;
      } catch (error) {
        console.error("Error al cargar miembros de la comunidad:", error);
      }
    }
  }
};
</script>

<style >

::v-deep(.custom-dialog) {
  width: 35vw !important; 
  max-width: 90vw;
  background-color: #1a1a1a;
  border-radius: 20px;
  padding: 2rem;
  color: white;
  overflow-y: auto;
}

.violet-btn {
  background-color: #cb6ce6;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 25px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.violet-btn:hover {
  background-color: #b347d3;
  transform: scale(1.03);
}

.community-content {
  background-color: #121212;
  color: white;
  border-radius: 1vw;
  margin: 0 auto;
  width: 35vw;
  height: 90vh;
  overflow-y: auto;
}

.community-toolbar {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333840;
}

.go-back-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 100vw;
  padding: 0.5rem;
  cursor: pointer;
}

.go-back-btn:hover {
  background-color: #cb6ce6;
}

.spacer-1 {
  width: 1rem;
}

.spacer-2 {
  flex: 1;
}

.community-img {
  display: flex;
  justify-content: center;
  height: 20vw;
}

.community-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.community-info {
  display: flex;
  align-items: center;
  margin: 1rem;
  gap: 1rem;
}

.community-description {
  margin: 1rem;
}

.posts-tabs {
  display: flex;
  border-bottom: 1px solid #333840;
}

.posts-btn {
  flex: 1;
  text-align: center;
  padding: 1rem;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.posts-btn:hover {
  background: #1e1e1e;
  color: #cb6ce6;
}

.posts-btn.active {
  font-weight: bold;
  color: #cb6ce6;
}

.underline {
  margin-top: 4px;
  width: 100%;
  height: 4px;
  background-color: #cb6ce6;
  border-radius: 2px;
}

.community-posts {
  padding: 1rem;
}

.post-wrapper {
  margin-top: 1rem;
}

.custom-dialog {
  background-color: #1a1a1a;
  border-radius: 20px;
  padding: 2rem;
  color: white;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #111;
  padding: 1rem;
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid #cb6ce6;
  box-shadow: 0 0 15px rgba(203, 108, 230, 0.2);
  transition: transform 0.2s ease;
}

.member-card:hover {
  transform: translateY(-3px);
  background-color: #1f1f1f;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #cb6ce6;
}

.member-info {
  display: flex;
  flex-direction: column;
}

.member-info .username {
  font-weight: bold;
  color: #cb6ce6;
  margin: 0;
  font-size: 0.95rem;
}

.member-info p:last-child {
  color: white;
  margin: 0;
  font-size: 0.9rem;
}
/* Aplica scroll morado al contenido del Dialog */
::v-deep(.p-dialog .p-dialog-content) {
  max-height: 60vh;
  overflow-y: auto;
}

/* Scrollbar personalizado */
::v-deep(.p-dialog .p-dialog-content::-webkit-scrollbar) {
  width: 8px;
}

::v-deep(.p-dialog .p-dialog-content::-webkit-scrollbar-thumb) {
  background-color: #cb6ce6;
  border-radius: 10px;
}

::v-deep(.p-dialog .p-dialog-content::-webkit-scrollbar-track) {
  background-color: transparent;
}
</style>
