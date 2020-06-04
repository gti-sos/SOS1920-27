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

    //GET
    async function getLQ() {
        console.log("Fetching lq...");
        const res = await fetch("api/v2/lq-stats?limit=10&offset=1");
        LoadGraphs();
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
        LoadGraphs();

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
            LoadGraphs();
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

    //gráfica
    async function LoadGraphs(){
        let MyData = [];

        const resData = await fetch("/api/v2/lq-stats");
        MyData = await resData.json();

        //xAxis
        var paises = MyData.map((dato)=> [dato.country]);

        //yAxis

        var stab = MyData.map((dato)=> [dato.stability]);

        var righ = MyData.map((dato)=> [dato.right]);

        var heal = MyData.map((dato)=> [dato.health]);

        var secu = MyData.map((dato)=> [dato.security]);

        var clima = MyData.map((dato)=> [dato.climate]);

        var cost = MyData.map((dato)=> [dato.costs]);

        var popu = MyData.map((dato)=> [dato.popularity]);


        Highcharts.chart('container', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Calidad de vida por países'
            },
            xAxis: {
                categories: paises
            },
            yAxis: {
                min: 0,
                title: {
                    text: ''
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: [{
                name: 'Stability',
                data: stab
            }, {
                name: 'Right',
                data: righ
            }, {
                name: 'Health',
                data: heal
            }, {
                name: 'Security',
                data: secu
            }, {
                name: 'Climate',
                data: clima
            }, {
                name: 'Costs',
                data: cost
            }, {
                name: 'Popularity',
                data: popu
            }]
        });


};
</script>


<svelte:head>
    <script src="https://code.highcharts.com/modules/export-data.js"on:load="{LoadGraphs}"></script>
</svelte:head>

<main>
    <h1>LQ Manager</h1>
    <Button color="primary" on:click="{getLQLoadInitialData}">
        Reiniciar ejemplos iniciales
    </Button>
    <Button color="danger" on:click="{deleteLQALL}">
        Borrar todo
    </Button>
    <figure class="highcharts-figure">
        <div id="container"></div>
        <p class="highcharts-description">
            En esta gráfica veremos la clasificación de los países dependiendo de su calidad de vida basándonos en algunos datos de dichos países, como puede ser su popularidad, clima, seguridad, etc.
        </p>
    </figure>
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