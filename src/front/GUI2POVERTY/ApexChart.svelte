
<script>
  import {
      onMount
   } from "svelte";
   import {
        pop
    } from "svelte-spa-router";

    function filtro(array,cont, year){
      var res=array.filter((el)=>{
      return el.continent=="europe" && el.year=="2017";
      });

      return res;
    }

    async function loadGraphs(){

      let MyData=[];
      const resData = await fetch("/api/v2/poverty-stats");
      MyData = await resData.json();
    
 
      
      var euro = MyData.filter((el)=>{
        return el.continent=="europe" && el.year=="2017";
      }).map((dato)=>{
        return parseFloat(dato.under_320);
      })[0];
      var asia = MyData.filter((el)=>{
      return el.continent=="asia" && el.year=="2017";
      }).map((dato)=>{
        return parseFloat(dato.under_320);
      })[0];
      var oceania =MyData.filter((el)=>{
      return el.continent=="oceania" && el.year=="2017";
      }).map((dato)=>{
        return parseFloat(dato.under_320);
      })[0];
      var africa =MyData.filter((el)=>{
      return el.continent=="africa" && el.year=="2017";
      }).map((dato)=>{
        return parseFloat(dato.under_320);
      })[0];
      var south =MyData.filter((el)=>{
      return el.continent=="south america" && el.year=="2017";
      }).map((dato)=>{
        return parseFloat(dato.under_320);
      })[0];
      var north =MyData.filter((el)=>{
      return el.continent=="north america" && el.year=="2017";
      }).map((dato)=>{
        return parseFloat(dato.under_320);
      })[0];

      console.log(euro);

      var options = {
          series: [euro,asia,oceania,africa,south,north],
          chart: {
          type: 'donut',
        },
        labels:["europa","asia","oceania","africa","south america","north america"],
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
  }

    
  </script>
  
<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"on:load="{loadGraphs}"></script>
</svelte:head>

<main>
  <h1>Porcentaje de pobreza inferior del 3.2 por continente en 2017</h1>
  <div id="chart">
  </div>
</main>

<style>
  #chart{
    width: 90%;
  }
</style>