<template>
  <v-container class="content">
    <v-layout class="header d-flex flex-column">
      <div style="text-align: center">
        <h3>Produtos</h3>
      </div>
      <v-btn
        v-if="this.$store.getters.hasPermission('product', 'add')"
        style="position: absolute; right: 1rem;"
        class="btn btn_hover_1"
        @click="typeComponent = 'add'; showProductComponent = true"
      >
        Novo Produto
      </v-btn>
    </v-layout>

    <v-snackbar
      v-model="messageSnackbar.model"
      :timeout="messageSnackbar.timeout"
      :color="messageSnackbar.color"
      elevation="24"
    >
      <div v-html="messageSnackbar.message"></div>
    </v-snackbar>

    <v-divider color="grey" style="margin-top: 1rem"></v-divider>

    <div>
      <v-table class="table" v-if="this.dataAll.length > 0">
        <thead class="tableHeader">
          <tr>
            <th class="text-center">
              ID
            </th>
            <th class="text-center">
              Nome
            </th>
            <th class="text-center">
              Categoria do Produto
            </th>
            <th class="text-center">
              Descrição
            </th>
            <th class="text-center">
              Quantidade em Estoque
            </th>
            <th class="text-center">
              Habilitado
            </th>
            <th class="text-center">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="tableData">
          <tr
            v-for="item in tableData"
            :key="item.id"
          >
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category_name }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.stock }}</td>
            <td>{{ item.enabled == 'true' ? 'Sim' : 'Não' }}</td>
            <td>
              <v-btn
                v-if="this.$store.getters.hasPermission('product', 'view')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-eye"
                color="grey"
                @click="this.dataComponent = item; typeComponent = 'view'; showProductComponent = true"
              ></v-btn>
              <v-btn
                v-if="this.$store.getters.hasPermission('product', 'edit')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-pencil"
                color="grey"
                @click="this.dataComponent = item; typeComponent = 'edit'; showProductComponent = true"
              ></v-btn>
              <v-btn
                v-if="this.$store.getters.hasPermission('product', 'delete')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-close-thick"
                color="grey"
                @click="deleteThisData = item; showConfirmComponent = true"
              ></v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div style="padding: 1rem; font-size: 24px;" v-else>
        Nenhum produto encontrado
      </div>

      <div class="text-center" style="padding-top: 1rem;" v-if="this.dataAll.length > 0">
        <v-pagination
          @click="tableAjust"
          v-model="page"
          rounded="circle"
          :total-visible="5"
          :length="lengthPage"
        ></v-pagination>
      </div>

      <ConfirmComponent v-model="showConfirmComponent" @close="showConfirmComponent = false" @confirm="deleteThis(this.deleteThisData); showConfirmComponent = false;" title="Exclusão de Produto" :text='"Tem certeza que deseja excluir o produto <b>" + this.deleteThisData.name + "</b>?"'/>
      <ProductComponent v-model="showProductComponent" @close="actionThis" :show="this.showProductComponent" :data="this.dataComponent" :type="this.typeComponent"/>
    </div>
  </v-container>
</template>
    
  <script>
    import router from '@/router';
    import Config from '@/assets/config.json';
    import ConfirmComponent from '@/components/ConfirmComponent.vue';
    import ProductComponent from '@/components/ProductComponent.vue';

    export default {
      name: 'ProductPanel',

      components: {
        ConfirmComponent,
        ProductComponent
      },
  
      data: () => ({
        permission: {
          view   : 0,
          add    : 0,
          edit   : 0,
          delete : 0
        },

        page                     : 1,
        lengthPage               : 1,
        perPage                  : 15,
        showConfirmComponent     : false,
        showProductComponent     : false,

        dataComponent: [],
        typeComponent: undefined,


        dataAll  : [],
        tableData: [],

        messageSnackbar: {
          model  : false,
          color  : 'black',
          message: undefined,
          timeout: 5000
        },

        deleteThisData: {
          name: null
        }
      }),

      methods: {
        actionThis (value = null, item = null) {
          if (value == 'inserted') {
            this.showProductComponent = false;
            this.messageSnackbar.message = `O produto <b>${item.name}</b> foi cadastrado`;
            this.messageSnackbar.color = 'green';
            this.messageSnackbar.model = true;
            this.listThis();
            
          } else if (value == 'updated') {
            this.showProductComponent = false;
            this.messageSnackbar.message = `O produto <b>${item.name}</b> foi atualizado`;
            this.messageSnackbar.color = 'green';
            this.messageSnackbar.model = true;
            this.listThis();
            
          } else {
            this.showProductComponent = false;
          }
        },

        async deleteThis (item) {
          const axios = require('axios').default;
          var data = require('qs').stringify({
            id: item.id,
          });

          await axios.post(`${Config.API_URL}/delete/product`, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.messageSnackbar.message = `O produto <b>${item.name}</b> foi excluído`;
              this.messageSnackbar.color = 'green';
              this.messageSnackbar.model = true;

              this.dataAll.splice(this.dataAll.findIndex(value => value.id == item.id), 1);
              this.tableAjust();
            }

          }).catch(err => {
            if (err.message) {
              console.log(err);
              this.messageShow(err.response.data.data.message, 'red');
            }
          });
        },

        async listThis () {
          const axios = require('axios').default;

          await axios.get(`${Config.API_URL}/list/product`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.dataAll = response.data;
              this.tableAjust();
            }

          }).catch(err => {
            if (err.message) {
              console.log(err);
              this.messageShow(err.response.data.data.message, 'red');
            }
          });

          this.tableAjust();
        },

        tableAjust () {
          this.lengthPage = 1;
          let itemIndex = (this.page * this.perPage) - this.perPage;
          let j = itemIndex < 1 ? this.perPage : itemIndex * 2;
          let z = this.dataAll.length - itemIndex;
          
          while ((this.perPage * this.lengthPage) < this.dataAll.length) {
            this.lengthPage++;
          }


          this.tableData = [];
          for (let i = itemIndex; i < j && z > 0; i++, z--) {
            this.tableData.push(this.dataAll[i]);
          }
        },

        messageShow (message, color) {
          this.messageSnackbar.model   = true;
          this.messageSnackbar.message = message;
          this.messageSnackbar.color   = color;
        }
      },
      
      beforeMount () {
        if (this.$store.getters.hasPermission('product', 'view')) {
          this.permission = this.$store.state.permission;
          this.listThis();

        } else {
          router.push('/panel');
        }
      }
    }
  </script>
    