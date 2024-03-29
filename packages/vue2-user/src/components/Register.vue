<template>
  <card
    :headerText="headerText"
    :show-close="false"
    style="height: 90vh"
    max-width="600px"
    padding="2"
  >
    <p class="text-center" v-if="registered">{{ messages.Registration.Registered.message }}</p>
    <div v-if="notRegistered">
      <ValidationObserver ref="formObserver">
        <form @submit.prevent="onSubmit" autocomplete="off" role="form text-left">
          <div class="mb-3">
            <ValidationProvider
              name="firstName"
              rules="required"
              mode="passive"
              v-slot="{ errors }"
            >
              <input
                type="text"
                :class="['form-control', { 'is-invalid': errors[0] }]"
                placeholder="First Name"
                aria-label="First Name"
                ref="firstNameElement"
                v-model="firstName"
                :disabled="registering"
              />
              <div v-show="errors[0]" class="invalid-feedback">
                {{ errors[0] }}
              </div>
            </ValidationProvider>
          </div>
          <div class="mb-3">
            <ValidationProvider
              name="lastName"
              rules="required"
              mode="passive"
              v-slot="{ errors }"
            >
              <input
                type="text"
                :class="['form-control', { 'is-invalid': errors[0] }]"
                placeholder="Last Name"
                aria-label="Last Name"
                v-model="lastName"
                :disabled="registering"
              />
              <div v-show="errors[0]" class="invalid-feedback">
                {{ errors[0] }}
              </div>
            </ValidationProvider>
          </div>
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
                :disabled="registering"
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
              :disabled="registering"
            >
              <span
                v-if="registering"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Sign up
            </button>
          </div>
        </form>
      </ValidationObserver>
    </div>
    <p class="text-sm mt-3 mb-0">
      Already have an account?
      <router-link class="text-dark font-weight-bolder" :to="{ name: loginRoute }"
        >Login</router-link
      >
    </p>
  </card>
</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { registrationModule, RegistrationState, RegistrationStatus } from '../store';
import Card from '@finley/vue2-components/src/components/card.vue';
import { State } from 'vuex-class';
import { messages } from '../resources/messages';
import { RouteNames } from '../router';

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
    Card,
  },
})
export default class Register extends Vue {
  @Ref() readonly formObserver!: InstanceType<typeof ValidationObserver>;
  @Ref() readonly firstNameElement!: HTMLInputElement;

  firstName = '';
  lastName = '';
  email = '';
  loginRoute = RouteNames.Login;

  @State('Registration') state!: RegistrationState;

  mounted() {
    this.firstNameElement?.focus();
  }

  get headerText() {
    return this.registered
      ? messages.Registration.Registered.header
      : 'Join the Waitlist';
  }
  async onSubmit() {
    const isValid = await this.formObserver.validate();
    if (isValid) {
      registrationModule.register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
      });
    }
  }

  get registering() {
    return this.state.status === RegistrationStatus.Registering;
  }

  get registered() {
    return this.state.status === RegistrationStatus.Registered;
  }

  get notRegistered() {
    return this.state.status !== RegistrationStatus.Registered;
  }

  get messages() {
    return messages;
  }
}
</script>

<style lang="scss"></style>
