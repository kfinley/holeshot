<template>
  <span>
    <hero />
    <div class="p-4">
      <h1>List of Articles</h1>
      <div v-if="loading()">Loading...</div>
      <ul v-else>
        <li v-for="key in Object.keys(articlesState.articles)">
          <router-link :to="{ name: key }">{{ articlesState.articles[key] }}</router-link>
        </li>
      </ul>
    </div>
  </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ArticlesState, Status } from '../store/state'
import { State } from 'vuex-class'
import { getArticlesModule } from '../store/articles-module'
import { Hero } from '../components'

@Component({
  components: {
    Hero,
  },
})
export default class Articles extends Vue {
  @State('Articles') articlesState!: ArticlesState

  async created() {
    await getArticlesModule(this.$store).loadArticles()
  }

  loading() {
    return this.articlesState.status === Status.Loading
  }
}
</script>
