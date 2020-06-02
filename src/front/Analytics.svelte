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

    function ordenarAsc(array, key) {
       var arrayAux=[];
        for(var i=0; i < array.length-1;i++){
            for (let j = i+1; j < array.length; j++) {
                if(array[i][key] > array[j][key]){
                    arrayAux = array[i];
                    array[i]=array[j];
                    array[j]=arrayAux;
                }
            }
        }
        return array;
    }

    async function loadGraphs() {
        
        //api pere
        let poverty = [];
        let Regions=[];
        let povertyUnder550=[];

        const resData = await fetch('/api/v2/poverty-stats');
        poverty = await resData.json();

        //instertar continentes
        ordenarAsc(poverty,'continent');

        Regions = poverty.map((p)=>{
          return p.continent;
        });

        Regions= Regions.filter(function(valor, indiceActual, arreglo) { //quitar duplicados
            let indiceAlBuscar = arreglo.indexOf(valor);
            if (indiceActual === indiceAlBuscar) {
                return true;
            } else {
                return false;
            }
        });

        //pobreza media de cada continente
        var acum=0;
        var tam=0;
        Regions.forEach((r)=>{
        acum=0;
        poverty.forEach((p)=>{
          if(r==p.continent){
            acum+=p.under_550;
            tam++;
          }
        });
        povertyUnder550.push(acum/tam);
      });

        // console.log(poverty);
        // console.log(Regions);
        // console.log(povertyUnder550);


        //api belen
        let spc = [];
        let spcRatio = [];

        const resB = await fetch("/api/v3/spc-stats");
        spc = await resB.json();

        //ratio medio de cada continente
        var acum1=0;
        var tam1=0;
        Regions.forEach((r)=>{
        acum1=0;
        spc.forEach((s)=>{
          if(r==s.continent){
            acum1+=s.ratio;
            tam1++; 
            
          }
        });
        spcRatio.push(acum1/tam1);
      });
      ///
        console.log(spc);
        console.log(spcRatio);


        //api juanlu
        let lq = []
        let lqRatio = []
        let lqRatioTantoPorUno = 0
        const resC = await fetch('/api/v2/lq-stats');
        lq = await resC.json();

        //calidad de vida de cada continente
        var acum2=0;
        var tam2=0;

        Regions.forEach((r)=>{
        acum2=0;
        lq.forEach((s)=>{
          if(r==s.continent){
            acum2+=s.total;
            tam2++; 
            
          }
        });
        lqRatio.push((acum2/tam2)/100);
        
      })

        var options = {
          series: [{
          name: 'Ratio suicidios',
          type: 'column',
          data: lqRatio
        }, {
          name: 'Ratio calidad de vida',
          type: 'area',
          data: spcRatio
        }, {
          name: 'Ratio de pobreza medio inferior a 5.5',
          type: 'line',
          data: povertyUnder550
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
        labels: Regions,
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
                return y.toFixed(4) + " ";
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
    
    <div class="contenedor">
        <h3 style="text-align: center;">Integración conjunta del grupo SOS1920-27</h3>
        <div id="chart"></div>
        <div>
          <p style="text-align: center;">En esta gráfica podemos ver la comparación del valor en tanto por uno del nivel de calidad de vida y del ratio de nivel de pobreza, además del ratio de suicidios (no se en que proporcion belen nota)</p>
        </div>
      </div> 

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