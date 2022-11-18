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
                    style="position: absolute; right: 1rem; top: 25%;"
                    @click="closeDialog"
                    large
                    >
                    mdi-close-circle
                </v-icon>
            </v-layout>
  
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
                            :readonly="this.type == 'view' ? true : false"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.nameError }}</div>
            
                        <v-text-field
                            v-model="cpf"
                            label="CPF"
                            hide-details
                            v-mask="'###.###.###-##'"
                            :readonly="this.type == 'view' ? true : false"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.cpfError }}</div>

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

                        <v-row no-gutters>
                            <v-col cols="6">
                                <v-select
                                    style="padding-right: 0.5rem"
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
                            <v-col cols="6">
                                <v-select
                                    style="padding-left: 0.5rem"
                                    v-model="enabled"
                                    label="Habilitado"
                                    :items="itemEnabled"
                                    item-title="value"
                                    item-value="key"
                                    :readonly="this.type == 'view' ? true : false"
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
                            :readonly="this.type == 'view' ? true : false"
                        ></v-select>

                        <v-select
                            v-model="product"
                            label="Produto"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                            :readonly="this.type == 'view' ? true : false"
                        ></v-select>

                        <v-select
                            v-model="category"
                            label="Categoria"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                            :readonly="this.type == 'view' ? true : false"
                        ></v-select>

                        <v-select
                            v-model="company"
                            label="Empresa"
                            :items="itemPermission"
                            item-title="value"
                            item-value="key"
                            chips
                            multiple
                            :readonly="this.type == 'view' ? true : false"
                        ></v-select>
                    </div>

                    <div class="text-right">
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
                            v-if="(this.type == 'add' || this.type == 'edit') && !this.step"
                            class="btn btn_hover_0"
                            append-icon="mdi-chevron-double-right"
                            @click="register"
                            :disabled="this.type == 'edit' ? this.changeDisabled : false"
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
            name    : undefined,
            email   : undefined,
            password: undefined,
            cpf     : undefined,
            gender  : undefined,
            photo   : undefined,
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
    
            nameError    : undefined,
            emailError   : undefined,
            passwordError: undefined,
            cpfError     : undefined,
            genderError  : undefined,
            photoError   : undefined
        }),
  
        watch: {
            show () {
                if (this.show && (this.type == 'view' || this.type == 'edit')) {
                    this.response = this.data;
                    this.id       = this.data.id;
                    this.name     = this.data.name;
                    this.email    = this.data.email;
                    this.password = undefined;
                    this.cpf      = this.data.cpf;
                    this.gender   = this.data.gender;
                    this.enabled  = this.data.enabled;

                    var permission = null;

                    try {
                        permission = JSON.parse(this.data.permission);
                    } catch (e) {
                        permission = this.data.permission;
                    }

                    if (permission['collaborator']['view'] == 1) this.collaborator.push('view');
                    if (permission['collaborator']['add'] == 1) this.collaborator.push('add');
                    if (permission['collaborator']['edit'] == 1) this.collaborator.push('edit');
                    if (permission['collaborator']['delete'] == 1) this.collaborator.push('delete');

                    if (permission['product']['view'] == 1) this.product.push('view');
                    if (permission['product']['add'] == 1) this.product.push('add');
                    if (permission['product']['edit'] == 1) this.product.push('edit');
                    if (permission['product']['delete'] == 1) this.product.push('delete');

                    if (permission['category']['view'] == 1) this.category.push('view');
                    if (permission['category']['add'] == 1) this.category.push('add');
                    if (permission['category']['edit'] == 1) this.category.push('edit');
                    if (permission['category']['delete'] == 1) this.category.push('delete');

                    if (permission['company']['view'] == 1) this.company.push('view');
                    if (permission['company']['add'] == 1) this.company.push('add');
                    if (permission['company']['edit'] == 1) this.company.push('edit');
                    if (permission['company']['delete'] == 1) this.company.push('delete');

                    this.response.permission = permission;
                }

                this.password = this.type == 'add' ? (Math.random() + 1).toString(36).substring(6) : undefined;

                this.errorMessage  = undefined;
                this.nameError     = undefined;
                this.emailError    = undefined;
                this.passwordError = undefined;
                this.cpfError      = undefined;
                this.genderError   = undefined;
            },

            name () {
                if (this.type == 'view') return '';
                this.nameCheck();
            },

            email () {
                if (this.type == 'view') return '';
                this.emailCheck();
            },
  
            password () {
                if (this.type == 'view') return '';
                this.passwordCheck();
            },

            cpf () {
                if (this.type == 'view') return '';
                this.cpfCheck();
            },

            gender () {
                if (this.type == 'view') return '';
                this.genderCheck();
            },

            enabled () {
                this.changeCheck();
            },

            collaborator () {
                this.changeCheck();
            },

            product () {
                this.changeCheck();
            },

            category () {
                this.changeCheck();
            },

            company () {
                this.changeCheck();
            }
        },
  
        methods: {
            closeDialog () {
                this.step     = true;
                this.id       = undefined;
                this.name     = undefined;
                this.email    = undefined;
                this.password = (Math.random() + 1).toString(36).substring(6);
                this.cpf      = undefined;
                this.gender   = undefined;
                this.enabled  = 'true';

                this.collaborator = [];
                this.product      = [];
                this.category     = [];
                this.company      = [];
                this.permission   = [];

                this.$emit('close');
            },

            nameCheck () {
                this.nameError = undefined;
                if (!this.name) this.nameError = 'Insira o nome completo do colaborador';
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
                if (this.type == 'add' && !this.password) {
                    this.passwordError = 'Insira a senha';
        
                } else if (this.type == 'add' && this.password != undefined && this.password.length < 6) {
                    this.passwordError = 'Senha muito curta, insira ao menos 6 caracteres';
                } else if (this.password != undefined && this.password.length > 0 && this.password.length < 6) {
                    this.passwordError = 'Senha muito curta, insira ao menos 6 caracteres';
                }
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

            changeCheck () {
                if (this.type != 'edit') return;
                
                const permission           = {};
                permission['collaborator'] = {};
                permission['product']      = {};
                permission['category']     = {};
                permission['company']      = {};

                this.itemPermission.forEach(item => {
                    if (this.collaborator.filter(permission => permission == item.key)[0] == undefined) {
                        permission['collaborator'][item.key] = "0";
                    } else {
                        permission['collaborator'][item.key] = "1";
                    }

                    if (this.product.filter(permission => permission == item.key)[0] == undefined) {
                        permission['product'][item.key] = "0";
                    } else {
                        permission['product'][item.key] = "1";
                    }

                    if (this.category.filter(permission => permission == item.key)[0] == undefined) {
                        permission['category'][item.key] = "0";
                    } else {
                        permission['category'][item.key] = "1";
                    }

                    if (this.company.filter(permission => permission == item.key)[0] == undefined) {
                        permission['company'][item.key] = "0";
                    } else {
                        permission['company'][item.key] = "1";
                    }
                });

                
                if (this.response.name != this.name || this.response.email != this.email || (this.password != undefined && this.password.length > 0) || this.response.cpf != this.cpf.replace(/[^0-9]/g, '') || this.response.gender != this.gender || this.response.enabled != this.enabled || JSON.stringify(this.response.permission) != JSON.stringify(permission)) {
                    this.changeDisabled = false;
                } else {
                    this.changeDisabled = true;
                }
            },
    
            register () {
                const axios                = require('axios').default;
                const permission           = [];
                permission['collaborator'] = [];
                permission['product']      = [];
                permission['category']     = [];
                permission['company']      = [];

                var dataCollaborator = undefined;
                    if (this.step) {
                        this.nameCheck();
                        this.emailCheck();
                        this.passwordCheck();
                        this.cpfCheck();
                        this.genderCheck();

                        if (!this.nameError && !this.emailError && !this.passwordError && !this.cpfError && !this.genderError) {
                            this.step = false;
                        }

                    } else {
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

                        dataCollaborator = {
                            id        : this.id,
                            name      : this.name,
                            email     : this.email,
                            password  : this.password,
                            cpf       : this.cpf.replace(/[^0-9]/gm, ''),
                            gender    : this.gender,
                            enabled   : this.enabled,
                            permission: permission
                        };
                        
                        axios.post(`${Config.API_URL}/${this.type == 'add' ? 'insert' : 'update'}/collaborator`, require('qs').stringify(dataCollaborator), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
                            if (response.status == 200) {
                                this.$root.messageShow(`${this.gender == 'male' ? `O colaborador <b>${this.name}</b> foi ${this.type == 'add' ? 'cadastrado' : 'atualizado'}` : `A colaboradora <b>${this.name}</b> foi ${this.type == 'add' ? 'cadastrada' : 'atualizada'}`}`, 'green');
                                this.$emit('list');
                                this.closeDialog();
                            }

                        }).catch(err => {
                            if (err.message) {
                                var message = `Ocorreu um erro ao ${this.type == 'add' ? 'cadastrar' : 'atualizar'} ${this.gender == 'male' ? 'o colaborador' : 'a colaboradora'} <b>${this.name}</b>`;
                                if (err.response.data.message == 'Invalid Data') message = 'Verifique os campos';
                                if (err.response.data.code == 1062) message = `E-mail ou CNPJ em uso`;

                                console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
                                this.$root.messageShow(message, 'red');
                            }
                        });

                    }
            }
        },
    }
</script>