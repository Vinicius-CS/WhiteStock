<template>
  <v-dialog
    v-model="show"
    max-width="40rem"
    min-width="20rem"
    persistent
  >
    <v-card
      class="cardIndex d-flex flex-column"
    >
      <v-layout class="cardIndexHeader d-flex flex-column">
        <v-card-title style="text-align: center">
          <h2>Login</h2>
        </v-card-title>
        <v-icon
          style="position: absolute; right: 1rem; top: 25%"
          @click="closeDialog"
          large
        >
          mdi-close-circle
        </v-icon>
      </v-layout>

      <v-card-text>
        <v-form
          ref="form"
        >
          <v-text-field
            v-model="email"
            label="E-Mail"
            type="email"
            prepend-icon="mdi-account"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Senha"
            type="password"
            prepend-icon="mdi-lock"
          ></v-text-field>

          <div class="text-right">
            <v-btn
            class="btn btn_hover_1"
            append-icon="mdi-chevron-double-right"
            >
            Entrar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style>
  @import '@/assets/styles.css';
</style>

<script>
  export default {
    name: 'LoginComponent',

    data: () => ({
      show    : false,
      email   : '',
      password: ''
    }),
    
    props: {
      value: Boolean
    },

    methods: {
      closeDialog () {
        this.$emit('close');
        this.email    = '';
        this.password = '';
      },
    },
  }
</script>