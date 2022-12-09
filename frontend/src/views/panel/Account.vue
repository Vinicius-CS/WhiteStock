<template>
  <v-container class="content">
    <v-layout class="header d-flex flex-column">
      <div style="text-align: center">
        <h3>Minha Conta</h3>
      </div>
    </v-layout>

    <v-divider color="grey" style="margin-top: 1rem"></v-divider>

    <v-card-text>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <div v-if="(this.$store.getters.userData.company_id != undefined)">
          <v-text-field
            v-model="name"
            label="Nome"
            hide-details
            @input="this.name = this.name.toUpperCase()"
            :readonly="this.type == 'view' ? true : false"
          ></v-text-field>
          <div class="errorMessage">{{ this.nameError }}</div>

          <v-row no-gutters>
            <v-col cols="6">
              <v-text-field
                style="padding-right: 0.5rem"
                v-model="cpf"
                label="CPF"
                hide-details
                v-mask="'###.###.###-##'"
                :readonly="this.type == 'view' ? true : false"
              ></v-text-field>
              <div class="errorMessage">{{ this.cpfError }}</div>
            </v-col>
            <v-col cols="6">
              <v-select
                style="padding-left: 0.5rem"
                v-model="gender"
                label="Gênero"
                hide-details
                :items="itemGender"
                item-title="value"
                item-value="key"
                :readonly="this.type == 'view' ? true : false"
              ></v-select>
              <div class="errorMessage">{{ this.genderError }}</div>
            </v-col>
          </v-row>

          <v-row no-gutters v-if="this.type != 'view'">
            <v-col cols="6">
              <v-text-field
                style="padding-right: 0.5rem"
                v-model="email"
                label="E-Mail"
                hide-details
                type="email"
                @input="this.email = this.email.toLowerCase()"
                :readonly="this.type == 'view' ? true : false"
              ></v-text-field>
              <div class="errorMessage">{{ this.emailError }}</div>
            </v-col>
            <v-col cols="6">
              <v-text-field
                style="padding-left: 0.5rem"
                v-model="password"
                label="Senha"
                hide-details
              ></v-text-field>
              <div class="errorMessage" style="padding-left: 0.5rem">{{ this.passwordError }}</div>
            </v-col>
          </v-row>

          <v-text-field
            v-if="this.type == 'view'"
            v-model="email"
            label="E-Mail"
            hide-details
            type="email"
            @input="this.email = this.email.toLowerCase()"
            :readonly="this.type == 'view' ? true : false"
          ></v-text-field>
          <div class="errorMessage" v-if="this.type == 'view'">{{ this.emailError }}</div>
        </div>

        <div v-else>
          <v-row no-gutters v-if="this.type != 'view'">
            <v-col cols="6">
              <v-text-field
                style="padding-right: 0.5rem"
                v-model="email"
                label="E-Mail"
                hide-details
                type="email"
                @input="this.email = this.email.toLowerCase()"
                :readonly="this.type == 'view' ? true : false"
              ></v-text-field>
              <div class="errorMessage">{{ this.emailError }}</div>
            </v-col>
            <v-col cols="6">
              <v-text-field
                style="padding-left: 0.5rem"
                v-model="password"
                label="Senha"
                hide-details
              ></v-text-field>
              <div class="errorMessage" style="padding-left: 0.5rem">{{ this.passwordError }}</div>
            </v-col>
          </v-row>
        </div>

        <div class="text-right">
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
      name: 'AccountPanel',
  
      data: () => ({
        name    : undefined,
        email   : undefined,
        password: undefined,
        cpf     : undefined,
        gender  : undefined,

        itemGender: [
          { key: 'male', value: 'Masculino' },
          { key: 'female', value: 'Feminino' }
        ],

        response      : undefined,
        changeDisabled: true,
      }),

      watch: {
        name () {
          this.nameCheck();
        },

        cpf () {
          this.cpfCheck();
        },

        gender () {
          this.genderCheck();
        },

        email () {
          this.emailCheck();
        },

        password () {
          this.passwordCheck();
        }
      },

      methods: {
        nameCheck () {
          this.nameError = undefined;
          if (!this.name) this.nameError = 'Insira o nome completo do colaborador';
          this.changeCheck();
        },

        cpfCheck () {
          this.cpfError = undefined;
          if (!this.cpf) {
            this.cpfError = 'Insira o CPF';
  
          } else if (this.cpf.length < 14) {
            this.cpfError = 'CPF inválido';
          }
          this.changeCheck();
        },

        genderCheck () {
          this.genderError = undefined;
          if (!this.gender) this.genderError = 'Selecione o gênero do colaborador';
          this.changeCheck();
        },

        emailCheck () {
          this.emailError = undefined;
          if (!this.email) {
            this.emailError = 'Insira o e-mail do colaborador';
  
          } else if (!this.email.match(/^[a-z0-9-_.]+@[a-z0-9]+\.[a-z]+/i)) {
            this.emailError = 'E-mail inválido';
          }
          this.changeCheck();
        },

        passwordCheck () {
          this.passwordError = undefined;
          if (this.password != undefined && this.password.length > 0 && this.password.length < 6) {
            this.passwordError = 'Senha muito curta, insira ao menos 6 caracteres';
          }
          this.changeCheck();
        },

        changeCheck () {
          if ((!this.$store.getters.userData.company_id && (!this.emailError && !this.passwordError) && (this.response.email != this.email || this.password)) || (this.$store.getters.userData.company_id && (!this.nameError && !this.genderError && !this.cpfError && !this.emailError && !this.passwordError) && (this.response.name != this.name || this.response.gender != this.gender || this.response.cpf != this.cpf || this.response.email != this.email || this.password))) {
            this.changeDisabled = false;
          } else {
            this.changeDisabled = true;
          }
        },

        async listThis () {
          const axios = require('axios').default;

          await axios.get(`${Config.API_URL}/data/${this.$store.getters.userData.company_id ? 'collaborator' : 'company'}`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
            if (response.status == 200) {
              this.response = response.data;
              this.name     = response.data.name ?? '';
              this.gender   = response.data.gender ?? '';
              this.cpf      = response.data.cpf ?? '';
              this.email    = response.data.email;
              this.password = undefined;
            }

          }).catch(err => {
            if (err.message) {
              console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
              this.$root.messageShow(`Ocorreu um erro ao listar as informações ${this.$store.getters.userData.company_id ? (this.$store.getters.userData.gender == 'male' ? 'do coloaborador' : 'da colaboradora') : `da empresa`} <b>${this.$store.getters.userData.name}</b>`, 'red');
            }
          });
        },

        register () {
          const axios = require('axios').default;
          this.nameCheck();
          this.cpfCheck();
          this.genderCheck();
          this.emailCheck();
          this.passwordCheck();

          var data = undefined;

          if ((!this.$store.getters.userData.company_id &&  !this.emailError && !this.passwordError) || (this.$store.getters.userData.company_id && !this.nameError && !this.cpfError && !this.genderError && !this.emailError && !this.passwordError)) {
            if (this.$store.getters.userData.company_id) {
              data = {
                id       : this.$store.getters.userData.id,
                name     : this.name,
                cpf      : this.cpf,
                gender   : this.gender,
                email    : this.email,
                password : this.password,
              };
            } else {
              data = {
                id       : this.$store.getters.userData.id,
                email    : this.email,
                password : this.password,
              };
            }
            
            axios.post(`${Config.API_URL}/update/${this.$store.getters.userData.company_id ? 'collaborator' : 'company'}`, require('qs').stringify(data), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
              if (response.status == 200) {
                this.changeDisabled = true;
                this.$root.messageShow(`As alterações ${this.$store.getters.userData.company_id ? (this.$store.getters.userData.gender == 'male' ? 'do coloaborador' : 'da colaboradora') : `da empresa`} <b>${this.$store.getters.userData.name}</b> foram salvas`, 'green');
                this.listThis();
              }

            }).catch(err => {
              if (err.message) {
                var message = `Ocorreu um erro ao salvar as alterações ${this.$store.getters.userData.company_id ? (this.$store.getters.userData.gender == 'male' ? 'do coloaborador' : 'da colaboradora') : `da empresa`} <b>${this.$store.getters.userData.name}</b>`;
                if (err.response.data.code == 1062) message = `${this.$store.getters.userData.company_id ? `CNPJ` : `CPF`} em uso`;

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
    