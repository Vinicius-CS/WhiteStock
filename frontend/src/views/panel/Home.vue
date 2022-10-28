<template>
  <v-container>
    <v-row class="text-center">

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Bem vindo(a) à White Stock
        </h1>
      </v-col>

    </v-row>

    <v-row>
      <v-col sm="4">
        <v-card
          class="cardHomePanel"
        >
          <v-card-title>
            <h2>Produtos em Estoque</h2>
          </v-card-title>

          <v-card-text>
            <v-btn
              variant="outlined"
              size="x-large"
              icon
              color="white"
            >
              <h2>100</h2>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>
  export default {
    name: 'HomePanel'
  }
</script>
  