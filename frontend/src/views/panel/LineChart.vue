<template>
    <v-container>
        <div id="chart">
            <apexchart height="150" width="350" :options="options" :series="series"></apexchart>
        </div>
    </v-container>
</template>

<script>
  export default {
    name: 'LineChart',

    data: () => ({
      date: new Date(),

      series: [{
        name: "Produtos",
        data: [22, 18, 35, 51, 41, 62, 69],
      }],

      options: {
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
          text: 'Pedidos de Produtos',
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
          categories: ['29/10/2022', '30/10/2022', '31/10/2022', '01/11/2022', '02/11/2022', '03/11/2022', '04/11/2022'],
          labels: {
            show: false
          },
          tooltip: {
            enabled: false
          }
        },
      },
    }),
  }
</script>