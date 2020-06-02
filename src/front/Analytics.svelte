<script>
    import {
        onMount
    } from "svelte";
    import {
        pop
    } from "svelte-spa-router";
 
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
    import { Alert } from "sveltestrap";
    
    import ApexCharts from 'apexcharts';
    let errorMSG = "";

    async function loadGraphs() {
        //api belen
        let spc = [];
        let spcRatio = [];
        let spcCountry = [];

        const resB = await fetch("/api/v3/spc-stats");
        spc = await resB.json();


        spcRatio = spc.map((dato)=> dato.ratio);
        spcCountry = spc.map((dato)=> dato.country);
        console.log(spc);


        //api pere


        //api juanlu




        //interseccion paises





        var options = {
          series: [{
          name: 'Ratio suicidios',
          type: 'column',
          data: spcRatio
        }, {
          name: 'TEAM B',
          type: 'area',
          data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
        }, {
          name: 'TEAM C',
          type: 'line',
          data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
        }],
          chart: {
          height: 550,
          type: 'line',
          stacked: false,
        },
        stroke: {
          width: [0, 2, 5],
          curve: 'smooth'
        },
        plotOptions: {
          bar: {
            columnWidth: '80%'
          }
        },
        
        fill: {
          opacity: [0.85, 0.25, 1],
          gradient: {
            inverseColors: false,
            shade: 'light',
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100]
          }
        },
        labels: spcCountry,
        markers: {
          size: 0
        },
        xaxis: {
          type: 'category'
        },
        yaxis: {
          title: {
            text: '',
          },
          min: 0
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " ";
              }
              return y;
        
            }
          }
        }
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render(); }



      
</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts" on:load={loadGraphs}></script>
</svelte:head>
<main>

    <h1>SPC Manager</h1>
    
    <div class="contenedor">
        <h3 style="text-align: center;">Integración API sos1920-02</h3>
        <p style="text-align: center;"><b>Distancia de carriles bicis en España en relación al número de suicidios en un año</b></p>
        <div id="chart">
        </div></div> 

</main>





<style>
    .legend-scale{
        padding-left: 45%;
    }
  .my-legend .legend-scale ul {
    

    margin: 0;
    padding: 0;
    float: left;
    list-style: none;
    }
  .my-legend .legend-scale ul li {
    display: block;
    float: left;
    width: 50px;
    margin-bottom: 6px;
    text-align: center;
    font-size: 80%;
    list-style: none;
    }
  .my-legend ul.legend-labels li span {
    display: block;
    float: left;
    height: 15px;
    width: 50px;
    }
  .my-legend .legend-source {
    font-size: 70%;
    color: #999;
    clear: both;
    }
  .my-legend a {
    color: #777;
    }


 @import url(https://fonts.googleapis.com/css?family=Roboto);

body {
  font-family: Roboto, sans-serif;
}

#chart {
  max-width: 100%;
  margin: 35px auto;
}
</style>