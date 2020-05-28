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
    
    //apexcharts
    import ApexCharts from 'apexcharts';

    let spc = [];

    let errorMSG = "";
    onMount(getSPC);
 

     //GET INITIALDATA
     async function getSPCLoadInitialData() {
 
        console.log("Fetching spc...");
        await fetch("/api/v3/spc-stats/loadInitialData");
        const res = await fetch("/api/v3/spc-stats");
        loadGraphs();
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
        const res = await fetch("/api/v3/spc-stats/", {
            method: "DELETE"
        }).then(function (res) {
            loadGraphs();
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
        const res = await fetch("/api/v3/spc-stats");
        loadGraphs();
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
 

    //grafico highchart
    async function loadGraphs() {
        let MyData = [];

        const resData = await fetch("/api/v3/spc-stats");
        MyData = await resData.json();

        var euro = MyData.filter(function (el) {
                return el.continent == "europe" && parseInt(el.year)==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": parseInt(dato.both_sex)
                };
        });

        var asia = MyData.filter(function (el) {
                return el.continent == "asia" && parseInt(el.year)==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": parseInt(dato.both_sex)
                };
        });

        var africa = MyData.filter(function (el) {
                return el.continent == "africa" && parseInt(el.year)==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": parseInt(dato.both_sex)
                };
        });

        var south = MyData.filter(function (el) {
                return el.continent == "south america" && parseInt(el.year)==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": parseInt(dato.both_sex)
                };
        });

        var north = MyData.filter(function (el) {
                return el.continent == "north america" && parseInt(el.year)==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": parseInt(dato.both_sex)
                };
        });

        var oceania = MyData.filter(function (el) {
                return el.continent == "oceania" && parseInt(el.year)==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": parseInt(dato.both_sex)
                };
        });

        Highcharts.chart('container', {
            chart: {
                type: 'packedbubble',
                height: '100%'
            },
            title: {
                text: 'Suicidios por cada 100,000 personas en 2013 '
            },
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.name}:</b> {point.value}'
            },
            plotOptions: {
                packedbubble: {
                    minSize: '20%',
                    maxSize: '100%',
                    zMin: 0,
                    zMax: 1000,
                    layoutAlgorithm: {
                        gravitationalConstant: 0.05,
                        splitSeries: true,
                        seriesInteraction: false,
                        dragBetweenSeries: true,
                        parentNodeLimit: true
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            color: 'black',
                            textOutline: 'none',
                            fontWeight: 'normal'
                        }
                    }
                }
            },
            series: [{
                name: 'Europe',
                data: euro
            }, {
                name: 'Africa',
                data: africa
            }, {
                name: 'Oceania',
                data: oceania
            }, {
                name: 'North America',
                data: north
            }, {
                name: 'South America',
                data: south
            }, {
                name: 'Asia',
                data: asia
            }]
        });

    };
    

</script>

<svelte:head>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{loadGraphs}"></script>
</svelte:head>
<main>

    <h1>SPC Manager</h1>
    <Button color="success" on:click="{getSPCLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button color="danger" on:click="{deleteSPCALL}">
        Borrar todo
    </Button>
    <div id="container" style="height: 1000; min-width: 310px; max-width: 800px; margin: 100px">
        </div>
    

</main>

<style>

    .highcharts-figure, .highcharts-data-table table {
        min-width: 320px; 
        max-width: 800px;
        margin: 1em auto;
    }

    .highcharts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #EBEBEB;
        margin: 10px auto;
        text-align: center;
        width: 100%;
        max-width: 500px;
        background-color: yellowgreen;
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