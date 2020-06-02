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
        let continent=[];

        const resData = await fetch("/api/v2/poverty-stats");
        MyData = await resData.json();
        
        ordenarAsc(MyData,"year");
        
       
        var year = MyData.map((dato)=> {   
             return parseInt(dato.year);
        });

       year= year.filter(function(valor, indiceActual, arreglo) { //quitar duplicados
            let indiceAlBuscar = arreglo.indexOf(valor);
            if (indiceActual === indiceAlBuscar) {
                return true;
            } else {
                return false;
            }
        });

        var cont = MyData.map((dato)=> {   
             return dato.continent;
        });

       cont= cont.filter(function(valor, indiceActual, arreglo) { //quitar duplicados
            let indiceAlBuscar = arreglo.indexOf(valor);
            if (indiceActual === indiceAlBuscar) {
                return true;
            } else {
                return false;
            }
        });
        
        // puntos de rellenos desde aqui
        for(var a=0;a<cont.length;a++){
            var Point = MyData.filter(function (el) {
                return el.continent == cont[a]; //recogemos datos de cada continente
            }).map((dato)=> {     
             return {'continent':dato.continent,
                        'year':parseInt(dato.year)};
        });
        /*var hash = {};
        Point=Point.filter(function(current) {
            var exists = !hash[current.year];
            hash[current.year] = true;
            if(!exists){
               MyData
               
            }
            return exists;
        });
*/
        //console.log(Point);
        var enc=false;
        for(var i=0;i<year.length;i++){
            enc=false;
            for(var j=0;j<Point.length;j++){    //comprobamos si en cada año, el continente tiene un dato, sino lo rellena por defecto
                if(year[i]==Point[j]['year']){ 
                    enc=true;
                    break;
                }
            }
            
         //   console.log(Point);
            if(enc==false){
                MyData.push({
                            'country':"none",
                            'under_190': 0,
                            'under_320': 0,
                            'under_550': 0,
                            'year': year[i], //2014
                            'continent':cont[a]
                        });
            }
        }
        }
        //puntos de rellenos hasta aqui
        
        ordenarAsc(MyData,"year");

       // console.log(MyData);
        //recoger datos por continentes
        var euro=MyData.filter(function (el) {
                return el.continent == "europe";
            }).map((dato)=> {     
                return parseFloat(dato.under_320);
        });
        
        var asia = MyData.filter(function (el) {
                return el.continent == "asia";
            }).map((dato)=> {     
                return parseFloat(dato.under_320);
        });

        var africa = MyData.filter(function (el) {
                return el.continent == "africa";
            }).map((dato)=> {     
                return parseFloat(dato.under_320);
        });

        var south = MyData.filter(function (el) {
                return el.continent == "south america";
            }).map((dato)=> {     
                return parseFloat(dato.under_320);
        });

        var north = MyData.filter(function (el) {
                return el.continent == "north america";
            }).map((dato)=> {     
                return parseFloat(dato.under_320);
        });

        var oceania = MyData.filter(function (el) {
                return el.continent == "oceania";
            }).map((dato)=> {     
                return parseFloat(dato.under_320);
        });
      // console.log(year);
        Highcharts.chart('container', {
            chart: {
                type: 'spline'
            },
            title: {
                text: 'Indice de pobreza inferior a 5.5'
            },
            
            xAxis: {
                categories: year
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

    <script src="https://code.highcharts.com/modules/export-data.js"on:load="{loadGraphs}"></script>
</svelte:head>

<main>
    
    <figure class="highcharts-figure">
        <div id="container"></div>
        
    </figure>
    
</main>