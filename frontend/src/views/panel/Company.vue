<template>
  <v-container class="content">
    <v-layout class="header d-flex flex-column">
      <div style="text-align: center">
        <h3>Empresa</h3>
      </div>
    </v-layout>

    <v-divider color="grey" style="margin-top: 1rem"></v-divider>

    <v-card-text>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <div>
          <v-text-field
            v-model="nameCompany"
            label="Nome da Empresa"
            hide-details
            @input="this.nameCompany = this.nameCompany.toUpperCase()"
            :readonly="!this.$store.getters.hasPermission('company', 'edit')"
          ></v-text-field>
          <div class="errorMessage">{{ this.nameCompanyError }}</div>

          <v-text-field
            v-model="addressCompany"
            label="Endereço da Matriz"
            hide-details
            @input="this.addressCompany = this.addressCompany.toUpperCase()"
            :readonly="!this.$store.getters.hasPermission('company', 'edit')"
          ></v-text-field>
          <div class="errorMessage">{{ this.addressCompanyError }}</div>

          <v-text-field
            v-model="cnpj"
            label="CPNJ"
            hide-details
            v-mask="'##.###.###/000#-##'"
            :readonly="!this.$store.getters.hasPermission('company', 'edit')"
          ></v-text-field>
          <div class="errorMessage">{{ this.cnpjError }}</div>
        </div>

        <div class="text-right" v-if="this.$store.getters.hasPermission('company', 'edit')">
          <v-btn
            class="btn btn_hover_0"
            append-icon="mdi-chevron-double-right"
            @click="register"
            :disabled="this.changeDisabled"
          >
            Salvar
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-container>
</template>
    
  <script>
    import router from '@/router';
    import Config from '@/assets/config.json';

    export default {
      name: 'CompanyPanel',
  
      data: () => ({
        nameCompany   : undefined,
        addressCompany: undefined,
        cnpj          : undefined,
        email         : undefined,

        response      : undefined,
        changeDisabled: true,
      }),

      watch: {
        nameCompany () {
          this.nameCompanyCheck();
        },

        addressCompany () {
          this.addressCompanyCheck();
        },

        cnpj () {
          this.cnpjCheck();
        },
      },

      methods: {
        nameCompanyCheck () {
          this.nameCompanyError = undefined;
          if (!this.nameCompany) this.nameCompanyError = 'Insira o nome da empresa';
          this.changeCheck();
        },

        addressCompanyCheck () {
          this.addressCompanyError = undefined;
          if (!this.addressCompany) this.addressCompanyError = 'Insira o endereço da matriz';
          this.changeCheck();
        },

        cnpjCheck () {
          this.cnpjError = undefined;
          if (!this.cnpj) {
            this.cnpjError = 'Insira o CNPJ';

          } else if (this.cnpj.length < 18) {
            this.cnpjError = 'CNPJ inválido';
          }
          this.changeCheck();
        },

        changeCheck () {
          if (this.response.name != this.nameCompany || this.response.address != this.addressCompany || this.response.cnpj != this.cnpj) {
            this.changeDisabled = false;
          } else {
            this.changeDisabled = true;
          }
        },

        async listThis () {
          const axios = require('axios').default;

          await axios.get(`${Config.API_URL}/list/company`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.response       = response.data[0];
              this.nameCompany    = response.data[0].name;
              this.addressCompany = response.data[0].address;
              this.cnpj           = response.data[0].cnpj;
              this.email          = response.data[0].email;
            }

          }).catch(err => {
            if (err.message) {
              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
              this.$root.messageShow(`Ocorreu um erro ao listar as informações da empresa <b>${this.nameCompany}</b>`, 'red');
            }
          });
        },

        register () {
          const axios = require('axios').default;
          this.nameCompanyCheck();
          this.addressCompanyCheck();
          this.cnpjCheck();

          var dataCompany = undefined;

          if (!this.nameCompanyError && !this.addressCompanyError && !this.cnpjError) {
            dataCompany = {
              name   : this.nameCompany,
              address: this.addressCompany,
              cnpj   : this.cnpj
            };
            
            axios.post(`${Config.API_URL}/update/company`, require('qs').stringify(dataCompany), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
              if (response.status == 200) {
                this.listThis();
              }

            }).catch(err => {
              if (err.message) {
                var message = `Ocorreu um erro ao salvar as alterações da empresa <b>${this.nameCompany}</b>`;
                if (err.response.data.code == 1062) message = `CNPJ em uso`;

                console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
                this.$root.messageShow(message, 'red');
              }
            });

          }
        }
      },
      
      beforeMount () {
        if (this.$store.getters.hasPermission('company', 'view')) {
          this.listThis();

        } else {
          router.push('/panel');
        }
      }
    }
  </script>
    