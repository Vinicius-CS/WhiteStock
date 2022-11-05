<template>
    <v-container>
        <div id="chart" class="lineChart">
            <apexchart height="150" :options="options" :series="series"></apexchart>
        </div>
    </v-container>
</template>

<script>
  export default {
    name: 'LineChart',

    props: {
        title      : String,
        seriesTitle: String,
        seriesData : Array,
        categories : Array
    },

    data: () => ({
      date: new Date(),

      series: [{
        name: undefined,
        data: [],
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
            text: undefined,
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
            categories: undefined,
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
        this.options.title.text = this.title;
        this.series[0].name = this.seriesTitle;
        this.series[0].data = this.seriesData;
        this.options.xaxis.categories = this.categories;
    }
  }
</script>