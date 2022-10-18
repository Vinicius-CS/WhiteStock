<template>
  <v-container v-if="this.$route.name != 'index'">
    <v-card style="z-index: 1;">
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
        style="background-color: #2D2D2D; color: #FFFFFF;"
      >
        <v-list-item
          prepend-avatar="https://i.imgur.com/fibx3wL.png"
          title="User"
          nav
        >
          <template v-slot:append>
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item v-for="(item, key) in items" :key="key" :prepend-icon="item.icon" :title="item.title" :value="item.value" :to="item.to"></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block class="btn">
              Sair
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
    </v-card>
    <router-view></router-view>
  </v-container>
</template>

<style>
  @import '@/assets/styles.css';
</style>

<script>
  export default {
    name: 'MenuComponent',

    data: () => ({
      drawer: true,
      rail  : false,

      items: [
        {
          title: 'Início',
          value: 'home',
          icon: 'mdi-home',
          to: '/panel'
        },
        {
          title: 'Colaboradores',
          value: 'collaborator',
          icon: 'mdi-account-multiple',
          to: '/panel/collaborator'
        },
        {
          title: 'Produtos',
          value: 'product',
          icon: 'mdi-package-variant-closed',
          to: '/panel/product'
        },
        {
          title: 'Categorias de Produtos',
          value: 'product-category',
          icon: 'mdi-clipboard-text',
          to: '/panel/product-category'
        },
        {
          title: 'Empresa',
          value: 'company',
          icon: 'mdi-office-building',
          to: '/panel/company'
        },
        {
          title: 'Subsidiárias',
          value: 'subsidiary',
          icon: 'mdi-store',
          to: '/panel/subsidiary'
        },
        {
          title: 'Minha Conta',
          value: 'account',
          icon: 'mdi-account',
          to: '/panel/account'
        },
      ],
    }),
  }
</script>