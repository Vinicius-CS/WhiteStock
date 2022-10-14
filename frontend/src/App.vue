<template>
  <v-app>
    <v-main>
      <IndexPage/>
      <MenuComponent/>
    </v-main>
  </v-app>
</template>

<script>
import IndexPage from '@/views/Index.vue'
import MenuComponent from '@/components/MenuComponent.vue'

export default {
  name: 'App',

  components: {
    MenuComponent,
    IndexPage
  },

  data: () => ({
    //
  }),
}
</script>
