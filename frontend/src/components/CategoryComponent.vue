<template>
    <v-dialog
        max-width="40rem"
        min-width="20rem"
        persistent
    >
        <v-card class="cardIndex d-flex flex-column">
            <v-layout class="cardIndexHeader d-flex flex-column">
                <v-card-title style="text-align: center">
                    <h2 v-if="this.type == 'add'">Cadastrar Categoria</h2>
                    <h2 v-else-if="this.type == 'edit'">Editar Categoria</h2>
                    <h2 v-else>Categoria</h2>

                    <h3 v-if="this.type == 'add' || this.type == 'edit'">Dados da Categoria</h3>
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
                    <div>
                        <v-text-field
                            v-model="name"
                            label="Nome"
                            hide-details
                            @input="this.name = this.name.toUpperCase()"
                            :readonly="this.type == 'view' ? true : false"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.nameError }}</div>
            
                        <v-textarea
                            v-model="description"
                            label="Descrição"
                            no-resize
                            hide-details
                            :readonly="this.type == 'view' ? true : false"
                        ></v-textarea>
                        <div class="errorMessage">{{ this.descriptionError }}</div>

                        <v-select
                            v-model="enabled"
                            label="Habilitado"
                            :items="itemEnabled"
                            item-title="value"
                            item-value="key"
                            :readonly="this.type == 'view' ? true : false"
                        ></v-select>
                    </div>

                    <div class="text-right">
                        <v-btn
                            v-if="(this.type == 'add' || this.type == 'edit')"
                            class="btn btn_hover_0"
                            append-icon="mdi-chevron-double-right"
                            @click="register"
                            :disabled="this.type == 'edit' ? this.changeDisabled : false"
                        >
                            {{ this.type == 'add' ? 'Inserir' : 'Salvar' }}
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
        name: 'CategoryComponent',
  
        props: {
            show: Boolean,
            data: Array,
            type: String
        },
  
        data: () => ({
            id            : undefined,
            name          : undefined,
            description   : undefined,
            photo         : undefined,
            enabled       : 'true',

            response      : undefined,
            changeDisabled: false,

            itemEnabled: [
                { key: 'true', value: 'Sim' },
                { key: 'false', value: 'Não' }
            ],
    
            nameError       : undefined,
            descriptionError: undefined,
            photoError      : undefined
        }),
  
        watch: {
            show () {
                if (this.show && (this.type == 'view' || this.type == 'edit')) {
                    this.response    = this.data;
                    this.id          = this.data.id;
                    this.name        = this.data.name;
                    this.description = this.data.description;
                    this.enabled     = this.data.enabled;
                }

                this.nameError        = undefined;
                this.descriptionError = undefined;
                this.photoError       = undefined;
            },

            name () {
                if (this.type == 'view') return '';
                this.nameCheck();
            },
  
            description () {
                if (this.type == 'view') return '';
                this.descriptionCheck();
            },

            enabled () {
                this.changeCheck();
            }
        },
  
        methods: {
            closeDialog () {
                this.id          = undefined;
                this.name        = undefined;
                this.description = undefined;
                this.photo       = undefined;
                this.enabled     = 'true';

                this.$emit('close');
            },
    
            nameCheck () {
                this.nameError = undefined;
                if (!this.name) this.nameError = 'Insira o nome do produto';
                this.changeCheck();
            },

            descriptionCheck () {
                this.descriptionError = undefined;
                if (!this.description) {
                    this.descriptionError = 'Insira a descrição do produto';
                } else if (this.description.length < 5) {
                    this.descriptionError = 'Descrição muito curta, insira pelo menos 5 caracteres';
                } else if (this.description.length > 50) {
                    this.descriptionError = 'Descrição muito grande, insira até 50 caracteres';
                }
                this.changeCheck();
            },

            changeCheck () {
                if (this.type != 'edit') return;
                if (this.response.name != this.name || this.response.description != this.description || this.response.enabled != this.enabled) {
                    this.changeDisabled = false;
                } else {
                    this.changeDisabled = true;
                }
            },

            register () {
                const axios = require('axios').default;
                this.nameCheck();
                this.descriptionCheck();

                var dataCategory = undefined;

                if (!this.nameError && !this.descriptionError) {
                    dataCategory = {
                        id         : this.id,
                        name       : this.name,
                        description: this.description,
                        enabled    : this.enabled
                    };
                    
                    axios.post(`${Config.API_URL}/${this.type == 'add' ? 'insert' : 'update'}/category`, require('qs').stringify(dataCategory), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
                        if (response.status == 200) {
                            this.$root.messageShow(`A categoria <b>${this.name}</b> foi ${this.type == 'add' ? 'cadastrada' : 'atualizada'}`, 'green');
                            this.$emit('list');
                            this.closeDialog();
                        }

                    }).catch(err => {
                        if (err.message) {
                            console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
                            this.$root.messageShow(`Ocorreu um erro ao ${this.type == 'add' ? 'inserir a' : 'atualizar os dados da'} categoria <b>${this.name}</b>`, 'red');
                        }
                    });

                }
            }
        },
    }
</script>