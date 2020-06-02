
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
    
      //recoger datos por continentes
      
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
      
      /////////////////////

      var ctx = document.getElementById('myChart').getContext('2d');
     var data = {
    datasets: [{
        data: [euro,asia,oceania,africa,south,north],
        backgroundColor: [
        'rgba(255, 30, 30)',
        'rgba(62, 255, 30)',
        'rgba(255, 255, 30)',
        'rgba(30, 30, 255)',
        'rgba(255, 30, 255)',
        'rgba(20, 20, 20)'
        ]
    }],
    labels: ["europa","asia","oceania","africa","south america","north america"]
};
      var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data
        

        });
      /////////////////////

    }

    
  </script>
  
<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0" on:load="{loadGraphs}"></script>
</svelte:head>



<main>
  <h1>Porcentaje de pobreza inferior del 3.2 por continente en 2017</h1>
</main>
<canvas id="myChart"></canvas>
<style>

  </style>