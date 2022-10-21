<template>
  <v-dialog
    v-model="show"
    max-width="40rem"
    min-width="20rem"
    persistent
  >
    <v-card
      class="cardIndex d-flex flex-column"
    >
      <v-layout class="cardIndexHeader d-flex flex-column">
        <v-card-title style="text-align: center">
          <h2>Assinatura</h2>
        </v-card-title>
        <v-icon
          style="position: absolute; right: 1rem; top: 25%"
          @click="closeDialog"
          large
        >
          mdi-close-circle
        </v-icon>
      </v-layout>

      <v-snackbar
        v-model="errorSnackbar.model"
        :timeout="5000"
        color="red"
        elevation="24"
      >
        {{ errorSnackbar.message }}
      </v-snackbar>

      <v-card-text>
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <div v-if="step">
            <v-text-field
              v-model="nameCompany"
              label="Nome da Empresa"
              hide-details
            ></v-text-field>
            <div class="errorMessage">{{ this.nameCompanyError }}</div>

            <v-text-field
              v-model="addressCompany"
              label="Endereço da Matriz"
              hide-details
            ></v-text-field>
            <div class="errorMessage">{{ this.addressCompanyError }}</div>

            <v-text-field
              v-model="cnpj"
              label="CPNJ"
              hide-details
              v-mask="'##.###.###/000#-##'"
            ></v-text-field>
            <div class="errorMessage">{{ this.cnpjError }}</div>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="email"
                  label="E-Mail"
                  hide-details
                  type="email"
                ></v-text-field>
                <div class="errorMessage">{{ this.emailError }}</div>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="password"
                  label="Senha"
                  hide-details
                  type="password"
                ></v-text-field>
                <div class="errorMessage">{{ this.passwordError }}</div>
              </v-col>
            </v-row>
          </div>

          <div v-else>
            <v-text-field
              v-model="cardNumber"
              label="Número do Cartão"
              hide-details
              v-mask="'#### #### #### ####'"
            ></v-text-field>
            <div class="errorMessage">{{ this.cardNumberError }}</div>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="cvv"
                  label="CVV"
                  hide-details
                  v-mask="'###'"
                ></v-text-field>
                <div class="errorMessage">{{ this.cvvError }}</div>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="expirateDate"
                  label="Data de Expiração"
                  hide-details
                  maxlength="5"
                  @input="expirateDateFormat(this.expirateDate)"
                ></v-text-field>
                <div class="errorMessage">{{ this.expirateDateError }}</div>
              </v-col>
            </v-row>

            <v-text-field
              v-model="cardName"
              label="Nome Completo do Titular"
              hide-details
            ></v-text-field>
            <div class="errorMessage">{{ this.cardNameError }}</div>
          </div>

          <div class="text-right">
            <v-btn
              v-if="this.step"
              class="btn btn_hover_1"
              append-icon="mdi-chevron-double-right"
              @click="register"
            >
              Próximo
            </v-btn>

            <v-btn
              v-else
              class="btn btn_hover_1"
              append-icon="mdi-chevron-double-left"
              @click="this.step = true"
            >
              Anterior
            </v-btn>

            <v-btn
              v-if="!this.step"
              class="btn btn_hover_1"
              append-icon="mdi-chevron-double-right"
              @click="register"
            >
              Assinar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style>
  @import '@/assets/styles.css';
</style>

<script>
  import Config from '@/assets/config.json';

  export default {
    name: 'RegisterComponent',

    props: {
      value          : Boolean,
      id             : String,
      title          : String,
      item           : Object,
      priceMonth     : String,
      priceMonthYear : String,
      priceYear      : String,
      discountYear   : String,
      discountActive : Boolean
    },

    data: () => ({
      step          : true,
      show          : false,
      nameCompany   : '',
      addressCompany: '',
      cnpj          : '',
      email         : '',
      password      : '',
      cardNumber    : '',
      cvv           : '',
      expirateDate  : '',
      cardName      : '',

      errorSnackbar: {
        model  : false,
        message: ''
      },

      nameCompanyError    : '',
      addressCompanyError : '',
      cnpjError           : '',
      emailError          : '',
      passwordError       : '',
      cardNumberError     : '',
      cvvError            : '',
      expirateDateError   : '',
      cardNameError       : '',
    }),

    watch: {
      nameCompany (value) {
        this.nameCompanyError = '';
        if (!value) this.nameCompanyError = 'Insira o nome da empresa';
      },

      addressCompany (value) {
        this.addressCompanyError = '';
        if (!value) this.addressCompanyError = 'Insira o endereço da matriz';
      },

      cnpj (value) {
        this.cnpjError = '';
        if (!value) {
          this.cnpjError = 'Insira o CNPJ';

        } else if (value.length < 18) {
          this.cnpjError = 'CNPJ inválido';
        }
      },

      email (value) {
        this.emailError = '';
        if (!value) {
          this.emailError = 'Insira o e-mail';

        } else if (!value.match(/^[a-z0-9-_.]+@[a-z0-9]+\.[a-z]+/i)) {
          this.emailError = 'E-mail inválido';
        }
      },

      password (value) {
        this.passwordError = '';
        if (!value) {
          this.passwordError = 'Insira a senha';

        } else if (value.length < 4) {
          this.passwordError = 'Senha muito curta, insira ao menos 4 caracteres';
        }
      },

      cardNumber (value) {
        this.cardNumberError = '';
        if (!value) {
          this.cardNumberError = 'Insira o número do cartão';

        } else if (value.length < 19) {
          this.cardNumberError = 'Número do cartão inválido';
        }
      },

      cvv (value) {
        this.cvvError = '';
        if (!value) {
          this.cvvError = 'Insira o CVV';

        } else if (value.length < 3) {
          this.cvvError = 'CVV inválido';
        }
      },

      expirateDate (value) {
        this.expirateDateError = '';
        if (!value) {
          this.expirateDateError = 'Insira a data de expiração';

        } else if (value.length < 5) {
          this.expirateDateError = 'Data de expiração inválido';
        }
      },

      cardName (value) {
        this.cardNameError = '';
        if (!value) this.cardNameError = 'Insira o nome completo do titular';
      }
    },

    methods: {
      closeDialog () {
        this.$emit('close');
        this.step           = true;
        this.nameCompany    = '';
        this.addressCompany = '';
        this.cnpj           = '';
        this.email          = '';
        this.password       = '';
        this.cardNumber     = '';
        this.cvv            = '';
        this.expirateDate   = '';
        this.cardName       = '';

        this.errorMessage        = '';
        this.nameCompanyError    = '';
        this.addressCompanyError = '';
        this.cnpjError           = '';
        this.emailError          = '';
        this.passwordError       = '';
        this.cardNumberError     = '';
        this.cvvError            = '';
        this.expirateDateError   = '';
        this.cardNameError       = '';
      },

      expirateDateFormat (value) {
        var currentYear = new Date().getFullYear().toString();

        if (value.length < 3 && (value.match(/(\d{1})/g) > 3 || value.match(/[/]/g) == '/')) {
          value = 0 + value;

        } else if (value.length < 3 && value.match(/(\d{2})/g) > 31) {
          value = value.replace(/(\d{1}$)/g, '');

        } else if (value.length > 2 && (value.match(/(\d{1})/g)[2] < currentYear.match(/(\d{1})/g)[2] || value.match(/(\d{2})/g)[1] < currentYear.match(/(\d{2})$/g))) {
          value = value.replace(/(\d{1}$)/g, '');
        }

        value = value.replace(/(\d{2})(\d{1})/g, "$1/$2");
        this.expirateDate = value;
      },

      nameCompanyCheck () {
        this.nameCompanyError = '';
        if (!this.nameCompany) this.nameCompanyError = 'Insira o nome da empresa';
      },

      addressCompanyCheck () {
        this.addressCompanyError = '';
        if (!this.addressCompany) this.addressCompanyError = 'Insira o endereço da matriz';
      },

      cnpjCheck () {
        this.cnpjError = '';
        if (!this.cnpj) {
          this.cnpjError = 'Insira o CNPJ';

        } else if (this.cnpj.length < 18) {
          this.cnpjError = 'CNPJ inválido';
        }
      },

      emailCheck () {
        this.emailError = '';
        if (!this.email) {
          this.emailError = 'Insira o e-mail';

        } else if (!this.email.match(/^[a-z0-9-_.]+@[a-z0-9]+\.[a-z]+/i)) {
          this.emailError = 'E-mail inválido';
        }
      },

      passwordCheck () {
        this.passwordError = '';
        if (!this.password) {
          this.passwordError = 'Insira a senha';

        } else if (this.password.length < 4) {
          this.passwordError = 'Senha muito curta, insira ao menos 4 caracteres';
        }
      },

      cardNumberCheck () {
        this.cardNumberError = '';
        if (!this.cardNumber) {
          this.cardNumberError = 'Insira o número do cartão';

        } else if (this.cardNumber.length < 19) {
          this.cardNumberError = 'Número do cartão inválido';
        }
      },

      cvvCheck () {
        this.cvvError = '';
        if (!this.cvv) {
          this.cvvError = 'Insira o CVV';

        } else if (this.cvv.length < 3) {
          this.cvvError = 'CVV inválido';
        }
      },

      expirateDateCheck () {
        this.expirateDateError = '';
        if (!this.expirateDate) {
          this.expirateDateError = 'Insira a data de expiração';

        } else if (this.expirateDate.length < 5) {
          this.expirateDateError = 'Data de expiração inválido';
        }
      },

      cardNameCheck () {
        this.cardNameError = '';
        if (!this.cardName) this.cardNameError = 'Insira o nome completo do titular';
      },

      register () {
        if(this.step) {
          this.nameCompanyCheck();
          this.addressCompanyCheck();
          this.cnpjCheck();
          this.emailCheck();
          this.passwordCheck();

          if (!this.nameCompanyError && !this.addressCompanyError && !this.cnpjError && !this.emailError && !this.passwordError) {
            this.step = false;
          }

        } else {
          this.cardNumberCheck();
          this.cvvCheck();
          this.expirateDateCheck();
          this.cardNameCheck();

          if (!this.cardNumberError && !this.cvvError && !this.expirateDateError && !this.cardNameError) {
            const axios = require('axios').default;
            var data = require('qs').stringify({
              email       : this.email,
              password    : this.password,
              cnpj        : this.cnpj,
              name        : this.nameCompany,
              address     : this.addressCompany,
              plan        : this.id,
              payment_type: this.discountActive ? 'year' : 'month'
            });

            axios.post(`${Config.API_URL}/register`, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(response => {
              if (response.status == 200) {
                this.$emit('login', 'Empresa registrada com sucesso', 'green');
                this.$emit('close');
              } else {
                this.errorSnackbar.message = 'Ocorreu um erro ao se cadastrar, tente novamente mais tarde';
                this.errorSnackbar.model = true;
                console.log(response);
              }

            }).catch(err => {
              if (err.message) {
                this.errorSnackbar.message = 'Ocorreu um erro ao se cadastrar, tente novamente mais tarde';
              
                if (err.response.data.message == 'Invalid Data') this.errorSnackbar.message = 'Verifique os campos';

                this.errorSnackbar.model = true;
                console.log(err);
              }
            });
          }
        }
      }
    },
  }
</script>