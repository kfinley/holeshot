<template>
  <div>
    <notification-list />
    <card
      header-text="Login"
      :show-close="false"
      style="height: 90vh"
      max-width="600px"
      padding="2"
    >
      <ValidationObserver ref="formObserver">
        <form @submit.prevent="onSubmit" autocomplete="off" role="form text-left">
          <div class="mb-3">
            <ValidationProvider
              name="email"
              type="email"
              rules="required|email"
              mode="passive"
              v-slot="{ errors }"
            >
              <input
                type="email"
                :class="['form-control', { 'is-invalid': errors[0] }]"
                placeholder="Email"
                aria-label="Email"
                v-model="email"
                ref="emailElement"
                :disabled="loggingIn"
              />
              <div v-show="errors[0]" class="invalid-feedback">
                {{ errors[0] }}
              </div>
            </ValidationProvider>
          </div>
          <div class="mb-3">
            <ValidationProvider
              name="password"
              rules="required"
              mode="passive"
              v-slot="{ errors }"
            >
              <input
                type="password"
                :class="['form-control', { 'is-invalid': errors[0] }]"
                placeholder="Password"
                aria-label="Password"
                v-model="password"
                :disabled="loggingIn"
              />
              <div v-show="errors[0]" class="invalid-feedback">
                {{ errors[0] }}
              </div>
            </ValidationProvider>
          </div>

          <div class="text-center">
            <button
              type="submit"
              class="btn primary-gradient w-100 my-4 mb-2"
              :disabled="loggingIn"
            >
              <span
                v-if="loggingIn"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Log in
            </button>
          </div>
        </form>
      </ValidationObserver>
      <p class="text-sm mt-3 mb-0">
        Need an account?
        <router-link class="text-dark font-weight-bolder" :to="{ name: registerRoute }"
          >Register</router-link
        >
      </p>
    </card>
    </div> 
  </template>

    <script lang="ts">
      import { Component, Vue, Ref } from 'vue-property-decorator';
      import { ValidationProvider, ValidationObserver } from 'vee-validate';
      import { userModule, UserState, AuthStatus } from '../store';
      import Card from '@finley/vue2-components/src/components/card.vue';
      import { State } from 'vuex-class';
      import { messages } from '../resources/messages';
      import { RouteNames } from '../router';
      import NotificationList from '@finley/vue2-components/src/components/notification-list.vue';

      @Component({
        components: {
          ValidationProvider,
          ValidationObserver,
          Card,
          NotificationList,
        },
      })
      export default class Login extends Vue {
        @Ref() readonly formObserver!: InstanceType<typeof ValidationObserver>;
        @Ref() readonly emailElement!: HTMLInputElement;

        email = '';
        password = '';
        registerRoute = RouteNames.Register;

        @State('User') state!: UserState;

        mounted() {
          this.emailElement?.focus();
        }

        async onSubmit() {
          const isValid = await this.formObserver.validate();
          if (isValid) {
            userModule.login({
              email: this.email,
              password: this.password,
            });
          }
        }

        get loggingIn() {
          return this.state.authStatus === AuthStatus.LoggingIn;
        }

        get messages() {
          return messages;
        }
      }
    </script>

    <style lang="scss"></style>
  </div>
</template>
