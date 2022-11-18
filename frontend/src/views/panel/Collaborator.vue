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

      <ConfirmComponent v-model="showConfirmComponent" @close="showConfirmComponent = false" @confirm="deleteThis(this.deleteThisData); showConfirmComponent = false;" title="Exclusão de Colaborador" :text='"Tem certeza que deseja excluir o colaborador <b>" + this.deleteThisData.name + "</b>?"'/>
      <CollaboratorComponent v-model="showCollaboratorComponent" @close="this.showCollaboratorComponent = false" @list="listThis()" :show="this.showCollaboratorComponent" :data="this.dataComponent" :type="this.typeComponent"/>
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
        page                     : 1,
        lengthPage               : 1,
        perPage                  : 15,
        showConfirmComponent     : false,
        showCollaboratorComponent: false,

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

          await axios.post(`${Config.API_URL}/delete/collaborator`, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.$root.messageShow(`${this.gender == 'male' ? 'O colaborador' : 'A colaboradora'} <b>${item.name}</b> foi ${this.gender == 'male' ? 'excluído' : 'excluída'}`, 'green');

              this.dataAll.splice(this.dataAll.findIndex(value => value.id == item.id), 1);
              this.tableAjust();
            }

          }).catch(err => {
            if (err.message) {
              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
              this.$root.messageShow(`Ocorreu um erro ao excluir ${item.gender == 'male' ? `o colaborador <b>${item.name}</b>` : `a colaboradora <b>${item.name}</b>`}`, 'red');
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
              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
              this.$root.messageShow(`Ocorreu um erro ao listar os colaboradores`, 'red');
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
        if (this.$store.getters.hasPermission('collaborator', 'view')) {
          this.listThis();

        } else {
          router.push('/panel');
        }
      }
    }
  </script>
    