<template>
  <v-dialog
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

      <v-snackbar
        v-model="errorSnackbar.model"
        :timeout="5000"
        color="red"
        elevation="24"
      >
        <div v-html="errorSnackbar.message"></div>
      </v-snackbar>

      <v-card-text>
        <v-form
          ref="form"
        >
          <v-text-field
            v-model="email"
            label="E-Mail"
            type="email"
            @input="this.email = this.email.toLowerCase()"
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
            @click="login"
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
  import Config from '@/assets/config.json';
  import router from '@/router';

  export default {
    name: 'LoginComponent',

    data: () => ({
      email   : undefined,
      password: undefined,

      errorSnackbar: {
        model  : false,
        message: undefined
      },
    }),

    methods: {
      closeDialog () {
        this.$emit('close');
        this.email    = undefined;
        this.password = undefined;
      },

      login () {
        if (this.email && this.password) {
          const axios = require('axios').default;
          var data = require('qs').stringify({
            email   : this.email,
            password: this.password
          });

          axios.post(`${Config.API_URL}/login`, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(response => {
            if (response.status == 200 && response.data.message == 'Authenticated') {
              this.closeDialog();
              this.$store.commit('setToken', response.data.token);
              router.push('/panel');

            }

          }).catch(err => {
            if (err.message) {
              this.errorSnackbar.message = `Ocorreu um erro ao entrar`;
              
              if (err.response.data.message == 'Invalid Account') this.errorSnackbar.message = 'E-mail ou senha inválidos';
              if (err.response.data.message == 'Disabled Account') this.errorSnackbar.message = 'Esta conta está desabilitada';

              this.errorSnackbar.model = true;
              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
            }
          });
        } else {
          this.errorSnackbar.message = 'Preencha todos os campos';
          this.errorSnackbar.model = true;
        }
      }
    },
  }
</script>