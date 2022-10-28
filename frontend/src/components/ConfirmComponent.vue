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
          <h2>{{ title }}</h2>
        </v-card-title>
      </v-layout>

      <v-card-text>
        <div class="text-center" v-html="text"></div>
        <div class="text-right">
          <v-btn
            class="btn btn_hover_red"
            append-icon="mdi-close-thick"
            @click="closeDialog"
            >
            Não
          </v-btn>
          <v-btn
            class="btn btn_hover_green"
            append-icon="mdi-check-bold"
            @click="confirmDialog"
            >
            Sim
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style>
  @import '@/assets/styles.css';
</style>

<script>
  export default {
    name: 'ConfirmComponent',
    
    props: {
      title: String,
      text : String,
      textLoading: String,
    },

    methods: {
      closeDialog () {
        this.$emit('close');
      },

      confirmDialog () {
        this.$emit('confirm');
      },
    }
  }
</script>