<template>
    <v-container>
        <div id="chart">
            <apexchart height="350" :options="options" :series="series"></apexchart>
        </div>
    </v-container>
</template>

<script>
  export default {
    name: 'ColumnChart',

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
        data: undefined,
      }],

      options: {
        chart: {
          type: 'bar',
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
            show: false
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
          show: true,
        },

        yaxis: {
          show: true
        },
        
        xaxis: {
          categories: undefined,
          labels: {
            show: true
          },
          tooltip: {
            enabled: false
          }
        },

        fill: {
          colors: ['#ff5c5c']
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