<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Bem vindo(a) à White Stock
        </h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="7">
        <ColumnChart v-if="this.lowStock.seriesData != null" title="Pedidos de Produtos" seriesTitle="Quantidade" :seriesData="this.lowStock.seriesData" :categories="this.lowStock.categories"></ColumnChart>
      </v-col>

      <v-col cols="5">
        <LineChart title="Pedidos de Produtos" seriesTitle="Quantidade" :seriesData="[69, 30, 22, 56, 59, 46]" :categories="['29/10/2022', '30/10/2022', '31/10/2022', '01/11/2022', '02/11/2022', '03/11/2022', '04/11/2022']"></LineChart>
        <LineChart title="Saída de Produtos" seriesTitle="Quantidade" :seriesData="[69, 30, 22, 56, 59, 46]" :categories="['29/10/2022', '30/10/2022', '31/10/2022', '01/11/2022', '02/11/2022', '03/11/2022', '04/11/2022']"></LineChart>
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
      lowStock: []
    }),

    async beforeMount () {
      const axios = require('axios').default;

      await axios.get(`${Config.API_URL}/chart/product`, {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-resource-token': this.$store.state.token}}).then(response => {
        if (response.status == 200) {
          this.lowStock['categories'] = [];
          this.lowStock['seriesData'] = [];

          response.data.forEach(lowStock => {
            this.lowStock.categories.push(lowStock.name);
            this.lowStock.seriesData.push(lowStock.amount);
          });
        }

      }).catch(err => {
        if (err.message) {
          console.warn((err.response.data.code != undefined ? `\nCódigo de erro: ${err.response.data.code}`  : '') + `\nRota: ${err.config.url}`);
          this.$root.messageShow(`Ocorreu um erro ao consultar as informações`, 'red');
        }
      });

      const d = new Date();
      d.setDate(d.getDate() + 1);
      console.log(d.toLocaleDateString());

    }
  }
</script>
