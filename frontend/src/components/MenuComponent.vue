<template>
    <v-container v-if="this.$route.name == 'panel'">
        <v-card>
            <v-navigation-drawer
            v-model="drawer"
            :rail="rail"
            permanent
            @click="rail = false"
            >
            <v-list-item
                prepend-avatar="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png"
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
            </v-navigation-drawer>
            <v-main></v-main>
        </v-card>
        <router-view></router-view>
    </v-container>
  </template>

<script>

export default {
  name: 'MenuComponent',

  data: () => ({
    drawer: true,
    rail: false,
    items: [
      { title: 'Início', value: 'home', icon: 'mdi-home-city', to: '/panel' },
      { title: 'My Account', value: 'account', icon: 'mdi-account', to:'helloworld' },
      { title: 'Users', value: 'users', icon: 'mdi-account-group-outline', to: 'none' },
    ],
  }),
}
</script>