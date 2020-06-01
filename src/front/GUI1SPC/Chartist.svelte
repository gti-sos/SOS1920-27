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
    async function loadGraphs() {
        let MyData = [];

        const resData = await fetch("/api/v3/spc-stats");
        MyData = spc;

        var mujeres = MyData.map((dato)=> dato.female_number);
        var hombres = MyData.map((dato)=> dato.male_number);
        var paises = MyData.map((dato)=> {
            return dato.country
        });

        /*var options = {
          series: [{
          name: 'Hombres',
          data: hombres
        }, {
          name: 'Mujeres',
          data: mujeres
        }],
          chart: {
          height: 550,
          type: 'area'
        },
        dataLabels: {
          enabled: true
        },
        stroke: {
          curve: 'smooth'
        },
        xaxis: {
          type: 'category',
          categories: paises
        },
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();*/

        var chart = new Chartist.Line('.ct-chart', {
            labels: paises,
            series: [
            hombres,[],
            mujeres]
            }, {
            low: 0,
            showArea: true,
            showPoint: true,
            fullWidth: true
            });

            chart.on('draw', function(data) {
            if(data.type === 'line' || data.type === 'area') {
                data.element.animate({
                d: {
                    begin: 300 * data.index,
                    dur: 800,
                    from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                    to: data.path.clone().stringify(),
                    easing: Chartist.Svg.Easing.easeOutQuint
                }
                });
            }
        });
 }



      
</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts" on:load={loadGraphs}></script>
</svelte:head>
<main>

    <h1>SPC Manager</h1>
    <Button color="success" on:click="{getSPCLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button color="danger" on:click="{deleteSPCALL}">
        Borrar todo
    </Button> <br> <br>
    
    <div class='my-legend'>
        <h2 style="text-align: center;">Número de suicidios por cada 100,000 personas</h2>
        <div class='legend-scale'>
          <ul class='legend-labels'>
            <li><span style='background:rgb(212, 124, 124);'></span>Hombres</li>
            <li><span style='background:rgb(213, 238, 102);'></span>Mujeres</li>
          </ul>
        </div>
        </div>
        <br><br>
    <div style="width: 100%; align-content: flex-start;" class="ct-chart ct-perfect-fourth">
    </div>

</main>





<style>
    .legend-scale{
        padding-left: 45%;
    }
  .my-legend .legend-scale ul {
    

    margin: 0;
    padding: 0;
    float: left;
    list-style: none;
    }
  .my-legend .legend-scale ul li {
    display: block;
    float: left;
    width: 50px;
    margin-bottom: 6px;
    text-align: center;
    font-size: 80%;
    list-style: none;
    }
  .my-legend ul.legend-labels li span {
    display: block;
    float: left;
    height: 15px;
    width: 50px;
    }
  .my-legend .legend-source {
    font-size: 70%;
    color: #999;
    clear: both;
    }
  .my-legend a {
    color: #777;
    }


 @import url(https://fonts.googleapis.com/css?family=Roboto);

body {
  font-family: Roboto, sans-serif;
}

#chart {
  max-width: 100%;
  margin: 35px auto;
}
</style>