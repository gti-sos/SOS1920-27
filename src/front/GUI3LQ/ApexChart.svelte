<script>
    import{
        onMount
    } from "svelte";
    import{
        pop
    } from "svelte-spa-router";
    import{
        Alert
    } from "sveltestrap";

    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
    import { Collapse, CardBody, Card } from "sveltestrap";
    let isOpen = false;

    //ALERTAS
    let visible = false;
    let color = "danger";

    let errorMSG = "";
    onMount(getLQ);

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
            totaldata = 12;
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
            getLQ();
            visible = true;
            if(res.status==200){
                totaldata=0;
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


</script>
<main>
<head>
	<!-- Load plotly.js into the DOM -->
	<script src='https://cdn.plot.ly/plotly-latest.min.js'></script>
</head>

<body>
	<div id='myDiv'><!-- Plotly chart will be drawn inside this DIV --></div>
</body>
</main>