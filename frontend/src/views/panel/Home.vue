<template>
  <v-container>
    <v-row class="text-center">

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Bem vindo(a) à White Stock
        </h1>
      </v-col>

    </v-row>

    <div id="chart">
      <apexchart height="150" width="350" :options="chartOptions" :series="series"></apexchart>
    </div>

    <v-row>
      <v-col sm="4">
        <v-card
          class="cardHomePanel"
        >
          <v-card-title>
            <h2>Produtos em Estoque</h2>
          </v-card-title>

          <v-card-text>
            <v-btn
              variant="outlined"
              size="x-large"
              icon
              color="white"
            >
              <h2>100</h2>
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
  
<script>
  export default {
    name: 'HomePanel',

    data: () => ({
      date: new Date(),

      series: [{
        name: "Produtos",
        data: [22, 18, 35, 51, 41, 62, 69],
      }],

      chartOptions: {
        chart: {
          type: 'line',
          background: '#2D2D2D',
          foreColor: 'white',
          zoom: {
            enabled: false
          },
          toolbar: {
            show: false
          }
        },

        title: {
          text: 'Produtos em Estoque',
          align: 'center',
          style: {
            color: '#ffffff'
          }
        },

        tooltip: {
          enabled: true,
          x: {
            show: true
          }
        },

        dataLabels: {
          enabled: false,
        },

        labels: {
          enabled: false,
        },

        markers: {
          colors: ['#5CFFA6'],
        },

        stroke: {
          curve: 'smooth',
          colors: ['#5CFFA6']
        },

        grid: {
          show: false,
        },

        yaxis: {
          show: false
        },
        
        xaxis: {
          categories: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'd'],
          labels: {
            show: false
          },
          tooltip: {
            enabled: false
          }
        },
      },
    }),

    beforeMount () {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      console.log(d.toLocaleDateString());

    }
  }
</script>
