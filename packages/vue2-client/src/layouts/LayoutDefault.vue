<template>
  <div class="LayoutDefault">
    <Header class="LayoutDefault__header" />
    <NotificationList id="notifications" class="LayoutDefault__notifications" />
    <main class="LayoutDefault__main">
      <router-view />
    </main>
    <Footer class="LayoutDefault__footer" />
    <add-to-home-screen />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Header, Footer } from '../components/';
import NotificationList from '@finley/vue2-components/src/components/notification-list.vue';
import AddToHomeScreen from '@finley/vue2-components/src/components/add-to-home-screen.vue';
import useRegisterSW from '../mixins/use-register-sw';

@Component({
  components: {
    AddToHomeScreen,
    Header,
    Footer,
    NotificationList,
  },
  mixins: [useRegisterSW],
})
export default class LayoutDefault extends Vue {
  headerOffsetTop: number = 0;
  header: element;
  notifications: element;

  mounted() {
    window.addEventListener('scroll', this.handleScroll);

    // Get the header
    this.header = document.getElementById('header');
    this.notifications = document.getElementById('notifications');

    // Get the offset position of the navbar
    this.headerOffsetTop = this.header.offsetTop;
  }

  // Add the sticky class to the header when you reach its scroll position.
  // Remove "sticky" when you leave the scroll position
  handleScroll(e) {
    if (window.pageYOffset > this.headerOffsetTop) {
      this.notifications.classList.add('sticky');
    } else {
      this.notifications.classList.remove('sticky');
    }
  }
}
</script>

<style lang="scss">
.LayoutDefault {
  margin-right: auto;
  margin-left: auto;

  &__header {
    border-bottom: 1px solid grey;
    background: $header-background;
  }

  &__notifications {
    position: absolute !important;
    top: 4em !important;
  }

  &__notifications.sticky {
    position: sticky !important;
    top: 2em !important;
  }

  &__main {
    padding-top: 3em;
    padding-bottom: 4em;
  }

  &__main > div {
    padding: 0em 2em 2em 2em;
  }

  &__main > span > div > div > p > img {
    max-width: 99%;
    border-radius: 6px;
  }

  &__footer {
    background: $footer-background;
    color: $footer-color;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
  }
}

.article-wrapper > div > div > p > img {
  max-width: 99%;
  border-radius: 6px;
}

@media (min-width: 768px) {
  .LayoutDefault {
    // Handle Home & Posts pages
    &__main > span > div:nth-child(2) {
      max-width: 900px;
      margin: auto;
    }
    // Handle Article pages
    &__main > article {
      max-width: 900px;
      margin: auto;
    }
  }
}
</style>
