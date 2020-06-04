
<script>
  import {
      onMount
   } from "svelte";
   import {
        pop
    } from "svelte-spa-router";

    async function loadGraphs(){

      let MyData=[];
      const resData = await fetch("/api/v2/poverty-stats");
      MyData = await resData.json();
    
      //recoger datos por continentes
      
      var euro = MyData.filter((el)=>{
        return el.continent=="europe";
      }).map((dato)=>{
        return parseFloat(dato.under_550);
      })
      euro=euro.reduce(function (sum, value) {
        return sum + value;
    }, 0) / euro.length;

      var asia = MyData.filter((el)=>{
      return el.continent=="asia";
      }).map((dato)=>{
        return parseFloat(dato.under_550);
      });
      asia=asia.reduce(function (sum, value) {
        return sum + value;
    }, 0) / asia.length;

      var oceania =MyData.filter((el)=>{
      return el.continent=="oceania";
      }).map((dato)=>{
        return parseFloat(dato.under_550);
      });
      oceania=oceania.reduce(function (sum, value) {
        return sum + value;
    }, 0) / oceania.length;

      var africa =MyData.filter((el)=>{
      return el.continent=="africa";
      }).map((dato)=>{
        return parseFloat(dato.under_550);
      });
      africa=africa.reduce(function (sum, value) {
        return sum + value;
    }, 0) / africa.length;

      var south =MyData.filter((el)=>{
      return el.continent=="south america";
      }).map((dato)=>{
        return parseFloat(dato.under_550);
      });
      south=south.reduce(function (sum, value) {
        return sum + value;
    }, 0) / south.length;


      var north =MyData.filter((el)=>{
      return el.continent=="north america";
      }).map((dato)=>{
        return parseFloat(dato.under_550);
      });
      north=north.reduce(function (sum, value) {
        return sum + value;
    }, 0) / north.length;

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
  <h1>Porcentaje de pobreza inferior del 5.5</h1>
</main>
<canvas id="myChart"></canvas>

<style>

  </style>