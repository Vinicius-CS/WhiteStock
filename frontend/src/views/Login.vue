<template>
    <v-container>
      <v-card
        class="cardLogin d-flex flex-column"
      >
        <v-card-title>
          <h2 >Login</h2>
        </v-card-title>

        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
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

            <v-col class="text-right">
              <v-btn
              class="btn btn_hover_1"
              append-icon="mdi-chevron-double-right"
              >
              Entrar
              </v-btn>
            </v-col>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>
</template>

<style>
  @import '@/assets/styles.css';
</style>

<script>
export default {
  name: 'LoginPage',

  data: () => ({
    email: '',
    password: '',
  }),
}
</script>