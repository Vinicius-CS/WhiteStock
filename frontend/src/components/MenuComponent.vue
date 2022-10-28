<template>
  <v-container v-if="this.$store.state.token != null && this.$route.name != 'index'">
    <v-card style="z-index: 1;">
      <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        @click="rail = false"
        style="background-color: #2D2D2D; color: #FFFFFF;"
      >
        <v-list-item
          :prepend-avatar="this.$store.getters.userData.photo ?? 'https://i.imgur.com/fibx3wL.png'"
          :title="this.$store.getters.userData.name"
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
          <div v-for="(item, key) in items" :key="key">
            <v-list-item
              style="margin-bottom: 0.3rem"
              v-if="item.id == undefined || this.$store.getters.hasPermission(item.id, 'view')"
              :prepend-icon="item.icon"
              :title="item.title"
              :value="item.value"
              :to="item.to"
            />
          </div>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn
              v-if="!this.rail"
              block
              prepend-icon="mdi-logout"
              class="btn"
              @click="logout"
            >
              Sair
            </v-btn>

            <v-btn
              v-else
              size="small"
              icon="mdi-logout"
              class="btn"
              @click="logout"
            ></v-btn>
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
  import router from '@/router';
  
  export default {
    name: 'MenuComponent',

    data: () => ({
      drawer: true,
      rail  : false,

      items: [
        {
          title: 'Início',
          value: 'home',
          icon : 'mdi-home',
          to   : '/panel'
        },
        {
          id   : 'collaborator',
          title: 'Colaboradores',
          value: 'collaborator',
          icon : 'mdi-account-multiple',
          to   : '/panel/collaborator'
        },
        {
          id   : 'product',
          title: 'Produtos',
          value: 'product',
          icon : 'mdi-package-variant-closed',
          to   : '/panel/product'
        },
        {
          id   : 'category',
          title: 'Categorias de Produtos',
          value: 'product-category',
          icon : 'mdi-clipboard-text',
          to   : '/panel/product-category'
        },
        {
          id   : 'company',
          title: 'Empresa',
          value: 'company',
          icon : 'mdi-office-building',
          to   : '/panel/company'
        },
        /*{
          id   : 'subsidiary',
          title: 'Subsidiárias',
          value: 'subsidiary',
          icon : 'mdi-store',
          to   : '/panel/subsidiary'
        },*/
        {
          title: 'Minha Conta',
          value: 'account',
          icon : 'mdi-account',
          to   : '/panel/account'
        }
      ],
    }),

    methods: {
      logout() {
        this.$store.commit('removeToken');
        router.push('/');
      },
    },

    mounted () {
      if (this.$store.state.token == null) {
        router.push('/');
      }
    }
  }
</script>