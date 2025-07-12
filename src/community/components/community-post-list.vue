<script>
import CommunityPostItem from "@/community/components/community-post-item.vue";

export default {
  name: "community-post-list",
  components: {CommunityPostItem},
  props: {
    posts: {
      type: Array,
      required: true,
    }
  },
  emits: ['post-deleted'], // 👈 EMITIR evento al padre
  methods: {
    removePost(deletedPostId) {
      this.$emit('post-deleted', deletedPostId) // ✅ en vez de modificar el prop
    }
  }

}
</script>

<template>
  <div class="community-card">
    <community-post-item
        v-for="p in posts"
        :key="p.id"
        :post="p"
        @post-deleted="removePost"
    />
  </div>
</template>


<style scoped>
.community-card{
  padding: 1vw;
  cursor: pointer;
  width: 100%;
}

</style>