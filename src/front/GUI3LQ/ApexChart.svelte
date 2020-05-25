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
    let isOpen = false;
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
            totaldata = 12;
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
                totaldata=0;
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
        MyData = lq;

        //var continentes = MyData.map((dato)=> dato.continent);

        var oce = MyData.filter((objeto)=>{
            return objeto.continent=="oceania" && objeto.year=="2016";
        }).reduce((a,b) => a + b.total, 0);

        var afri = MyData.filter((objeto)=>{
            return objeto.continent=="africa" && objeto.year=="2016";
        }).reduce((a,b) => a + b.total, 0);

        var asi = MyData.filter((objeto)=>{
            return objeto.continent=="asia" && objeto.year=="2016";
        }).reduce((a,b) => a + b.total, 0);

        var euro = MyData.filter((objeto)=>{
            return objeto.continent=="europe" && objeto.year=="2016";
        }).reduce((a,b) => a + b.total, 0);

//        var norte = MyData.filter((objeto)=>{
//            return objeto.continent=="north america" && objeto.year=="2016";
//        }).reduce((a,b) => a + b.total, 0);

//        var asi = MyData.filter((objeto)=>{
//            return objeto.continent=="south america" && objeto.year=="2016";
//        }).reduce((a,b) => a + b.total, 0); 

        var options = {
          series: [oce, afri, asi, euro, 90, 90],
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
        colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
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
</main>