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
    console.log(toMinus("Hola"));

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
    const res2 = await fetch("https://coronavirus-tracker-api.herokuapp.com/v2/locations");
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
    //coger los casos confirmados de covid por cada pais
    for (let index = 0; index < lista_final.length; index++) {
        var llamada = await fetch("https://coronavirus-tracker-api.herokuapp.com/v2/locations?country="+lista_final[index]);
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
    Highcharts.chart('container', {
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




</script>

<svelte:head>
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="https://code.highcharts.com/modules/export-data.js" on:load="{coronavirus}"></script>
</svelte:head>

<main>
    <h3>API Externa 1 - <a href="https://coronavirus-tracker-api.herokuapp.com/v2/locations">Link EndPoint</a></h3>
    <figure class="highcharts-figure">
  <div id="container"></div>
  <p class="highcharts-description">
    En esta gráfica podemos ver la comparación del nivel de salud de cada país respecto a los casos confirmados por la nueva pandemia mundial, el Covid-19
  </p>
</figure>

<h3>API Externa 2 - <a href="https://coronavirus-tracker-api.herokuapp.com/v2/locations">Link EndPoint</a></h3>

<h3>API sos1920-09 - <a href="http://sos1920-09.herokuapp.com/api/v4/renewable-sources-stats">Link EndPoint</a></h3>

<h3>API sos1920-12 - <a href="https://sos1920-12.herokuapp.com/api/v2/overdose-deaths">Link EndPoint</a></h3>

<h3>API sos1920-04 - <a href="https://sos1920-04.herokuapp.com/api/v1/vehicles">Link EndPoint</a></h3>


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