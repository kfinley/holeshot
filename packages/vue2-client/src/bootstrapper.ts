import { container } from './inversify.config';
import { Store } from 'vuex';
import { ArticlesModule, getArticlesModule } from './store/articles-module';

export default function bootstrapper(store: Store<any>) {
  // console.log('vue2-client Bootstrapper', process.env.NODE_ENV);

  container
    .bind<ArticlesModule>('ArticlesModule')
    .toDynamicValue(() => getArticlesModule(store));

  // console.log('Bootstrapper Done');

  return container;
}
