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

    //ALERTAS
    let visible = false;
    let color = "danger";
    
    let spc = [];
    import ApexCharts from 'apexcharts';
    let errorMSG = "";
    onMount(getSPC);
 

     //GET INITIALDATA
     async function getSPCLoadInitialData() {
 
        console.log("Fetching spc...");
        await fetch("/api/v2/spc-stats/loadInitialData");
        const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
        loadGraphs();
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            spc = json;
            totaldata=12;
            console.log("Received " + spc.length + " spc.");
        } else {
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

    //DELETE ALL
    async function deleteSPCALL() {
        const res = await fetch("/api/v2/spc-stats/", {
            method: "DELETE"
        }).then(function (res) {
            loadGraphs();
            visible = true;
            if (res.status==200) {
                totaldata=0;
                color = "success";
                errorMSG = "Objetos borrados correctamente";
                console.log("Deleted all spc.");            
            }else if (res.status==400) {
                color = "danger";
                errorMSG = "Ha ocurrido un fallo";
                console.log("BAD REQUEST");            
            } else {
                color = "danger";
                errorMSG= res.status + ": " + res.statusText;
                console.log("ERROR!");
            }
        });
    }

    //GET
    async function getSPC() {
 
        console.log("Fetching spc...");
        const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            spc = json;
            
            console.log("Received " + spc.length + " spc.");
        } else {
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }
    async function loadGraphs() {
        let MyData = [];

        const resData = await fetch("/api/v2/spc-stats");
        MyData = spc;

        var mujeres = MyData.map((dato)=> dato.female_number);
        var hombres = MyData.map((dato)=> dato.male_number);
        var paises = MyData.map((dato)=> {
            return dato.country
        });

        var options = {
          series: [{
          name: 'Hombres',
          data: hombres
        }, {
          name: 'Mujeres',
          data: mujeres
        }],
          chart: {
          height: 550,
          type: 'area'
        },
        dataLabels: {
          enabled: true
        },
        stroke: {
          curve: 'smooth'
        },
        xaxis: {
          type: 'category',
          categories: paises
        },
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
 }


      
</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts" on:load={loadGraphs}></script>
</svelte:head>
<main>

    <h1>SPC Manager</h1>
    <Button color="success" on:click="{getSPCLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button color="danger" on:click="{deleteSPCALL}">
        Borrar todo
    </Button>
    <div id="chart" style="text-align: center;">Suicidios por cada 100,000 personas
    </div>
</main>

<style>
 
 @import url(https://fonts.googleapis.com/css?family=Roboto);

body {
  font-family: Roboto, sans-serif;
}

#chart {
  max-width: 100%;
  margin: 35px auto;
}
</style>