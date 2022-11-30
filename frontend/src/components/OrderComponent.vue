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
                            @keypress="isNumber($event)"
                        ></v-text-field>
                        <div class="errorMessage">{{ this.stockError }}</div>

                        <div class="stockMessage">Quantidade Atual: {{ parseInt(Number.isInteger(parseInt(this.data.product_amount)) ? this.data.product_amount : 0) }}</div>
                        <div class="stockMessage">Quantidade Total: {{ this.stockError && this.stockError == 'Insira apenas números ou um único hífen (-) no início para repesentar a retirada de produtos' ? (this.data.product_amount ?? 0) : parseInt(Number.isInteger(parseInt(this.data.product_amount)) ? this.data.product_amount : 0) + parseInt(Number.isInteger(parseInt(this.stock)) ? this.stock : 0) }}</div>
                    </div>

                    <div class="text-right">
                        <v-btn
                            v-if="(this.type == 'add' || this.type == 'edit')"
                            class="btn btn_hover_0"
                            append-icon="mdi-chevron-double-right"
                            @click="register"
                            :disabled="this.changeDisabled"
                        >
                            {{ 'Salvar' }}
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

            changeDisabled: true,
    
            stockError: undefined
        }),
  
        watch: {
            show () {
                this.stockError = undefined;
            },

            stock () {
                this.stockCheck();
            }
        },
  
        methods: {
            isNumber: function(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 45) {
                    evt.preventDefault();
                } else {
                    return true;
                }
            },

            closeDialog () {
                this.id    = undefined;
                this.stock = undefined;

                this.$emit('close');
            },
    
            stockCheck () {
                this.stockError = undefined;

                if (this.stock && this.stock.match(/(.-)|(-{2,})/gm)) this.stockError = 'Insira apenas números ou um único hífen (-) no início para repesentar a retirada de produtos';
                if (this.stock == 0) this.stockError = 'A quantidade deve ser maior ou menor que 0';
                if (!this.stock) this.stockError = 'Insira a quantidade que você deseja acrescentar ou remover no estoque';
                if (parseInt(Number.isInteger(parseInt(this.data.product_amount)) ? this.data.product_amount : 0) + parseInt(Number.isInteger(parseInt(this.stock)) ? this.stock : 0) < 0) this.stockError = 'A quantidade total não pode ser negativa, você não possui estoque suficiente';
                this.changeCheck();
            },

            changeCheck () {
                if (this.stock) {
                    this.changeDisabled = false;
                } else {
                    this.changeDisabled = true;
                }
            },

            register () {
                const axios = require('axios').default;
                this.stockCheck();
                this.changeCheck();

                var dataProduct = undefined;

                if (!this.stockError) {
                    dataProduct = {
                        id   : this.data.id,
                        stock: this.stock
                    };
                    
                    axios.post(`${Config.API_URL}/${this.type == 'add' ? 'insert' : 'update'}/product/stock`, require('qs').stringify(dataProduct), {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
                        if (response.status == 200) {
                            this.$root.messageShow(`O estoque do produto <b>${this.data.name}</b> foi atualizado`, 'green')
                            this.closeDialog();
                        }

                    }).catch(err => {
                        if (err.message) {
                            console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
                            this.$root.messageShow(`Ocorreu um erro ao atualizar o estoque do produto <b>${this.data.name}</b>`, 'red');
                        }
                    });

                }
            }
        }
    }
</script>