<script>
export default {
  data(){
    return {
      languages: ['en', 'es']
    }
  }
}
</script>
<template>
  <div class="language-toggle">
    <button
        :class="{ active: $i18n.locale === 'en' }"
        @click="$i18n.locale = 'en'"
    >
      EN
    </button>
    <button
        :class="{ active: $i18n.locale === 'es' }"
        @click="$i18n.locale = 'es'"
    >
      ES
    </button>
  </div>
</template>

<style scoped>
.language-toggle {
  display: flex;
  border: 1px solid #cb6ce6;
  border-radius: 20px;
  overflow: hidden;
  height: 42px;
}

.language-toggle button {
  flex: 1;
  background-color: #2a2a2a;
  color: white;
  border: none;
  padding: 0 12px;
  font-weight: bold;
  font-size: 0.85rem;
  transition: background-color 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-toggle button.active {
  background-color: #cb6ce6;
  color: black;
}

.language-toggle button:hover {
  cursor: pointer;
  background-color: #b04ad4;
}
</style>
