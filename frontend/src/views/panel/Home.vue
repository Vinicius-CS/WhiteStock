<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          BEM VIND{{this.$store.getters.userData.gender == 'male' ? 'O' : this.$store.getters.userData.gender == 'female' ? 'A' : 'O(A)'}} À <span style="color: #5CFFA6">{{(this.$store.getters.userData.company_name ?? this.$store.getters.userData.name)}}</span>
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="7">
        <ColumnChart v-if="this.lowStock.seriesData.length > 0" title="Produtos com Estoque Baixo" seriesTitle="Quantidade" :seriesData="this.lowStock.seriesData" :categories="this.lowStock.categories"></ColumnChart>
        <ColumnChart v-else title="Produtos com Estoque Baixo" seriesTitle="Quantidade" :seriesData="this.lowStock.seriesData" :categories="this.lowStock.categories"></ColumnChart>
      </v-col>

      <v-col cols="5">
        <LineChart v-if="this.orderProduct.seriesData.length > 0" title="Pedidos de Produtos" seriesTitle="Quantidade" :seriesData="this.orderProduct.seriesData" :categories="this.orderProduct.categories"></LineChart>
        <LineChart v-else title="Pedidos de Produtos" seriesTitle="Quantidade" :seriesData="this.orderProduct.seriesData" :categories="this.orderProduct.categories"></LineChart>

        <LineChart v-if="this.outputProduct.seriesData.length > 0" title="Saída de Produtos" seriesTitle="Quantidade" :seriesData="this.outputProduct.seriesData" :categories="this.outputProduct.categories"></LineChart>
        <LineChart v-else title="Saída de Produtos" seriesTitle="Quantidade" :seriesData="this.outputProduct.seriesData" :categories="this.outputProduct.categories"></LineChart>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>
  import LineChart from '@/components/LineChart.vue';
  import ColumnChart from '@/components/ColumnChart.vue';
  import Config from '@/assets/config.json';

  export default {
    name: 'HomePanel',

    components: {
      LineChart,
      ColumnChart
    },

    data: () => ({
      lowStock: {
        categories: ['', '', '', '', '', ''],
        seriesData: []
      },

      orderProduct: {
        categories: ['', '', '', '', '', ''],
        seriesData: []
      },

      outputProduct: {
        categories: ['', '', '', '', '', ''],
        seriesData: []
      }
    }),

    methods: {
      async chartLoad () {
        const axios = require('axios').default;

        await axios.get(`${Config.API_URL}/chart/product`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
          if (response.status == 200) {
            this.lowStock['categories'] = [];
            this.lowStock['seriesData'] = [];
            response.data['LowStock'].forEach(lowStock => {
              this.lowStock.categories.push(lowStock.name);
              this.lowStock.seriesData.push(lowStock.product_amount);
            });

            this.orderProduct['categories'] = [];
            this.orderProduct['seriesData'] = [];
            response.data['OrderProduct'].forEach(orderProduct => {
              this.orderProduct.categories.push(orderProduct.name);
              this.orderProduct.seriesData.push(orderProduct.product_amount);
            });

            this.outputProduct['categories'] = [];
            this.outputProduct['seriesData'] = [];
            response.data['OutputProduct'].forEach(outputProduct => {
              this.outputProduct.categories.push(outputProduct.name);
              this.outputProduct.seriesData.push(outputProduct.product_amount);
            });
          }

        }).catch(err => {
          if (err.message) {
            console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response}`  : '') + `\nRota: ${err.config.url}`);
            this.$root.messageShow(`Ocorreu um erro ao consultar as informações`, 'red');
          }
        });
      }
    },

    beforeMount () {
      this.chartLoad();

      const d = new Date();
      d.setDate(d.getDate() + 1);
    }
  }
</script>
