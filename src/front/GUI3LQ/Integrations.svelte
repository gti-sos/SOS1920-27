<script>
    import{
        onMount
    } from "svelte";
    import{
        Alert
    } from "sveltestrap";

    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";

    //ALERTAS
    let visible = false;
    let color = "danger";

    let errorMSG = "";
    let lq =[];
    onMount(getLQ);

    //funcion transofrmar a minuscula
    function toMinus(palabra) {
        palabra=palabra.charAt(0).toLowerCase() + palabra.slice(1);
        return palabra;
    }

    //funcion transofrmar a mayuscula
    function toMayusc(palabra) {
        palabra=palabra.charAt(0).toUpperCase() + palabra.slice(1);
        return palabra;
    }

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

    //api externa 1 (coronavirus)

    async function coronavirus(){

    let covid = [];
    let lifeq = [];
    let lista_comun = [];
    let confirmados = [];

    const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    lifeq = await res1.json();
    const res2 = await fetch("https://coronavirus-tracker-api.herokuapp.com/v2/locations");
    covid = await res2.json();

    var paises = covid.locations.map(dato=> dato.country);

    var misPaises = lifeq.map(dato=> dato.country);
    var salud = [];

    //para tener los países comunes
    for (let i = 0; i < misPaises.length; i++) {
        for (let j = 0; j < paises.length; j++) {
            if(misPaises[i].localeCompare(toMinus(paises[j])) == 0){
                lista_comun.push(misPaises[i])
            }
            
        }
        
    }
    let conjunto = new Set(lista_comun);

    let lista_final = Array.from(conjunto);

    let lista = [];
    //coger los casos confirmados de covid por cada pais de la lista comun final
    for (let index = 0; index < lista_final.length; index++) {
        var llamada = await fetch("https://coronavirus-tracker-api.herokuapp.com/v2/locations?country="+lista_final[index]);
        var datos = await llamada.json();
        lista.push(datos.latest.confirmed)
        
    }

    //coger salud paises comunes
    for (let index = 0; index < lifeq.length; index++) {
        if (lista_final.includes(lifeq[index].country)) {
            salud.push(lifeq[index].health)
        }
        
    }
    
    //grafica
    Highcharts.chart('container1', {
  chart: {
    type: 'column'
  },
  title: {
    text: 'Comparación del nivel de salud de cada país respecto a los casos confirmados por Covid-19'
  },
  xAxis: {
    categories: lista_final
  },
  yAxis: [{
    min: 0,
    title: {
      text: 'Nivel de Salud'
    }
  }, {
    title: {
      text: 'Casos confirmados por covid'
    },
    opposite: true
  }],
  legend: {
    shadow: false
  },
  tooltip: {
    shared: true
  },
  plotOptions: {
    column: {
      grouping: false,
      shadow: false,
      borderWidth: 0
    }
  },
  series: [{
    name: 'Nivel de Salud',
    color: 'rgba(165,170,217,1)',
    data: salud,
    pointPadding: 0.3,
    pointPlacement: -0.2
  }, {
    name: 'Casos confirmados por covid',
    color: 'rgba(248,161,63,1)',
    data: lista,
    tooltip: {
      valuePrefix: '',
      valueSuffix: ' '
    },
    pointPadding: 0.3,
    pointPlacement: 0.2,
    yAxis: 1
  }]
});


    }

  //api externa 2
  

  
  async function apiexterna2(){
    let datos_externa = [];
    let lifeq = [];
    let lista_comun = [];
    let coste = [];

    const res1 = await fetch("https://restcountries-v1.p.rapidapi.com/all", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "restcountries-v1.p.rapidapi.com",
		"x-rapidapi-key": "0f1c9a6651mshcc6fb880746f7d2p18a345jsna7eda5bbbed3"
    }
    
});
  datos_externa = await res1.json();

  const res2 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
  lifeq = await res2.json();

  var misPaises = lifeq.map(dato=> dato.country);
  var paises = datos_externa.map(datos=>datos.name)

    //para tener los países comunes
    for (let i = 0; i < misPaises.length; i++) {
        for (let j = 0; j < paises.length; j++) {
            if(misPaises[i].localeCompare(toMinus(paises[j])) == 0){
                lista_comun.push(misPaises[i])
            }
        }
        
    }

    let conjunto = new Set(lista_comun);

let lista_final = Array.from(conjunto);

let lista = [];
//
for (let index = 0; index < lista_final.length; index++) {
    var llamada = await fetch("https://restcountries-v1.p.rapidapi.com/name/"+toMayusc(lista_final[index]), {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "restcountries-v1.p.rapidapi.com",
		"x-rapidapi-key": "0f1c9a6651mshcc6fb880746f7d2p18a345jsna7eda5bbbed3"
    }
    
});
    var datos = await llamada.json();
    lista.push(datos.map(x =>x.gini)[0])
    
}
    //coger nivel de coste de los paises comunes
    for (let index = 0; index < lifeq.length; index++) {
        if (lista_final.includes(lifeq[index].country)) {
            coste.push(lifeq[index].costs)
        }
        
    }

var options = {
          series: [
          {
            name: "Calidad de vida",
            data: coste
          },
          {
            name: "Gini",
            data: lista
          }
        ],
          chart: {
          height: 350,
          type: 'line',
          dropShadow: {
            enabled: true,
            color: '#000',
            top: 18,
            left: 7,
            blur: 10,
            opacity: 0.2
          },
          toolbar: {
            show: false
          }
        },
        colors: ['#77B6EA', '#545454'],
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: 'smooth'
        },
        title: {
          text: 'Comparación nivel económico del país junto a su coeficiente de Gini (medida de desigualdad de ingresos)',
          align: 'left'
        },
        grid: {
          borderColor: '#e7e7e7',
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
          },
        },
        markers: {
          size: 1
        },
        xaxis: {
          categories: lista_final,
          title: {
            text: 'Países'
          }
        },
        yaxis: {
          title: {
            text: ''
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          floating: true,
          offsetY: -25,
          offsetX: -5
        }
        };

        var chart = new ApexCharts(document.querySelector("#chart1"), options);
        chart.render();


  }


  //api externa 3

  async function apiexterna3(){
    let datos_externa = [];
    let lifeq = [];
    let lista_comun = [];
    let confirmados = [];

    const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    lifeq = await res1.json();
    const res2 = await fetch("https://sos1920-27.herokuapp.com/v1/Country/getCountries");
    datos_externa = await res2.json();

    var paises = datos_externa.Response.map(x=>x.Name);
    var misPaises = lifeq.map(dato=> dato.country);
    var total = [];

    //para tener los países comunes
    for (let i = 0; i < misPaises.length; i++) {
        for (let j = 0; j < paises.length; j++) {
            if(misPaises[i].localeCompare(toMinus(paises[j])) == 0){
                lista_comun.push(misPaises[i])
            }
            
        }
        
    }
    let conjunto = new Set(lista_comun);

    let lista_final = Array.from(conjunto);

    let lista = [];
    //
    for (let index = 0; index < lista_final.length; index++) {
        var llamada = await fetch("https://sos1920-27.herokuapp.com/v1/Country/getCountries?pName="+lista_final[index]);
        var datos = await llamada.json();
        lista.push(datos.Response.map(x=>x.NumericCode))
        
    }

    //coger calidad total paises comunes
    for (let index = 0; index < lifeq.length; index++) {
        if (lista_final.includes(lifeq[index].country)) {
            total.push(lifeq[index].total)
        }
        
    }
    var options = {
          series: [
          {
            name: "Calidad de vida",
            data: total
          },
          {
            name: 'Código Numérico del país',
            data: lista
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
          width: [5, 7],
          curve: 'straight',
          dashArray: [0, 8, 5]
        },
        title: {
          text: 'Comparación calidad de vida de un país con su código numérico',
          align: 'left'
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
          categories: lista_final,
        },
        tooltip: {
          y: [
            {
              title: {
                formatter: function (val) {
                  return val + " (mins)"
                }
              }
            },
            {
              title: {
                formatter: function (val) {
                  return val + " per session"
                }
              }
            },
            {
              title: {
                formatter: function (val) {
                  return val;
                }
              }
            }
          ]
        },
        grid: {
          borderColor: '#f1f1f1',
        }
        };

        var chart = new ApexCharts(document.querySelector("#chart2"), options);
        chart.render();

  }


  //api externa 4


  

  //api sos 1920-09 renewable-sources-stats

  async function renewable(){
  let lifeq=[]
  let renovables=[]
  let lista_comun = [];
  let nivel_total = [];
  let lista=[];
    
    const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    lifeq = await res1.json();
    const res2 = await fetch("https://sos1920-09.herokuapp.com/api/v4/renewable-sources-stats");
    renovables = await res2.json();

    var misPaises = lifeq.map(dato=> dato.country);
    var paises = renovables.map(dato=>dato.country);

    //para tener los países comunes
    for (let i = 0; i < misPaises.length; i++) {
        for (let j = 0; j < paises.length; j++) {
            if(misPaises[i].localeCompare(toMinus(paises[j])) == 0){
                lista_comun.push(misPaises[i])
            }
            
        }
        
    }
    let conjunto = new Set(lista_comun);

    let lista_final = Array.from(conjunto);

    //coger valor total paises comunes
    for (let index = 0; index < lifeq.length; index++) {
        if (lista_final.includes(lifeq[index].country)) {
            nivel_total.push(lifeq[index].total)
        }
        
    }

    //coger los porcentajes de uso de energias renovables por cada pais de la lista comun final
    for (let index = 0; index < lista_final.length; index++) {
        var llamada = await fetch("https://sos1920-09.herokuapp.com/api/v4/renewable-sources-stats?country="+toMayusc(lista_final[index]));
        var datos = await llamada.json();
        lista.push(datos[0]["percentage-re-total"])
        

 
    }




    //grafica

    Highcharts.chart('container2', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Comparación del porcentaje de uso de energías renovables de cada país respecto a su calidad de vida'
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: lista_final,
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Porcentaje %'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} %</b></td></tr>',
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
        name: 'Nivel calidad de vida',
        data: nivel_total

    }, {
        name: 'Porcentaje de uso de energías renovables',
        data: lista

    }]
});


  }
  //api sos 1920-12 overdose-deaths
  async function overdose(){
    let lifeq=[]
    let kills=[]
    let lista_comun = [];
    let nivel_total = [];
    let lista = [];
    const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    lifeq = await res1.json();
    const res2 = await fetch("https://sos1920-12.herokuapp.com/api/v2/overdose-deaths");
    kills = await res2.json();

    var misPaises = lifeq.map(dato=> dato.country);
    var paises = kills.map(dato=>dato.country);

    //para tener los países comunes
    for (let i = 0; i < misPaises.length; i++) {
        for (let j = 0; j < paises.length; j++) {
            if(misPaises[i].localeCompare(toMinus(paises[j])) == 0){
                lista_comun.push(misPaises[i])
            }
            
        }
        
    }
    let conjunto = new Set(lista_comun);

    let lista_final = Array.from(conjunto);


    //coger valor del total paises comunes
    for (let index = 0; index < lifeq.length; index++) {
        if (lista_final.includes(lifeq[index].country)) {
            nivel_total.push(lifeq[index].total)
        }
        
    }

    //coger los porcentajes de uso de energias renovables por cada pais de la lista comun final
    for (let index = 0; index < lista_final.length; index++) {
        var llamada = await fetch("https://sos1920-12.herokuapp.com/api/v2/overdose-deaths?country="+toMayusc(lista_final[index])+"&year=2016");
        var datos = await llamada.json();
        lista.push(datos[0].death_total)
        

 
    }

    //grafica
    Highcharts.chart('container3', {
  chart: {
    type: 'bar'
  },
  title: {
    text: 'Comparación del número de muertes por sobredosis de cada país respecto a su calidad de vida'
  },
  subtitle: {
    text: ''
  },
  xAxis: {
    categories: lista_final,
    title: {
      text: null
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Personas muertas por sobredosis',
      align: 'high'
    },
    labels: {
      overflow: 'justify'
    }
  },
  tooltip: {
    valueSuffix: ''
  },
  plotOptions: {
    bar: {
      dataLabels: {
        enabled: true
      }
    }
  },
  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'top',
    x: -40,
    y: 80,
    floating: true,
    borderWidth: 1,
    backgroundColor:
      Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
    shadow: true
  },
  credits: {
    enabled: false
  },
  series: [{
    name: 'Calidad de vida',
    data: nivel_total, color:'#5BA961'
  }, {
    name: 'Muertes por sobredosis',
    data: lista, color:'#9572C2'
  }]
});
  }

 //GET LoadInitialDataIsabel
  async function getLQLoadInitialDataIsabel() {

console.log("Fetching vehicles...");
await fetch("https://sos1920-04.herokuapp.com/api/v1/vehicles/loadinitialdata")
}

    //api sos 1920-04 vehicles

    async function vehicles(){
    let lifeq=[]
    let vehiculos=[]
    let suma=0
    const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    lifeq = await res1.json();
    if (lifeq = null){
      getLQLoadInitialDataIsabel()
    } else{
      const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    }
    lifeq = await res1.json();
    const res2 = await fetch("https://sos1920-04.herokuapp.com/api/v1/vehicles");
    vehiculos = await res2.json();

    var misPaises = lifeq.map(dato=> dato.country);
    var spain = vehiculos.map(dato=>dato.total);


//suma todo el trafico de españa
    for (let index = 0; index < vehiculos.length; index++) {
      suma += spain[index];      
    }
    suma/100000
//guarda el valor del clima y salud de españa

var clima = lifeq.filter(x=> x.country=="spain").map(dato=> dato.climate)[0] * 100000;
var salud = lifeq.filter(x=> x.country=="spain").map(dato=> dato.health)[0] * 100000;

// Build the chart
Highcharts.chart('container4', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  title: {
    text: 'Comparación del total del tráfico español respecto a su nivel de clima y salud'
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  accessibility: {
    point: {
      valueSuffix: '%'
    }
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true
      },
      showInLegend: true
    }
  },
  series: [{
    name: 'Cantidad',
    colorByPoint: true,
    data: [{
      name: 'Número total del tráfico español ÷10.0000',
      y: suma
    }, {
      name: 'Nivel de Salud español x10.0000',
      y: salud
    }, {
      name: 'Nivel del Clima español x10.0000',
      y: clima
    }]
  }]
});

    }
</script>

<svelte:head>
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="https://code.highcharts.com/modules/export-data.js" on:load="{renewable}" on:load="{overdose}" on:load="{coronavirus}" on:load="{vehicles}"></script>
<script src="https://cdn.jsdelivr.net/npm/apexcharts"  on:load="{apiexterna2}" on:load="{apiexterna3}"></script>

</svelte:head>

<main>
    <h3>API Externa 1 - <a href="https://coronavirus-tracker-api.herokuapp.com/v2/locations">Link EndPoint</a></h3>
    <figure class="highcharts-figure">
  <div id="container1"></div>
  <p class="highcharts-description">
    En esta gráfica podemos ver la comparación del nivel de salud de cada país respecto a los casos confirmados por la nueva pandemia mundial, el Covid-19
  </p>
</figure>

<h3>API Externa 2 - <a href="https://restcountries-v1.p.rapidapi.com/all">Link EndPoint</a></h3>

    
  <div id="chart1"></div>

<h3>API Externa 3 - <a href="http://countryapi.gear.host/v1/Country/getCountries">Link EndPoint</a></h3>

    
  <div id="chart2"></div>


<h3>API Externa 4 - <a href="http://countryapi.gear.host/v1/Country/getCountries">Link EndPoint</a></h3>

    
  <div id="chart3"></div>



<h3>API sos1920-09 - <a href="http://sos1920-09.herokuapp.com/api/v4/renewable-sources-stats">Link EndPoint</a></h3>

<figure class="highcharts-figure">
  <div id="container2"></div>
  <p class="highcharts-description">
    En esta gráfica podemos ver la comparación del porcentaje de uso de energías renovables de cada país respecto a su calidad de vida, ambos en porcentaje
  </p>
</figure>

<h3>API sos1920-12 - <a href="https://sos1920-12.herokuapp.com/api/v2/overdose-deaths">Link EndPoint</a></h3>
<figure class="highcharts-figure">
  <div id="container3"></div>
  <p class="highcharts-description">
    En esta gráfica podemos ver la comparación del número de muertes por sobredosis de cada país respecto a su calidad de vida (la calidad de vida está en porcentaje)
  </p>
</figure>



<h3>API sos1920-04 - <a href="https://sos1920-04.herokuapp.com/api/v1/vehicles">Link EndPoint</a></h3>
<figure class="highcharts-figure">
  <div id="container4"></div>
  <p class="highcharts-description">
    En esta gráfica podemos ver la cantidad de tráfico en España (dividido por 10.000) junto al nivel del clima y salud del estado español (multiplicados por 10.000)
  </p>
</figure>

</main>


<style>
    .highcharts-figure, .highcharts-data-table table {
  min-width: 310px; 
  max-width: 800px;
  margin: 1em auto;
}

#container1 {
  height: 400px;
}

#container2 {
  height: 400px;
}

#container3 {
  height: 400px;
}

#container4 {
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