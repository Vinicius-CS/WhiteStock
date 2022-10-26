<template>
  <v-container class="content">
    <v-layout class="header d-flex flex-column">
      <div style="text-align: center">
        <h3>Colaboradores</h3>
      </div>
      <v-btn
      style="position: absolute; right: 1rem;"
        class="btn btn_hover_1"
        @click="step = false"
      >
        Novo Colaborador
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
      <v-table class="table" v-if="!this.dataAll">
        <thead class="tableHeader">
          <tr>
            <th class="text-center">
              ID
            </th>
            <th class="text-center">
              Nome
            </th>
            <th class="text-center">
              E-Mail
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
            <td>{{ item.email }}</td>
            <td>{{ item.enabled == 'true' ? 'Sim' : 'Não' }}</td>
            <td>
              <v-btn
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-eye"
                color="grey"
              ></v-btn>
              <v-btn
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-pencil"
                color="grey"
              ></v-btn>
              <v-btn
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
        Nenhum colaborador encontrado
      </div>

      <div class="text-center" style="padding-top: 1rem;" v-if="!this.dataAll">
        <v-pagination
          @click="tableAjust"
          v-model="page"
          rounded="circle"
          :total-visible="5"
          :length="2"
        ></v-pagination>
      </div>

      <ConfirmComponent v-model="showConfirmComponent" @close="showConfirmComponent = false" @yes="deleteThis(this.deleteThisData); showConfirmComponent = false;" title="Exclusão de Colaborador" :text='"Tem certeza que deseja excluir o colaborador <b>" + this.deleteThisData.name + "</b>?"' textLoading="Excluindo, aguarde..."/>
    </div>
  </v-container>
</template>
    
  <script>
    import Config from '@/assets/config.json';
    import ConfirmComponent from '@/components/ConfirmComponent.vue'

    export default {
      name: 'CollaboratorPanel',

      components: {
        ConfirmComponent
      },
  
      data: () => ({
        page: 1,

        showConfirmComponent: false,

        dataAll  : [],
        tableData: [],

        messageSnackbar: {
          model  : false,
          color  : 'black',
          message: '',
          timeout: 5000
        },

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

          await axios.post(`${Config.API_URL}/delete/collaborator`, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.messageSnackbar.message = `O colaborador <b>${item.name}</b> foi excluído`;
              this.messageSnackbar.color = 'green';
              this.messageSnackbar.model = true;

              this.dataAll.splice(this.dataAll.findIndex(value => value.id == item.id), 1);
              this.tableAjust();
            }

          }).catch(err => {
            if (err.message) {
              var message = `Ocorreu um erro ao excluir o colaborador <b>${item.name}</b>, tente novamente mais tarde`;
              console.log(err);
              this.messageShow(message, 'red');
            }
          });
        },

        async listThis () {
          const axios = require('axios').default;

          await axios.get(`${Config.API_URL}/collaborator`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.dataAll = response.data;
            }

          }).catch(err => {
            if (err.message) {
              var message = 'Ocorreu um erro ao listar os colaboradores, tente novamente mais tarde';
              console.log(err);
              this.messageShow(message, 'red');
            }
          });

          this.tableAjust();
        },

        tableAjust () {
          let itemIndex = (this.page * 5) - 5;
          let j = itemIndex < 1 ? 5 : itemIndex * 2;
          let z = this.dataAll.length - itemIndex;

          this.tableData = [];
          for (let i = itemIndex; i < j && z > 0; i++, z--) {
            this.tableData.push(this.dataAll[i]);
          }
        },

        messageShow (message, color) {
          this.messageSnackbar.model = true;
          this.messageSnackbar.message = message;
          this.messageSnackbar.color = color;
        }
      },
      
      mounted () {
        this.listThis();
      }
    }
  </script>
    