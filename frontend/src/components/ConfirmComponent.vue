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
          <h2>{{ title }}</h2>
        </v-card-title>
        <v-icon
          style="position: absolute; right: 1rem; top: 25%;"
          @click="closeDialog"
          large
        >
          mdi-close-circle
        </v-icon>
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
            @click="yesDialog"
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

    data: () => ({
      show: false,
    }),
    
    props: {
      value: Boolean,
      title: String,
      text : String,
      textLoading: String,
    },

    methods: {
      closeDialog () {
        this.$emit('close');
      },

      yesDialog () {
        this.$emit('yes');
      },
    }
  }
</script>