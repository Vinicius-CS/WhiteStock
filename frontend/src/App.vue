<template>
  <v-app>
    <v-main>
      <IndexPage/>
      <MenuComponent/>
      <FooterComponent/>
    </v-main>
  </v-app>
</template>

<script>
  import IndexPage from '@/views/Index.vue'
  import FooterComponent from '@/components/FooterComponent.vue'
  import MenuComponent from '@/components/MenuComponent.vue'

  export default {
    name: 'App',

    components: {
      IndexPage,
      FooterComponent,
      MenuComponent
    },

    data: () => ({
      //
    }),
  }
</script>
