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
    
    //INSERT EJEMPLOS PARA APIS
    async function insertExamplesSPC() {
        let newExamples = [{
            country: "sweden",
            both_sex: "11.7",
            male_rank: "69",
            male_number: "15.8",
            female_rank: "32",
            female_number: "7.4",
            ratio: "2.14",
            year: "2013",
            continent: "europe"
        },{
            country: "germany",
            both_sex: "9.1",
            male_rank: "90",
            male_number: "13.6",
            female_rank: "79",
            female_number: "4.8",
            ratio: "2.83",
            year: "2013",
            continent: "europe"
        },{
            country: "canada",
            both_sex: "10.4",
            male_rank: "72",
            male_number: "15.1",
            female_rank: "59",
            female_number: "5.8",
            ratio: "2.6",
            year: "2013",
            continent: "north america"
        }
        ];

        for (let index = 0; index < newExamples.length; index++) {
            console.log("Inserting examples spc..." + JSON.stringify(newExamples[index]));
            const res = await fetch("/api/v2/spc-stats", {
                method: "POST",
                body: JSON.stringify(newExamples[index]),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(function (res) {
                
                visible = true;
                if (res.status==200) {
                    console.log("Inserted "+newExamples[index].country +" spc.");            
                }else if (res.status== 400) {
                    console.log("BAD REQUEST");            
                }else if (res.status==409) {
                    console.log("This data already exits");            
                } else {
                    console.log("BAD REQUEST");
                }
            });

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
            paisesSpc[index]=paisesSpc[index].charAt(0).toUpperCase() + paisesSpc[index].slice(1)
            
        }

        intersecMayus = paisesSpc.filter(x => paisesVehicu.includes(x)); //ya tengo los paises que coinciden

        //hago lista para poder tenerlo en minus otra vez y buscar con mi api
        for (let index = 0; index < intersecMayus.length; index++) {
            intersecMinus.push(intersecMayus[index].charAt(0).toLowerCase() + intersecMayus[index].slice(1))
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

        console.log(listaSuicidios)
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
      
</script>

<svelte:head>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load={population} on:load={vehiculos}></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

</svelte:head>
<main>

    <h1>SPC Manager</h1>
    <Button color="success" on:click="{getSPCLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button color="danger" on:click="{deleteSPCALL}">
        Borrar todo
    </Button>
    <Button outline  color="primary" on:click={insertExamplesSPC}>Insertar ejemplos</Button>
    <br><br>

    <!--api externa densidad-->
    <h3 style="text-align: center;">Integración API externa 1</h3>
    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
            
        </p>
    </figure>

    <br>

    <!--api externa densidad--> 
    <h3 style="text-align: center;">Integración API externa 2</h3>

    <!--api nando-->
    <h3 style="text-align: center;">Integración API sos1920-09</h3>
    <div id="chart">
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