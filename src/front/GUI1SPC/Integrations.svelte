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
    
    let spc = [];
    import ApexCharts from 'apexcharts';
    let errorMSG = "";
    onMount(getSPC);
 
    function minusMayus(palabra, estado) {
        if (estado==true) {
                palabra=palabra.charAt(0).toUpperCase() + palabra.slice(1)  
        } else {
                palabra=palabra.charAt(0).toLowerCase() + palabra.slice(1)  
        }
        return palabra
    }

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
    

    //api externa 1
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
                text: 'Source: https://restcountries.eu/rest/v2/all'
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


    //api sos1920-09 (nando)
    async function vehiculos() {
        let dataVehiculos = []; //guardamos todos los vehiculos
        let intersecMayus = [] //interseccion entre spc y vehiculos en mayus
        let intersecMinus = [] //igual en minus
        let listaVehiculos = [] //guardamos las variables que querempos
        let listaSuicidios = []
        const res = await fetch("https://sos1920-09.herokuapp.com/api/v3/plugin-vehicles-stats/");
        dataVehiculos = await res.json();

        //busco la interseccion entre mis paises y los suyos
        var paisesVehicu = dataVehiculos.map(dato => dato.country)
        var paisesSpc = spc.map(dato => dato.country) //pero tengo que poner en mayus la primera letra o al reves

        for (let index = 0; index < paisesSpc.length; index++) {
            paisesSpc[index]= minusMayus(paisesSpc[index], true)
        }

        intersecMayus = paisesSpc.filter(x => paisesVehicu.includes(x)); //ya tengo los paises que coinciden

        //hago lista para poder tenerlo en minus otra vez y buscar con mi api
        for (let index = 0; index < intersecMayus.length; index++) {
            intersecMinus.push(minusMayus(intersecMayus[index], false))
        }
        //busco los suicidios de cada pais y los coches
        for (let index = 0; index < intersecMayus.length; index++) {
            const vehiculosApi = await fetch("https://sos1920-09.herokuapp.com/api/v3/plugin-vehicles-stats?country=" + intersecMayus[index]);
            var resVehicu =  await vehiculosApi.json();
            listaVehiculos.push(resVehicu[0]['pev-stock']);       

            const suicidiosApi = await fetch("/api/v2/spc-stats?country=" + intersecMinus[index]);
            var resSuci =  await suicidiosApi.json();
            listaSuicidios.push(resSuci[0].both_sex*100000);       
        }

        var options = {
          series: [{
            name: "Suicidios en un año",
            data: listaSuicidios
          },
          {
            name: "Coches vendidos en un año",
            data: listaVehiculos
          }
        ],
          chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [5, 7, 5],
          curve: 'smooth',
          dashArray: [0, 8, 5]
        },
        title: {
          text: 'Relación venta de coche entre suicidios',
          align: 'center'
        },
        legend: {
          tooltipHoverFormatter: function(val, opts) {
            return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
          }
        },
        markers: {
          size: 0,
          hover: {
            sizeOffset: 6
          }
        },
        xaxis: {
          categories: intersecMayus,
        },
        tooltip: {
          y: [
            {
              title: {
                formatter: function (val) {
                  return val
                }
              }
            },
            {
              title: {
                formatter: function (val) {
                  return val
                }
              }
            }
          ]
        },
        grid: {
          borderColor: '#f1f1f1',
        }
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    }
    // on:load={vehiculos}
      
    //api sos1920-02 bicis
    async function bicis(){
        let dataBicis = []; //guardamos todos los datos de bicis de 2015

        const res = await fetch("https://sos1920-02.herokuapp.com/api/v2/evolution-of-cycling-routes?year=2015");
        dataBicis = await res.json();

        //hacemos map para el carril metropolitano
        dataBicis.map(dato=> dato.metropolitan).reduce((a, b) => a + b, 0)

        var espa = spc.filter(dato => dato.country=="spain")
    }// on:load={hospitalized}

    //api sos1920-04 roads kilometros de carretera
    async function roads(){
        let dataRoads = []; //guardamos todos los datos de bicis de 2015

        const res2 = await fetch("http://sos1920-04.herokuapp.com/api/v1/roads/");
        dataRoads = await res2.json();

        //hacemos map para el carril metropolitano
        dataRoads.map(dato=> dato.total)
    } 
    // on:load={roads}

        //api sos1920-04 roads kilometros de carretera
        async function hospitalized(){
        let dataHospi = []; //guardamos todos los datos de bicis de 2015

        const res3 = await fetch("https://sos1920-06.herokuapp.com/api/v1/not-hospitalized-stats?year=2014");
        dataHospi = await res3.json();

        //hacemos map para el carril metropolitano
        dataHospi.map(dato=>  dato.total).reduce((a, b) => a + b, 0)
        console.log(dataHospi)
    } 
    // on:load={hospitalized}

    //api sos1920-02 bicis
    async function covid(){
        let dataCovid = []; //guardamos todos los datos de bicis de 2015
        let miApi = [];
        let miApiMayus = []

        const res = await fetch("https://akashraj.tech/corona/api");
        dataCovid = await res.json();
        
        const res2 = await fetch("https://sos1920-27.herokuapp.com/api/v2/spc-stats");
        miApi = await res2.json();
        
        var paises =  dataCovid.countries_stat
        var nombrePai = paises.map(x => x.country_name)
        
        for (let index = 0; index < miApi.length; index++) {
            miApiMayus.push(minusMayus(miApi[index].country, true))
            
        }
        var inters = nombrePai.filter(x => miApiMayus.includes(x));

        var estadisdeath = [] //deaths_per_1m_population
        var estadiscases = [] //total_cases_per_1m_population

        var suici = []
        for (let index = 0; index < paises.length; index++) {
                if (inters.includes(paises[index].country_name)) {
                    var punto1= paises[index].deaths_per_1m_population.replace(",", ".")
                    estadisdeath.push(punto1)
                    for (let j = 0; j < miApi.length; j++) { //para no hacer mil llamadas a mi api
                        if (miApi[j].country==minusMayus(paises[index].country_name)) {
                            suici.push(miApi[j].both_sex)
                        }
                        
                    }
            }
            
        }

        var options = {
            series: [{
            name: 'Muertes por cada millón de habitantes',
            data: estadisdeath
            }, {
            name: 'Suicidios por cada 100.000 habitantes',
            data: suici
            }],
            chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            },
            plotOptions: {
            bar: {
                horizontal: true,
            },
            },
            stroke: {
            width: 1,
            colors: ['#fff']
            },
            title: {
            text: 'Casos de suicidio frente a coronavirus',
            align: 'center'
            },
            xaxis: {
            categories: inters,
            labels: {
                formatter: function (val) {
                return val
                }
            }
            },
            yaxis: {
            title: {
                text: undefined
            },
            },
            tooltip: {
            y: {
                formatter: function (val) {
                return val
                }
            }
            },
            fill: {
            opacity: 1
            },
            legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40
            }
            };

            var chart = new ApexCharts(document.querySelector("#chart2"), options);
            chart.render();

    }// on:load={covid}


</script>

<svelte:head>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load={population} on:load={covid}></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
</svelte:head>
<main>

    <h1>SPC Manager</h1>
    <Button outline color="success" on:click="{getSPCLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button outline color="danger" on:click="{deleteSPCALL}">
        Borrar todo
    </Button>
    <br><br>

    <!--api externa densidad-->
    <h3 style="text-align: center;">Integración API externa 1</h3>
    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
            
        </p>
    </figure>

    <br>

    <!--api externa covid--> 
    <h3 style="text-align: center;">Integración API externa 2</h3>
    <div id="chart2">
    </div>

    <!--api nando-->
    <h3 style="text-align: center;">Integración API sos1920-09</h3>
    <div id="chart">
    </div>

    <!--api dani-->
    <h3 style="text-align: center;">Integración API sos1920-02</h3>
    <div id="chart3">
    </div>

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