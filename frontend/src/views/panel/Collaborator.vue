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

        <v-divider color="grey" style="margin-top: 1rem"></v-divider>

        <div>
            <v-table class="table">
                <thead class="tableHeader">
                    <tr>
                        <th class="text-center">
                            ID
                        </th>
                        <th class="text-center">
                            Nome
                        </th>
                        <th class="text-center">
                            Função
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
                        <td>{{ item.role }}</td>
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
                            ></v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
            <div class="text-center" style="padding-top: 1rem;">
                <v-pagination
                    @click="tableAjust"
                    v-model="page"
                    rounded="circle"
                    :total-visible="6"
                    :length="2"
                ></v-pagination>
            </div>
        </div>
    </v-container>
  </template>
    
  <script>
    export default {
      name: 'CollaboratorPanel',
  
      data: () => ({
        page: 1,

        tableData : [],
        desserts: [
          {
            id: 1,
            name: 'Nome da Primeira Pessoa',
            role: 'Diretor Geral'
          },
          {
            id: 2,
            name: 'Nome da Segunda Pessoa',
            role: 'Diretor de Operações'
          },
          {
            id: 3,
            name: 'Nome da Terceira Pessoa',
            role: 'Diretor de Marketing'
          },
          {
            id: 4,
            name: 'Nome da Quarta Pessoa',
            role: 'Operador de Estoque'
          },
          {
            id: 5,
            name: 'Nome da Quinta Pessoa',
            role: 'Operador de Estoque'
          },
          {
            id: 6,
            name: 'Nome da Sexta Pessoa',
            role: 'Operador de Estoque'
          },
          {
            id: 7,
            name: 'Nome da Setima Pessoa',
            role: 'Operador de Estoque'
          },
          {
            id: 8,
            name: 'Nome da Oitava Pessoa',
            role: 'Gerenciamento de Estoque'
          },
          {
            id: 9,
            name: 'Nome da Nona Pessoa',
            role: 'Gerenciamento de Estoque'
          },
          {
            id: 10,
            name: 'Nome da Décima Pessoa',
            role: 'Gerenciamento de Estoque'
          }
        ],
      }),

      methods: {
        tableAjust () {
            let itemIndex = (this.page * 5) - 5;
            let j = itemIndex < 1 ? 5 : itemIndex * 2;
            
            this.tableData = [];
            for (let i = itemIndex; i < j; i++) {
                this.tableData.push(this.desserts[i]);
            }
        }
      }
    }
  </script>
    