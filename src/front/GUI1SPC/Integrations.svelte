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
 
    //densidad de españa
    var denspain = 0;

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
        await fetch("/api/v3/spc-stats/loadInitialData");
        const res = await fetch("/api/v3/spc-stats");
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
        const res = await fetch("/api/v3/spc-stats/", {
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
        const res = await fetch("/api/v3/spc-stats");
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

        const resData = await fetch("/api/v3/spc-stats");
        MyData = await resData.json();
        
        //mi api
        var ambos = [];
        var paises = MyData.map((dato)=> dato.country);

        for (let index = 0; index < paises.length; index++) {
            const densityApi = await fetch("https://restcountries.eu/rest/v2/name/" + paises[index]);
            var density =  await densityApi.json();
            listaDensidad.push(density[0].population);       
            ambos.push(MyData[index].both_sex*density[0].population/100); //deberia ser entre 100000 pero si no apena se ve
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

            const suicidiosApi = await fetch("/api/v3/spc-stats?country=" + intersecMinus[index]);
            var resSuci =  await suicidiosApi.json();

            const densityApi = await fetch("https://restcountries.eu/rest/v2/name/" + intersecMinus[index]);
            var density =  await densityApi.json();
            listaSuicidios.push(parseInt(resSuci[0].both_sex*density[0].population/10000)); //entre 10000 para que se vea bien      
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
        let listaDonut = []
        const res = await fetch("https://sos1920-02.herokuapp.com/api/v2/evolution-of-cycling-routes?year=2015");
        dataBicis = await res.json();

        //hacemos map para el carril metropolitano
        listaDonut.push(parseInt(dataBicis.map(dato=> dato.metropolitan).reduce((a, b) => a + b, 0)))
        listaDonut.push(parseInt(dataBicis.map(dato=> dato.urban).reduce((a, b) => a + b, 0)))
        listaDonut.push(parseInt(dataBicis.map(dato=> dato.rest).reduce((a, b) => a + b, 0)))

        var espa = spc.filter(dato => dato.country=="spain")

        const densityApi = await fetch("https://restcountries.eu/rest/v2/name/spain");
        var density =  await densityApi.json();
        
        //meto en variable españa para no llamar mil veces
        denspain = density[0].population

        listaDonut.push(parseInt(espa.map(x=>x.both_sex)[0]*denspain/100000))

        var options = {
          series: listaDonut,
          chart: {
          width: '70%',
          type: 'pie',
        },
        grid: {
          padding: {
            left: 300,
            right: 0
          }
        },
        labels: ["Carril Metropolitano", "Carril Urbano", "Carril Otros", "Suicidios"],
        theme: {
          monochrome: {
            enabled: false
          }
        },
        plotOptions: {
          pie: {
            dataLabels: {
              offset: -5
            }
          }
        },
        title: {
          text: "",
          align: 'right'
        },
        dataLabels: {
          formatter(val, opts) {
            const name = opts.w.globals.labels[opts.seriesIndex]
            return [name, val.toFixed(1) + '%']
          }
        },
        legend: {
          show: false
        }
        };

        var chart = new ApexCharts(document.querySelector("#chart4"), options);
        chart.render();    }// on:load={bicis}

    //api sos1920-04 roads kilometros de carretera
    async function roads(){
        let dataRoads = []; //guardamos todos los datos de bicis de 2015
        let dataSui = []
        let MyData = []

        const resData = await fetch("/api/v3/spc-stats");
        MyData = await resData.json();


        const res2 = await fetch("https://sos1920-04.herokuapp.com/api/v1/roads/");
        dataRoads = await res2.json();
        
        const densityApi = await fetch("https://restcountries.eu/rest/v2/name/spain");
        var density =  await densityApi.json();
        
        var spainSui=parseInt(MyData.filter(x => x.country=="spain").map(x=>x.both_sex)[0]*denspain/100000)
        //repito la variable para que se  me quede en una linea recta al menos
        for (let index = 0; index < dataRoads.length; index++) {
            dataSui.push(spainSui)    
        }

        var totalRoads = dataRoads.map(dato=> dato.total)//hacemos map para coger el total de distancia
        var totalProvincia =dataRoads.map(dato=> dato.province)

        var options = {
                series: [{
                name: 'Total de carreteras por provincia',
                type: 'column',
                data: totalRoads
                }, {
                name: 'Nº suicidios en un año',
                type: 'line',
                data: dataSui
                }],
                chart: {
                height: 350,
                type: 'line',
                },
                stroke: {
                width: [0, 4]
                },
                title: {
                text: 'Relación total distancia de carreteras en España con el número de víctimas de suicidio',
                align: 'center'
                },
                dataLabels: {
                enabled: false,
                enabledOnSeries: [1]
                },
                labels:totalProvincia,
                xaxis: {
                type: 'category'
                },
                yaxis: [{
                title: {
                    text: 'Total de carreteras por provincia',
                },
                
                }, {
                opposite: true,
                title: {
                    text: 'Nº suicidios en un año'
                }
            }]
        };

        var chart = new ApexCharts(document.querySelector("#chart3"), options);
        chart.render();
    } 
    // on:load={roads}

    //api sos1920-06 roads kilometros de carretera
    async function hospitalized(){
    let dataHospi = []; //guardamos todos los datos de bicis de 2015

    const res3 = await fetch("/api/v2/not-hospitalized-stats"+"?year=2014");
    dataHospi = await res3.json();
    
    var interHospi = []
    var urbanHospi = []
    //hacemos map para el interurban y urban
    for (let index = 0; index < spc.length; index++) {
      if (spc[index].country=="spain") {
        interHospi.push(dataHospi.map(dato=>  dato.interurban).reduce((a, b) => a + b, 0))
        urbanHospi.push(dataHospi.map(dato=>  dato.urban).reduce((a, b) => a + b, 0))
      } else {
        interHospi.push(0)
        urbanHospi.push(0)

      }      
    }
    

    var paises = spc.map(dato=>  dato.country)
    var suici = spc.map(dato=>  dato.both_sex)
    var suiciXdensidad = []
    for (let index = 0; index < paises.length; index++) {
        const densityApi = await fetch("https://restcountries.eu/rest/v2/name/" + paises[index]);
        var density =  await densityApi.json();
        suiciXdensidad.push(parseInt(suici[index]*denspain/100000));           
    }
    var suici = spc.map(dato=>  dato.both_sex)

    var options = {
      series: [{
      name: 'No hospitalizados interurbanos',
      type: 'column',
      data: interHospi
    }, {
      name: 'No hospitalizados urbanos',
      type: 'column',
      data: urbanHospi
    }, {
      name: 'Suicidios en un año',
      type: 'line',
      data: suiciXdensidad
    }],
      chart: {
      height: 350,
      type: 'line',
      stacked: false
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: [1, 1, 4]
    },
    title: {
      text: 'Relación entre suicidios y personas no hospitalizadas',
      align: 'center',
      offsetX: 0
    },
    xaxis: {
      categories: paises,
    },
    yaxis: [
      {
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#008FFB'
        },
        labels: {
          style: {
            colors: '#008FFB',
          }
        },
        title: {
          text: "No hospitalizados interurbanos",
          style: {
            color: '#008FFB',
          }
        },
        tooltip: {
          enabled: true
        }
      },
      {
        seriesName: 'Income',
        opposite: false,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#00E396'
        },
        labels: {
          style: {
            colors: '#00E396',
          }
        },
        title: {
          text: "No hospitalizados urbanos",
          style: {
            color: '#00E396',
          }
        },
      },
      {
        seriesName: 'Revenue',
        opposite: true,
        axisTicks: {
          show: true,
        },
        axisBorder: {
          show: true,
          color: '#FEB019'
        },
        labels: {
          style: {
            colors: '#FEB019',
          },
        },
        title: {
          text: "Suicidios en un año",
          style: {
            color: '#FEB019',
          }
        }
      },
    ],
    tooltip: {
      fixed: {
        enabled: true,
        position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
        offsetY: 30,
        offsetX: 60
      },
    },
    legend: {
      horizontalAlign: 'left',
      offsetX: 40
    }
    };

    var chart = new ApexCharts(document.querySelector("#chart5"), options);
    chart.render();
} 
    // on:load={hospitalized}

    //api  covid
    async function covid(){
        let dataCovid = []; //guardamos todos los datos de bicis de 2015
        let miApi = [];
        let miApiMayus = []

        const res = await fetch("https://akashraj.tech/corona/api");
        dataCovid = await res.json();
        
        const res2 = await fetch("https://sos1920-27.herokuapp.com/api/v3/spc-stats");
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
                    for (let j = 0; j < miApi.length; j++) { //para no hacer mil llamadas a mi api
                        if (miApi[j].country==minusMayus(paises[index].country_name)) {
                          const densityApi = await fetch("https://restcountries.eu/rest/v2/name/" + miApi[j].country);
                          var density =  await densityApi.json();
                          suici.push(parseInt(miApi[j].both_sex*density[0].population/100000))
                          estadisdeath.push(parseInt(punto1*density[0].population/1000000))
                        }
                        
                    }
            }
            
        }

        var options = {
            series: [{
            name: 'Muertes por cada millón de habitantes',
            data: estadisdeath
            }, {
            name: 'Suicidios en un año',
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
            width: 0,
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

    }
    // on:load={covid}

    //api  airQuality
    async function airQuality(){
        let dataAirQuality = [];
        let miApi = [];
        let air = []
        let paisesFinal = [] //paises que coinciden

        const suicidiosApi2 = await fetch("/api/v3/spc-stats?");
        miApi =  await suicidiosApi2.json();

        var paises = miApi.map(x => x.country)
        var suici = miApi.map(x => x.both_sex)      
        for (let index = 0; index < paises.length; index++) {
            const resAir = await fetch("https://api.waqi.info/feed/"+paises[index]+"/?token=3c7df8258ed0ff3424b1bb3053c7c7d50dfbefe3");
            dataAirQuality = await resAir.json();

            if (dataAirQuality.status=="ok") {
              air.push(dataAirQuality.data.aqi)
            }
            else air.push(null)
        }

        var options = {
          series: [{
          name: 'Nº suicidios por cada 100.000 habitantes',
          data: suici
        }, {
          name: 'Calidad de aire (a mayor, peor calidad)',
          data: air
        }],
          chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          },
          animations: {
            enabled: false
          }
        },
        stroke: {
          width: [5,5],
          curve: 'straight'
        },
        labels: paises,
        title: {
          text: 'Relación calidad del aire y número de suicidios por país',
          align: "center"
        },
        xaxis: {
        },
        };

        var chart = new ApexCharts(document.querySelector("#chart6"), options);
        chart.render();
    }
    // on:load={airQuality}

</script>

<svelte:head>
    <!--<script src="https://code.highcharts.com/modules/accessibility.js" on:load={population} on:load={airQuality} on:load={bicis} on:load={hospitalized} on:load={covid} on:load={vehiculos} on:load={roads}></script>-->
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load={population}></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

    <!-- youtbe -->
    

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

    <div class="container">
      <p>Login with Google</p>
      <button class="btn green" id="enter-button">Log In</button>
      <button class="btn green" id="exit-button">Log Out</button>
      <br />
      <div id="content">
        <div class="row">
          <div id="channel-data" class="col s12"></div>
        </div>
      </div>
    </div>

    <!--api externa densidad-->
    <div style="text-align: center;" class="contenedor">
    <h3>Integración API externa 1</h3>
    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description"></p>
    </figure><p>Fuente: <a href="https://restcountries.eu/rest/v2/all">https://restcountries.eu/rest/v2/all</a></p>
    </div>
    <br>

    <!--api externa covid--> 
    <div style="text-align: center;" class="contenedor">
    <h3>Integración API externa 2</h3>
    <div id="chart2">
    </div><p>Fuente: <a href="https://akashraj.tech/corona/">https://akashraj.tech/corona/</a></p></div> <br>

    <!--api externa covid--> 
    <div style="text-align: center;" class="contenedor">
      <h3>Integración API externa 3</h3>
      
      <div id="chart6">
    </div><p>Fuente: <a href="https://waqi.info/#/c/42.276/15.734/5.4z">https://waqi.info/#/c/42.276/15.734/5.4z</a></p></div> <br>
      
    <!--api nando-->
    <div class="contenedor">
    <h3 style="text-align: center;">Integración API sos1920-09</h3>
    <div id="chart">
    </div></div> <br>

    <!--api dani-->
    <div class="contenedor">
    <h3 style="text-align: center;">Integración API sos1920-04</h3>
    <div id="chart3">
    </div></div> <br>

    <!--api ana-->
    <div class="contenedor">
    <h3 style="text-align: center;">Integración API sos1920-02</h3>
    <p style="text-align: center;"><b>Distancia de carriles bicis en España en relación al número de suicidios en un año</b></p>
    <div id="chart4">
    </div></div> <br>

    <!--api juan-->
    <div class="contenedor">
      <h3 style="text-align: center;">Integración API sos1920-06</h3>
      <div id="chart5">
      </div></div> <br>
    
</main>

<style>
#content,#enter-button,#exit-button{display: none;}
    h3{
        text-decoration: underline;
    }
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

.contenedor{
    border: 2px solid LightGray;
  border-radius: 5px;
  padding-top: 2%;
}
</style>