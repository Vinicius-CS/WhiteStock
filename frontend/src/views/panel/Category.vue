<template>
  <v-container class="content">
    <v-layout class="header d-flex flex-column">
      <div style="text-align: center">
        <h3>Categorias</h3>
      </div>
      <v-btn
        v-if="this.$store.getters.hasPermission('category', 'add')"
        style="position: absolute; right: 1rem;"
        class="btn btn_hover_1"
        @click="typeComponent = 'add'; showCategoryComponent = true"
      >
        Nova Categoria
      </v-btn>
    </v-layout>

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
              Descrição
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
            <td>{{ item.description }}</td>
            <td>{{ item.enabled == 'true' ? 'Sim' : 'Não' }}</td>
            <td>
              <v-btn
                v-if="this.$store.getters.hasPermission('category', 'view')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-eye"
                color="grey"
                @click="this.dataComponent = item; typeComponent = 'view'; showCategoryComponent = true"
              ></v-btn>
              <v-btn
                v-if="this.$store.getters.hasPermission('category', 'edit')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-pencil"
                color="grey"
                @click="this.dataComponent = item; typeComponent = 'edit'; showCategoryComponent = true"
              ></v-btn>
              <v-btn
                v-if="this.$store.getters.hasPermission('category', 'delete')"
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
        Nenhuma categoria encontrada
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

      <ConfirmComponent v-model="showConfirmComponent" @close="showConfirmComponent = false" @confirm="deleteThis(this.deleteThisData); showConfirmComponent = false;" title="Exclusão de Categoria" :text='"Tem certeza que deseja excluir a categoria <b>" + this.deleteThisData.name + "</b>?"'/>
      <CategoryComponent v-model="showCategoryComponent" @close="this.showCategoryComponent = false; listThis()" :show="this.showCategoryComponent" :data="this.dataComponent" :type="this.typeComponent"/>
    </div>
  </v-container>
</template>
    
  <script>
    import router from '@/router';
    import Config from '@/assets/config.json';
    import ConfirmComponent from '@/components/ConfirmComponent.vue';
    import CategoryComponent from '@/components/CategoryComponent.vue';

    export default {
      name: 'CategoryPanel',

      components: {
        ConfirmComponent,
        CategoryComponent
      },
  
      data: () => ({
        page                 : 1,
        lengthPage           : 1,
        perPage              : 15,
        showConfirmComponent : false,
        showCategoryComponent: false,

        dataComponent: [],
        typeComponent: undefined,

        dataAll  : [],
        tableData: [],

        deleteThisData: {
          name: null
        }
      }),

      methods: {
        async deleteThis (item) {
          const axios = require('axios').default;
          var data = require('qs').stringify({
            id: item.id,
          });

          await axios.post(`${Config.API_URL}/delete/category`, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.$root.messageShow(`A categoria <b>${item.name}</b> foi excluída`, 'green');
              this.dataAll.splice(this.dataAll.findIndex(value => value.id == item.id), 1);
              this.tableAjust();
            }

          }).catch(err => {
            if (err.message) {
              var message = `Ocorreu um erro ao axcluir a categoria <b>${item.name}</b>`;
              if (err.response.data.code == 1451) message = `Não é possível excluir, a categoria <b>${item.name}</b> está em uso`;

              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
              this.$root.messageShow(message, 'red');
            }
          });
        },

        async listThis () {
          const axios = require('axios').default;

          await axios.get(`${Config.API_URL}/list/category`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.dataAll = response.data;
              this.tableAjust();
            }

          }).catch(err => {
            if (err.message) {
              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
              this.$root.messageShow(`Ocorreu um erro ao listar as categorias`, 'red');
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
        }
      },
      
      beforeMount () {
        if (this.$store.getters.hasPermission('category', 'view')) {
          this.listThis();

        } else {
          router.push('/panel');
        }
      }
    }
  </script>
    