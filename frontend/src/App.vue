<template>
  <v-app class="default">
    <v-main>
      <v-snackbar
        v-model="messageSnackbar.model"
        :timeout="messageSnackbar.timeout"
        :color="messageSnackbar.color"
        elevation="24"
      >
        <div v-html="messageSnackbar.message"></div>
      </v-snackbar>

      <IndexPage/>
      <MenuComponent/>
    </v-main>
    
    <FooterComponent/>
  </v-app>
</template>

<script>
  import IndexPage from '@/views/Index.vue';
  import FooterComponent from '@/components/FooterComponent.vue';
  import MenuComponent from '@/components/MenuComponent.vue';

  export default {
    name: 'App',

    components: {
      IndexPage,
      FooterComponent,
      MenuComponent
    },

    data: () => ({
      messageSnackbar: {
        model  : false,
        color  : 'black',
        message: undefined,
        timeout: 5000
      },
    }),

    methods: {
      messageShow (message, color) {
        this.messageSnackbar.message = message;
        this.messageSnackbar.color   = color;
        this.messageSnackbar.model   = true;
      }
    }
  }
</script>
