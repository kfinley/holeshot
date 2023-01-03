// Loaded once per application. Required for dependency injection
import 'reflect-metadata';
import { Container } from "inversify-props";
import { container as defaultContainer } from 'inversify-props';

const container = new Container({
  autoBindInjectable: true,
  skipBaseClassChecks: true,
});

// Required to make @Inject() properties work
defaultContainer.parent = container;

export { container };
