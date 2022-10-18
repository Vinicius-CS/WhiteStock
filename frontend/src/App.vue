<template>
  <v-app class="default">
    <v-main>
      <IndexPage v-if="this.$route.name == 'index'"/>
      <MenuComponent v-if="this.$route.name != 'index'"/>
    </v-main>
    <FooterComponent/>
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
