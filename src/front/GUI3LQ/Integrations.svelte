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
    const res2 = await fetch("https://coronavirus-tracker-api.herokuapp.com/v2/locations",{mode:'cors'});
    covid = await res2.json();

    var paises = covid.locations.map(dato=> dato.country);
    var pruieba = covid.locations.map(dato=> dato.country);

    var misPaises = lifeq.map(dato=> dato.country);
    var salud = [];

    //para tener los países comunes
    for (let i = 0; i < misPaises.length; i++) {
        for (let j = 0; j < paises.length; j++) {
            if(misPaises[i].localeCompare(toMinus(paises[j])) == 0){
                lista_comun.push(misPaises[i])
                confirmados.push()
            }
            
        }
        
    }
    let conjunto = new Set(lista_comun);

    let lista_final = Array.from(conjunto);

    let lista = [];
    //coger los casos confirmados de covid por cada pais de la lista comun final
    for (let index = 0; index < lista_final.length; index++) {
        var llamada = await fetch("https://coronavirus-tracker-api.herokuapp.com/v2/locations?country="+lista_final[index],{mode:'cors'});
        var datos = await llamada.json();
        lista.push(datos.latest.confirmed)
        
    }
    console.log(lista)

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

  //api sos 1920-09 renewable-sources-stats

  async function renewable(){
  let lifeq=[]
  let renovables=[]
    
    const res1 = await fetch("https://sos1920-27.herokuapp.com/api/v2/lq-stats")
    lifeq = await res1.json();
    const res2 = await fetch("https://sos1920-09.herokuapp.com/api/v4/renewable-sources-stats",{mode:'cors'});
    renovables = await res2.json();


    //grafica

    Highcharts.chart('container2', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Monthly Average Rainfall'
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: {
        categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ],
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
        name: 'Tokyo',
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

    }, {
        name: 'New York',
        data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

    }, {
        name: 'London',
        data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

    }, {
        name: 'Berlin',
        data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]

    }]
});


  }

</script>

<svelte:head>
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="https://code.highcharts.com/modules/export-data.js" on:load="{coronavirus}"></script>
<script src="https://code.highcharts.com/modules/export-data.js" on:load="{renewable}"></script>

</svelte:head>

<main>
    <h3>API Externa 1 - <a href="https://coronavirus-tracker-api.herokuapp.com/v2/locations">Link EndPoint</a></h3>
    <figure class="highcharts-figure">
  <div id="container1"></div>
  <p class="highcharts-description">
    En esta gráfica podemos ver la compar npación del nivel de salud de cada país respecto a los casos confirmados por la nueva pandemia mundial, el Covid-19
  </p>
</figure>

<h3>API Externa 2 - <a href="https://coronavirus-tracker-api.herokuapp.com/v2/locations">Link EndPoint</a></h3>

<h3>API sos1920-09 - <a href="http://sos1920-09.herokuapp.com/api/v4/renewable-sources-stats">Link EndPoint</a></h3>

<figure class="highcharts-figure">
  <div id="container2"></div>
  <p class="highcharts-description">
      A basic column chart compares rainfall values between four cities.
      Tokyo has the overall highest amount of rainfall, followed by New York.
      The chart is making use of the axis crosshair feature, to highlight
      months as they are hovered over.
  </p>
</figure>

<h3>API sos1920-12 - <a href="https://sos1920-12.herokuapp.com/api/v2/overdose-deaths">Link EndPoint</a></h3>

<h3>API sos1920-04 - <a href="https://sos1920-04.herokuapp.com/api/v1/vehicles">Link EndPoint</a></h3>

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