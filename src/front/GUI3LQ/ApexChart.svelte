<script>
    import{
        onMount
    } from "svelte";
    import{
        pop
    } from "svelte-spa-router";
    import{
        Alert
    } from "sveltestrap";

    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
    import { Collapse, CardBody, Card } from "sveltestrap";
    let lq =[];
    //ALERTAS
    let visible = false;
    let color = "danger";

    let errorMSG = "";
    onMount(getLQ);

    //GET
    async function getLQ() {
        console.log("Fetching lq...");
        const res = await fetch("api/v2/lq-stats?limit=10&offset=1");

        if(res.ok){
            console.log("Ok");
            const json = await res.json();
            lq = json;
            console.log("Received " + lq.length + "lq.");
        } else{
            errorMSG = res.status + ": " + res.statusText;
            console.log("ERROR!");
        } 
    }

    //GET LoadInitialData
    async function getLQLoadInitialData() {

        console.log("Fetching lq...");
        await fetch("/api/v2/lq-stats/loadInitialData")
        const res = await fetch("/api/v2/lq-stats?limit=10&offset="+1);
        

        if (res.ok){
            console.log("Ok");
            const json = await res.json();
            lq = json;
            console.log("Received " + lq.length + " lq.");
        } else {
            errorMSG = res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

    //DELETE ALL
    async function deleteLQALL(){
        const res = await fetch("/api/v2/lq-stats", {
            method: "DELETE"
        }).then(function (res){
            getLQ();
            visible = true;
            if(res.status==200){
                color = "sucess";
                errorMSG = "Objetos borrados correctamente";
                console.log("Deleted all lq.");
            } else if(res.status==400){
                color = "danger";
                errorMSG = "Ha ocurrido un fallo";
                console.log("BAD REQUST");
            } else{
                color = "danger";
                errorMSG = res.status + ": " + res.statusText;
                console.log("ERROR!");
            }
        });
    }
    //grafica
    async function loadGraphs(){
        let MyData = [];
        const resData = await fetch("/api/v2/lq-stats");
        MyData = await resData.json();
        let sumatorio_asia = 0;
        let sumatorio_oce = 0;
        let sumatorio_eu = 0;
        let sumatorio_afri = 0;
        let sumatorio_norte = 0;
        let sumatorio_sur = 0;


        //asia
        var asi = MyData.filter((objeto)=>{
            return objeto.continent=="asia" && parseInt(objeto.year)==2016;
        }).map((dato)=> dato.total);

        for (let i = 0; i < asi.length; i++) {
          sumatorio_asia+=parseInt(asi[i]);
        }
        let media_asia = sumatorio_asia/asi.length;
        if(isNaN(media_asia)){
          media_asia = 0;
        }

        //oceania
        var oce = MyData.filter((objeto)=>{
            return objeto.continent=="oceania" && parseInt(objeto.year)==2016;
        }).map((dato)=> dato.total);

        for (let i = 0; i < oce.length; i++) {
          sumatorio_oce+=parseInt(oce[i]);
        }
        let media_oce = sumatorio_oce/oce.length;
        if(isNaN(media_oce)){
          media_oce = 0;
        }

        //europe
        var eu = MyData.filter((objeto)=>{
            return objeto.continent=="europe" && parseInt(objeto.year)==2016;
        }).map((dato)=> dato.total);

        for (let i = 0; i < eu.length; i++) {
          sumatorio_eu+=parseInt(eu[i]);
        }
        let media_eu = sumatorio_eu/eu.length;
        if(isNaN(media_eu)){
          media_eu = 0;
        }

        //africa
        var afri = MyData.filter((objeto)=>{
            return objeto.continent=="africa" && parseInt(objeto.year)==2016;
        }).map((dato)=> dato.total);

        for (let i = 0; i < afri.length; i++) {
          sumatorio_afri+=parseInt(afri[i]);
        }
        let media_afri = sumatorio_afri/afri.length;
        if(isNaN(media_afri)){
          media_afri = 0;
        }

        //a sur
        var sur = MyData.filter((objeto)=>{
            return objeto.continent=="south america" && parseInt(objeto.year)==2016;
        }).map((dato)=> dato.total);

        for (let i = 0; i < sur.length; i++) {
          sumatorio_sur+=parseInt(sur[i]);
        }
        let media_sur = sumatorio_sur/sur.length;
        if(isNaN(media_sur)){
          media_sur = 0;
        }
        
        //a norte
        var norte = MyData.filter((objeto)=>{
            return objeto.continent=="north america" && parseInt(objeto.year)==2016;
        }).map((dato)=> dato.total);

        for (let i = 0; i < norte.length; i++) {
          sumatorio_afri+=parseInt(norte[i]);
        }
        let media_norte = sumatorio_norte/norte.length;
        if(isNaN(media_norte)){
          media_norte = 0;
        }


        var options = {
          series: [media_oce, media_afri, media_asia, media_eu, media_norte, media_sur],
          chart: {
          height: 390,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
              margin: 5,
              size: '30%',
              background: 'transparent',
              image: undefined,
            },
            dataLabels: {
              name: {
                show: true,
              },
              value: {
                show: true,
              }
            }
          }
        },
        colors: ['#FF5733', '#03FF66', '#03C6FF', '#0077B5','#0331FF','#BA03FF'],
        labels: ['oceania', 'africa', 'asia', 'europe', 'north america', 'south america'],
        legend: {
          show: true,
          floating: true,
          fontSize: '16px',
          position: 'left',
          offsetX: 160,
          offsetY: 15,
          labels: {
            useSeriesColors: true,
          },
          markers: {
            size: 0
          },
          formatter: function(seriesName, opts) {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
          },
          itemMargin: {
            vertical: 3
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
                show: false
            }
          }
        }]
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    }

</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts" on:load={loadGraphs}></script>
</svelte:head>

<main>

<div id="chart"></div>
<div id="inner">
  <h3>
    <p>
      Media de la calidad de vida según el continente
    </p>
  </h3>
</div>

<div id="outer">
  <h6>
    <p>
      Aquellos datos con valor 0 significan que aún no existen datos de cualquier country de ese continente y por tanto no se podrá realizar la media
    </p>
  </h6>
</div>
</main>

<style>
  #inner {
  display: table;
  margin: 0 auto;
}

#outer {
  display: table;
  margin: 0 auto;
}
</style>
