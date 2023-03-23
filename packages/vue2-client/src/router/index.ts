import Vue from 'vue';
import VueRouter, { Route, RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';
import Articles from '../articles';
import { createRouterLayout } from 'vue-router-layout';
import { RouteNames } from './RouteNames';
import { defineAsyncComponent } from 'vue';

// Setup Layouts
const RouterLayout = createRouterLayout((layout) => {
  return import(
    '../layouts/Layout' + layout.charAt(0).toUpperCase() + layout.slice(1) + '.vue'
  );
});

const LayoutArticle = createRouterLayout((layout) => {
  return import('../layouts/LayoutArticle.vue');
});

Vue.use(VueRouter);

const viewsMeta = import.meta.glob('../views/*.json');

export const createRouter = async () => {
  const routes: Array<RouteConfig> = [
    {
      path: '/',
      component: RouterLayout,
      children: [
        {
          path: '',
          name: RouteNames.Home,
          component: Home,
          meta: viewsMeta[`../views/Home.json`]
            ? ((await viewsMeta[`../views/Home.json`]()) as any).default
            : { allowAnonymous: true },
        },
      ],
    },
    {
      path: '/articles',
      component: RouterLayout,
      children: [
        {
          path: '',
          name: RouteNames.Articles,
          component: () =>
            import(/* webpackChunkName: "articles" */ '../views/Articles.vue'),
          meta: viewsMeta['../views/Articles.json']
            ? (await viewsMeta['../views/Articles.json']()).default
            : { allowAnonymous: true },
        },
      ],
    },
    {
      path: '/scheduler',
      component: RouterLayout,
      children: [
        {
          path: '',
          name: RouteNames.Scheduler,
          component: () =>
            import(/* webpackChunkName: "scheduler" */ '../views/Schedule.vue'),
          meta: {
            allowAnonymous: false,
          },
        },
      ],
    },
    {
      path: '',
      component: RouterLayout,
      children: [
        {
          path: '/settings/user',
          name: RouteNames.UserSettings,
          component: () =>
            import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
          meta: {
            allowAnonymous: false,
          },
        }
      ]
    },
  ];

  for (const article of Object.keys(Articles)) {
    try {
      // console.log('article', article);
      // console.log('article path', `../articles/${article}.md`)

      // This is a shitty hack to make nested paths for dynamic imports work b/c of an issue in Vite
      // https://github.com/vitejs/vite/issues/4945
      // this is cleaner but doesn't work
      // const articleFiles = import.meta.glob('../articles/**/*.md');
      // const match = articleFiles[`../articles/${article}.md`];
      // const articleComponent = defineAsyncComponent(() => import(match.name));
      const articlePathParts = article.split('/');
      let articleComponent;
      if (articlePathParts.length === 1) {
        articleComponent = defineAsyncComponent(
          () =>
            import(
              /* @vite-ignore */ /* webpackChunkName: "[request]" */ `../articles/${articlePathParts[0]}.md`
            )
        );
      }
      if (articlePathParts.length === 2) {
        articleComponent = defineAsyncComponent(
          () =>
            import(
              /* @vite-ignore */ /* webpackChunkName: "[request]" */ `../articles/${articlePathParts[0]}/${articlePathParts[1]}.md`
            )
        );
      }
      routes.push({
        path: `/${article}`,
        component: RouterLayout,
        children: [
          {
            path: '',
            component: LayoutArticle,
            children: [
              {
                path: '',
                name: article,
                component: articleComponent,
              },
            ],
          },
        ],
        meta: viewsMeta[`../articles/${article}.json`]
          ? ((await viewsMeta[`../articles/${article}.json`]()) as any).default
          : { allowAnonymous: true },
      });
      // console.log(`Created route for article at path /${article}`)
    } catch (e) {
      console.log(e);
    }
  }

  const router = new VueRouter({
    mode: 'history',
    base: '/', // process.env.BASE_URL,
    routes,
    scrollBehavior(to, from, savedPosition) {
      return { x: 0, y: 0 };
    },
  });

  // This callback runs before every route change, including on page load.
  router.beforeEach((to, from, next) => {
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    const nearestWithTitle = to.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.title);

    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.metaTags);

    const previousNearestWithMeta = from.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.metaTags);

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) {
      document.title = nearestWithTitle.meta.title;
    } else if (previousNearestWithMeta) {
      document.title = previousNearestWithMeta.meta.title;
    }

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Skip rendering meta tags if there are none.
    if (!nearestWithMeta) return next();

    // Turn the meta tag definitions into actual elements in the head.
    nearestWithMeta.meta.metaTags
      .map((tagDef: any) => {
        const tag = document.createElement('meta');

        Object.keys(tagDef).forEach((key) => {
          tag.setAttribute(key, tagDef[key]);
        });

        // We use this to track which meta tags we create so we don't interfere with other ones.
        tag.setAttribute('data-vue-router-controlled', '');

        return tag;
      })
      // Add the meta tags to the document head.
      .forEach((tag: any) => document.head.appendChild(tag));

    next();
  });

  const getMetaData = async (route: Route) => {
    //console.log('route', route);
    // This is a shitty hack to make nested paths for dynamic imports work b/c of an issue in Vite
    // https://github.com/vitejs/vite/issues/4945
    const pathParts = route.name?.split('/') as string[];
    switch (route.name) {
      case 'Home':
      case 'Posts':
        return (await import(`../views/${pathParts[0]}.json`)).default;
      default: {
        if (route.path.includes('/articles/')) {
          if (pathParts.length === 1) {
            return (await import(`../articles/${pathParts[0]}.json`)).default;
          }
          if (pathParts.length === 2) {
            return (await import(`../articles/${pathParts[0]}/${pathParts[1]}.json`))
              .default;
          }
        }
      }
    }
  };

  router.afterEach((to, from) => {
    setTimeout(() => {
      getMetaData(to).then((meta) => {
        if (meta) {
          document.title = meta.title;

          for (const tag of meta.metaTags) {
            // console.log(tag)
            const tagEl = document.createElement('meta');
            tagEl.setAttribute(
              Object.values(tag as string)[0],
              Object.values(tag as string)[1]
            );

            // We use this to track which meta tags we create so we don't interfere with other ones.
            tagEl.setAttribute('data-vue-router-controlled', '');
            document.head.appendChild(tagEl);
          }
        }
      });

      try {
        document.querySelectorAll('img').forEach((i) => {
          i.src = i.src.replace('media', 'img/media');
        });

        //TODO: look back and see what this does...
        // Array.from(
        //   Array.from(document.getElementsByTagName('main'))[0].querySelectorAll(
        //     'main a:not(a[href*="http"])'
        //   )
        // ).map((link) => {
        //   // console.log(link)
        //   link.addEventListener(
        //     'click',
        //     function (e) {
        //       e.preventDefault();
        //       e.stopPropagation();
        //       router.push({ path: (link as any).href.split(window.location.host)[1] });
        //     },
        //     false
        //   );
        // });
      } catch (e) {
        console.log(e);
      }
    }, 200);
  });

  return router;
};
