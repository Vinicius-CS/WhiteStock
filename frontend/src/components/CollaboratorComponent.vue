<template>
    <v-dialog
        max-width="40rem"
        min-width="20rem"
        persistent
    >
        <v-card class="cardIndex d-flex flex-column">
            <v-layout class="cardIndexHeader d-flex flex-column">
                <v-card-title style="text-align: center">
                    <h2 v-if="this.type == 'add'">Cadastrar Colaborador</h2>
                    <h2 v-else-if="this.type == 'edit'">Editar Colaborador</h2>
                    <h2 v-else>Colaborador</h2>

                    <h3 v-if="this.type == 'add' || this.type == 'edit'">{{ this.step ? 'Dados' : 'Permissões' }} do Colaborador</h3>
                </v-card-title>
                <v-icon
                    v-if="this.type != 'add' && this.type != 'edit'"
                    style="position: absolute; right: 1rem; top: 25%;"
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
                    <div v-if="this.step">
                        <v-text-field
                            v-model="name"
                            label="Nome"
                            hide-details
                            @input="this.name = this.name.toUpperCase()"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.nameError }}</div>
            
                        <v-text-field
                            v-model="cpf"
                            label="CPF"
                            hide-details
                            v-mask="'###.###.###-##'"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.cpfError }}</div>

                        <v-text-field
                            v-model="email"
                            label="E-Mail"
                            hide-details
                            type="email"
                            @input="this.email = this.email.toLowerCase()"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.emailError }}</div>
            
                        <v-text-field
                            v-model="password"
                            label="Senha"
                            hide-details
                        ></v-text-field>
                        <div class="errorMessage">{{ this.passwordError }}</div>

                        <v-row>
                            <v-col>
                                <v-select
                                v-model="gender"
                                label="Gênero"
                                hide-details
                                :items="itemGender"
                                item-title="value"
                                item-value="key"
                                ></v-select>
                                <div class="errorMessage">{{ this.genderError }}</div>
                            </v-col>
                            <v-col>
                                <v-select
                                    v-model="enabled"
                                    label="Habilitado"
                                    :items="itemEnabled"
                                    item-title="value"
                                    item-value="key"
                                ></v-select>
                            </v-col>
                        </v-row>
                    </div>

                    <div v-else>
                        <v-select
                            v-model="collaborator"
                            label="Colaborador"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                        ></v-select>

                        <v-select
                            v-model="product"
                            label="Produto"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                        ></v-select>

                        <v-select
                            v-model="category"
                            label="Categoria"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                        ></v-select>

                        <v-select
                            v-model="company"
                            label="Empresa"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                        ></v-select>
                    </div>

                    <div class="text-right" v-if="this.type == 'add' || this.type == 'edit'">
                        <v-btn
                            class="btn btn_hover_0"
                            append-icon="mdi-close-thick"
                            @click="closeDialog"
                        >
                            Cancelar
                        </v-btn>
                        
                        <v-btn
                            v-if="this.step"
                            class="btn btn_hover_0"
                            append-icon="mdi-chevron-double-right"
                            @click="register"
                        >
                            Próximo
                        </v-btn>

                        <v-btn
                            v-else
                            class="btn btn_hover_0"
                            append-icon="mdi-chevron-double-left"
                            @click="this.step = true"
                        >
                            Anterior
                        </v-btn>

                        <v-btn
                            v-if="!this.step"
                            class="btn btn_hover_0"
                            append-icon="mdi-check-bold"
                            @click="register"
                        >
                            {{ this.type == 'add' ? 'Cadastrar' : 'Salvar' }}
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
        name: 'CollaboratorComponent',
  
        props: {
            show: Boolean,
            data: Array,
            type: String
        },
  
        data: () => ({
            step    : true,
            id      : undefined,
            email   : undefined,
            password: (Math.random() + 1).toString(36).substring(6),
            cpf     : undefined,
            name    : undefined,
            gender  : undefined,
            photo   : undefined,
            role_id : undefined,
            enabled : 'true',

            collaborator: [],
            product     : [],
            category    : [],
            company     : [],
            permission  : [],

            itemGender: [
                { key: 'male', value: 'Masculino' },
                { key: 'female', value: 'Feminino' }
            ],

            itemEnabled: [
                { key: 'true', value: 'Sim' },
                { key: 'false', value: 'Não' }
            ],

            itemPermission: [
                { key: 'view', value: 'Visualizar' },
                { key: 'add', value: 'Adicionar' },
                { key: 'edit', value: 'Editar' },
                { key: 'delete', value: 'Deletar' },
            ],
    
            errorSnackbar: {
                model  : false,
                message: undefined
            },
    
            emailError   : undefined,
            passwordError: undefined,
            cpfError     : undefined,
            nameError    : undefined,
            genderError  : undefined,
            photoError   : undefined
        }),
  
        watch: {
            show () {
                if (this.show && (this.type == 'view' || this.type == 'edit')) {
                    console.log(this.data);
                }

                this.errorMessage  = undefined;
                this.emailError    = undefined;
                this.passwordError = undefined;
                this.cpfError      = undefined;
                this.nameError     = undefined;
                this.genderError   = undefined;
            },

            email () {
                this.emailCheck();
            },
  
            password () {
                this.passwordCheck();
            },

            cpf () {
                this.cpfCheck();
            },
  
            name () {
                this.nameCheck();
            },

            gender () {
                this.genderCheck();
            }
        },
  
        methods: {
            closeDialog () {
                this.$emit('close');

                this.email    = undefined;
                this.password = (Math.random() + 1).toString(36).substring(6);
                this.cpf      = undefined;
                this.name     = undefined;
                this.gender   = undefined;
                this.enabled  = 'true';

                this.collaborator = [];
                this.product      = [];
                this.category     = [];
                this.company      = [];
                this.permission   = [];
            },
    
            emailCheck () {
                this.emailError = undefined;
                if (!this.email) {
                    this.emailError = 'Insira o e-mail do colaborador';
        
                } else if (!this.email.match(/^[a-z0-9-_.]+@[a-z0-9]+\.[a-z]+/i)) {
                    this.emailError = 'E-mail inválido';
                }
            },
    
            passwordCheck () {
                this.passwordError = undefined;
                if (!this.password) {
                    this.passwordError = 'Insira a senha';
        
                } else if (this.password.length < 6) {
                    this.passwordError = 'Senha muito curta, insira ao menos 6 caracteres';
                }
            },

            cpfCheck () {
                this.cpfError = undefined;
                if (!this.cpf) {
                    this.cpfError = 'Insira o CPF';
        
                } else if (this.cpf.length < 14) {
                    this.cpfError = 'CPF inválido';
                }
            },
    
            nameCheck () {
                this.nameError = undefined;
                if (!this.name) this.nameError = 'Insira o nome completo do colaborador';
            },

            genderCheck () {
                this.genderError = undefined;
                if (!this.gender) this.genderError = 'Selecione o gênero do colaborador';
            },
    
            register () {
                if (this.step) {
                    this.emailCheck();
                    this.passwordCheck();
                    this.cpfCheck();
                    this.nameCheck();
                    this.genderCheck();

                    if (!this.emailError && !this.passwordError && !this.cpfError && !this.nameError && !this.genderError) {
                        this.step = false;
                    }

                } else {
                    const axios                = require('axios').default;
                    const permission           = [];
                    permission['collaborator'] = [];
                    permission['product']      = [];
                    permission['category']     = [];
                    permission['company']      = [];

                    this.itemPermission.forEach(item => {
                        if (this.collaborator.filter(permission => permission == item.key)[0] == undefined) {
                            permission['collaborator'][item.key] = 0;
                        } else {
                            permission['collaborator'][item.key] = 1;
                        }

                        if (this.product.filter(permission => permission == item.key)[0] == undefined) {
                            permission['product'][item.key] = 0;
                        } else {
                            permission['product'][item.key] = 1;
                        }

                        if (this.category.filter(permission => permission == item.key)[0] == undefined) {
                            permission['category'][item.key] = 0;
                        } else {
                            permission['category'][item.key] = 1;
                        }

                        if (this.company.filter(permission => permission == item.key)[0] == undefined) {
                            permission['company'][item.key] = 0;
                        } else {
                            permission['company'][item.key] = 1;
                        }
                    });

                    var dataCollaborator = {
                        email       : this.email,
                        password    : this.password,
                        cpf         : this.cpf.replace(/[^0-9]/gm, ''),
                        name        : this.name,
                        gender      : this.gender,
                        enabled     : this.enabled,
                        permission  : permission
                    };
                    
                    axios.post(`${Config.API_URL}/register/collaborator`, require('qs').stringify(dataCollaborator), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
                        if (response.status == 200) {
                            this.email    = undefined;
                            this.password = (Math.random() + 1).toString(36).substring(6);
                            this.cpf      = undefined;
                            this.name     = undefined;
                            this.gender   = undefined;
                            this.enabled  = 'true';

                            this.collaborator = [];
                            this.product      = [];
                            this.category     = [];
                            this.company      = [];
                            this.permission   = [];
                            
                            this.$emit('close', 'registered', dataCollaborator);
                        }

                    }).catch(err => {
                        if (err.message) {
                            this.errorSnackbar.message = 'Ocorreu um erro ao se cadastrar, tente novamente mais tarde';

                            if (err.response.data.code == 'ER_DUP_ENTRY') this.errorSnackbar.message = 'CPF ou e-mail já existe';
                        
                            if (err.response.data.message == 'Invalid Data') this.errorSnackbar.message = 'Verifique os campos';

                            this.errorSnackbar.model = true;
                            console.log(err);
                        }
                    });
                }
            }
        },
    }
</script>