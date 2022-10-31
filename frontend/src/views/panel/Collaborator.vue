<template>
  <v-container class="content">
    <v-layout class="header d-flex flex-column">
      <div style="text-align: center">
        <h3>Colaboradores</h3>
      </div>
      <v-btn
        v-if="this.$store.getters.hasPermission('collaborator', 'add')"
        style="position: absolute; right: 1rem;"
        class="btn btn_hover_1"
        @click="typeComponent = 'add'; showCollaboratorComponent = true"
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
              CPF
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
            <td>{{ item.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g,"\$1.\$2.\$3\-\$4") }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.enabled == 'true' ? 'Sim' : 'Não' }}</td>
            <td>
              <v-btn
                v-if="this.$store.getters.hasPermission('collaborator', 'view')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-eye"
                color="grey"
                @click="this.dataComponent = item; typeComponent = 'view'; showCollaboratorComponent = true"
              ></v-btn>
              <v-btn
                v-if="this.$store.getters.hasPermission('collaborator', 'edit')"
                style="margin-left: 0.3rem; margin-right: 0.3rem;"
                size="x-small"
                icon="mdi-pencil"
                color="grey"
                @click="this.dataComponent = item; typeComponent = 'edit'; showCollaboratorComponent = true"
              ></v-btn>
              <v-btn
                v-if="this.$store.getters.hasPermission('collaborator', 'delete')"
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

      <div class="text-center" style="padding-top: 1rem;" v-if="this.dataAll.length > 0">
        <v-pagination
          @click="tableAjust"
          v-model="page"
          rounded="circle"
          :total-visible="5"
          :length="lengthPage"
        ></v-pagination>
      </div>

      <ConfirmComponent v-model="showConfirmComponent" @close="showConfirmComponent = false" @confirm="deleteThis(this.deleteThisData); showConfirmComponent = false;" title="Exclusão de Colaborador" :text='"Tem certeza que deseja excluir o colaborador <b>" + this.deleteThisData.name + "</b>?"' textLoading="Excluindo, aguarde..."/>
      <CollaboratorComponent v-model="showCollaboratorComponent" @close="actionThis" :show="this.showCollaboratorComponent" :data="this.dataComponent" :type="this.typeComponent"/>
    </div>
  </v-container>
</template>
    
  <script>
    import router from '@/router';
    import Config from '@/assets/config.json';
    import ConfirmComponent from '@/components/ConfirmComponent.vue';
    import CollaboratorComponent from '@/components/CollaboratorComponent.vue';

    export default {
      name: 'CollaboratorPanel',

      components: {
        ConfirmComponent,
        CollaboratorComponent
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
        showCollaboratorComponent: false,

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
          if (value == 'registered') {
            this.showCollaboratorComponent = false;
            this.messageSnackbar.message = `O colaborador <b>${item.name}</b> foi cadastrado`;
            this.messageSnackbar.color = 'green';
            this.messageSnackbar.model = true;
            this.listThis();
            
          } else if (value == 'updated') {
            this.showCollaboratorComponent = false;
            this.messageSnackbar.message = `O colaborador <b>${item.name}</b> foi atualizado`;
            this.messageSnackbar.color = 'green';
            this.messageSnackbar.model = true;
            this.listThis();
            
          } else {
            this.showCollaboratorComponent = false;
          }
        },

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

          await axios.get(`${Config.API_URL}/list/collaborator`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.dataAll = response.data;
              this.tableAjust();
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
        if (this.$store.getters.hasPermission('collaborator', 'view')) {
          this.permission = this.$store.state.permission;
          this.listThis();

        } else {
          router.push('/panel');
        }
      }
    }
  </script>
    