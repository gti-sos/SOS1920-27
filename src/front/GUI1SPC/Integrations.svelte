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
        const res = await fetch("/api/v2/spc-stats");
        population();
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

    //DELETE ALL
    async function deleteSPCALL() {
        const res = await fetch("/api/v2/spc-stats/", {
            method: "DELETE"
        }).then(function (res) {
            population();
            visible = true;
            if (res.status==200) {
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
        const res = await fetch("/api/v2/spc-stats");
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
    
    async function population() {
        let MyData = [];
        let populationApi = [];
        let listaDensidad = [];//lista de densidad de la api
        let listaapi = [];//lista de paises de la api

        const resData = await fetch("/api/v2/spc-stats");
        MyData = await resData.json();
        
        //mi api
        var ambos = MyData.map((dato)=> dato.both_sex*1000000);
        var paises = MyData.map((dato)=> dato.country);

        for (let index = 0; index < paises.length; index++) {
            const densityApi = await fetch("https://restcountries.eu/rest/v2/name/" + paises[index]);
            var density =  await densityApi.json();
            listaDensidad.push(density[0].population);       
        }

        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Porcentaje de suicidios respecto a densidad de un país'
            },
            subtitle: {
                text: 'Source: data.opendatasoft.com/'
            },
            xAxis: {
                categories: paises,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Rainfall (mm)'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Densidad',
                data: listaDensidad

            }, {
                name: 'Suicidios por cada 100.000 personas',
                data: ambos

            }]
        });
 }


      
</script>

<svelte:head>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load={population}></script>
</svelte:head>
<main>

    <h1>SPC Manager</h1>
    <Button color="success" on:click="{getSPCLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button color="danger" on:click="{deleteSPCALL}">
        Borrar todo
    </Button>

    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
            A basic column chart compares rainfall values between four cities.
            Tokyo has the overall highest amount of rainfall, followed by New York.
            The chart is making use of the axis crosshair feature, to highlight
            months as they are hovered over.
        </p>
    </figure>
</main>

<style>
.highcharts-figure, .highcharts-data-table table {
    min-width: 310px; 
    max-width: 800px;
    margin: 1em auto;
}

#container {
    height: 400px;
}

.highcharts-data-table table {
	font-family: Verdana, sans-serif;
	border-collapse: collapse;
	border: 1px solid #EBEBEB;
	margin: 10px auto;
	text-align: center;
	width: 100%;
	max-width: 500px;
}
.highcharts-data-table caption {
    padding: 1em 0;
    font-size: 1.2em;
    color: #555;
}
.highcharts-data-table th {
	font-weight: 600;
    padding: 0.5em;
}
.highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption {
    padding: 0.5em;
}
.highcharts-data-table thead tr, .highcharts-data-table tr:nth-child(even) {
    background: #f8f8f8;
}
.highcharts-data-table tr:hover {
    background: #f1f7ff;
}
</style>