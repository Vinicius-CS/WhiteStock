<template>
    <v-dialog
        max-width="40rem"
        min-width="20rem"
        persistent
    >
        <v-card class="cardIndex d-flex flex-column">
            <v-layout class="cardIndexHeader d-flex flex-column">
                <v-card-title style="text-align: center">
                    <h2>Estoque do Produto</h2>
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
                            v-model="stock"
                            label="Quantidade"
                            hide-details
                            type="number"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.stockError }}</div>

                        <div class="stockMessage">Quantidade Atual: {{ parseInt(Number.isInteger(parseInt(this.data.stock)) ? this.data.stock : 0) }}</div>
                        <div class="stockMessage">Quantidade Total: {{ parseInt(Number.isInteger(parseInt(this.data.stock)) ? this.data.stock : 0) + parseInt(Number.isInteger(parseInt(this.stock)) ? this.stock : 0) }}</div>
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
        name: 'OrderComponent',
  
        props: {
            show: Boolean,
            data: Array,
            type: String
        },
  
        data: () => ({
            id            : undefined,
            stock         : undefined,

            response      : undefined,
            changeDisabled: true,
    
            stockError: undefined
        }),
  
        watch: {
            show () {
                if (this.show && (this.type == 'view' || this.type == 'edit')) {
                    this.response = this.data;
                    this.id       = this.data.id;
                    this.stock    = this.data.stock;
                }

                this.stockError = undefined;
            },

            stock () {
                this.stockCheck();
            }
        },
  
        methods: {
            closeDialog () {
                this.id    = undefined;
                this.stock = undefined;

                this.$emit('close');
            },
    
            stockCheck () {
                this.stockError = undefined;
                if (this.stock == 0) this.stockError = 'A quantidade deve ser maior ou menor que 0';
                if (!this.stock) this.stockError = 'Insira a quantidade que você deseja acrescentar ou remover no estoque';
                if (parseInt(Number.isInteger(parseInt(this.data.stock)) ? this.data.stock : 0) + parseInt(Number.isInteger(parseInt(this.stock)) ? this.stock : 0) < 0) this.stockError = 'A quantidade total não pode ser negativa';
                this.changeCheck();
            },

            changeCheck () {
                if (this.type != 'edit') return;
                if (this.response.stock != this.stock) {
                    this.changeDisabled = false;
                } else {
                    this.changeDisabled = true;
                }
            },

            register () {
                const axios = require('axios').default;
                this.nameCheck();
                this.descriptionCheck();

                var dataProduct = undefined;

                if (!this.stockError) {
                    dataProduct = {
                        id   : this.id,
                        stock: this.stock
                    };
                    
                    axios.post(`${Config.API_URL}/${this.type == 'add' ? 'insert' : 'update'}/product/stock`, require('qs').stringify(dataProduct), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
                        if (response.status == 200) {
                            this.$root.messageShow(`O estoque do produto <b>${this.name}</b> foi ${this.type == 'add' ? 'cadastrado' : 'atualizado'}`, 'green')
                            this.closeDialog();
                        }

                    }).catch(err => {
                        if (err.message) {
                            console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
                            this.$root.messageShow(`Ocorreu um erro ao ${this.type == 'add' ? 'inserir o estoque' : 'atualizar o estoque do'} produto <b>${this.name}</b>`, 'red');
                        }
                    });

                }
            }
        }
    }
</script>