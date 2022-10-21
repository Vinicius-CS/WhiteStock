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

      <v-snackbar
        v-model="errorSnackbar.model"
        :timeout="5000"
        color="red"
        elevation="24"
      >
        {{ errorSnackbar.message }}
      </v-snackbar>

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
      show    : false,
      email   : '',
      password: '',

      errorSnackbar: {
        model  : false,
        message: ''
      },
    }),
    
    props: {
      value       : Boolean
    },

    methods: {
      closeDialog () {
        this.$emit('close');
        this.email        = '';
        this.password     = '';
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
              router.push('/panel');
            } else {
              this.errorSnackbar.message = 'Ocorreu um erro ao entrar, tente novamente mais tarde';
              this.errorSnackbar.model = true;
              console.log(response);
            }

          }).catch(err => {
            if (err.message) {
              this.errorSnackbar.message = 'Ocorreu um erro ao entrar, tente novamente mais tarde';
              
              if (err.response.data.message == 'Invalid Account') this.errorSnackbar.message = 'E-mail ou senha inválidos';

              this.errorSnackbar.model = true;
              console.log(err);
            }
          });
        } else {
          this.errorSnackbar.message = 'Verifique os campos';
          this.errorSnackbar.model = true;
        }
      }
    },
  }
</script>