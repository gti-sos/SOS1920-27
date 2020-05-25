<script>
    import {
        onMount
    } from "svelte";
    import {
        pop
    } from "svelte-spa-router";
    import Table from "sveltestrap/src/Table.svelte";
    import { Alert } from "sveltestrap";

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

    async function loadGraphs(){

        let MyData = [];

        const resData = await fetch("/api/v2/poverty-stats");
        MyData = await resData.json();
        
        ordenarAsc(MyData,"year");
        console.log(MyData);
       

        var euro = MyData.filter(function (el) {
                return el.continent == "europe";
            }).map((dato)=> {     
             return dato.under_320;
        });

        var asia = MyData.filter(function (el) {
                return el.continent == "asia";
            }).map((dato)=> {     
                return dato.under_320;
        });

        var africa = MyData.filter(function (el) {
                return el.continent == "africa";
            }).map((dato)=> {     
                return dato.under_320;
        });

        var south = MyData.filter(function (el) {
                return el.continent == "south america";
            }).map((dato)=> {     
                return dato.under_320;
        });

        var north = MyData.filter(function (el) {
                return el.continent == "north america";
            }).map((dato)=> {     
                return dato.under_320;
        });

        var oceania = MyData.filter(function (el) {
                return el.continent == "oceania";
            }).map((dato)=> {     
                return dato.under_320;
        });
       
        Highcharts.chart('container', {
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Indice de pobreza inferior a 5.5'
            },
            
            xAxis: {
                categories: ['2014', '2015',
                    '2016', '2017']
            },
            yAxis: {
                title: {
                    text: 'Indice'
                },
                labels: {
                    formatter: function () {
                        return this.value;
                    }
                }
            },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        radius: 4,
                        lineColor: '#666666',
                        lineWidth: 1
                    }
                }
            },
            series: [{
                name: 'Asia',
                marker: {
                    symbol: 'square'
                },
                data: asia

            },
            {
                name: 'South America',
                marker: {
                    symbol: 'square'
                },
                data: south

            },
            {
                name: 'North America',
                marker: {
                    symbol: 'square'
                },
                data: north

            },
            {
                name: 'Oceania',
                marker: {
                    symbol: 'square'
                },
                data: oceania

            },
            {
                name: 'Africa',
                marker: {
                    symbol: 'square'
                },
                data: africa

            },
            {
                name: 'Europa',
                marker: {
                    symbol: 'square'
                },
                data: euro

            }]
        });

    }
</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/series-label.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"on:load="{loadGraphs}"></script>
</svelte:head>

<main>
    
    <figure class="highcharts-figure">
        <div id="container"></div>
        
    </figure>
    
</main>