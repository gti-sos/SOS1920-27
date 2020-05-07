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

    //ALERTAS
    let visible = false;
    let color = "danger";

    let page = 1;
    let totaldata = 12;
    let lq =[];
    let newLQ = {
        rank: "",
        country: "",
        stability: "",
        right: "",
        health: "",
        security: "",
        climate: "",
        costs: "",
        popularity: "",
        total: "",
        year: "",
        continent: ""
    };
    let errorMSG = "";
    onMount(getLQ);

    //GET
    async function getLQ() {
        console.log("Fetching lq...");
        const res = await fetch("api/v2/lq-stats?limit=10&offset="+ page);

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

    //INSERT
    async function insertLQ(){
        console.log("Inserting lq..." + JSON.stringify(newLQ));
        const res = await fetch("/api/v2/lq-stats", {
            method: "POST",
            body: JSON.stringify(newLQ),
            headers:{
                "Content-Type": "application/json"
            }
        }).then(function (res){
            getLQ();
            visible = true;
            if (res.status==200){
                totaldata++;
                color = "success";
                errorMSG = newLQ.country +" creado correctamente"
                console.log("Inserted" +newLQ.country +" lq.");
            } else if(res.status==400){
                color = "danger";
                errorMSG = "Formato incorrecto, compruebe que 'Country' y 'Year' estén rellenos.";
                console.log("BAD REQUEST");
            }else if (res.status==409) {
                color = "danger";
                errorMSG = newLQ.country +" " +newLQ.year +"  ya existe, recuerde que 'Year' y 'Country' son exclusivos.";
                console.log("This data already exits");
            }else{
                color = "danger";
                errorMSG = "Formato incorrecto, compruebe que 'Country' y 'Year' estén rellenos.";
            }
        });     
    }

    //DELETE SPECIFIC
    async function deleteLQ(name, year){
        const res = await fetch("/api/v2/lq-stats/" + name + "/" + year, {
            method: "DELETE"
        }).then(function (res){
            visible =true;
            getLQ();
            if (res.status==200) {
                totaldata--;
                color = "success";
                errorMSG = name + " " + year + " borrado correctamente";
                console.log("Deleted " + name);            
            }else if (res.status==404) {
                color = "danger";
                errorMSG = "No se ha encontrado el objeto " + name;
                console.log("LIFEQ NOT FOUND");            
            } else {
                color = "danger";
                errorMSG= res.status + ": " + res.statusText;
                console.log("ERROR!");
            }      
        });
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

    //getNextPage
    async function getNextPage(){
        console.log(totaldata);
        page+=10;
        if (page >totaldata){
            page -= 10;
        }
        console.log("Charging page "+ page);
        const res = await fetch("/api/v2/lq-stats?limit=10&offset="+page);

        if (res.ok){
            console.log("Ok");
            const json = await res.json();
            lq = json;
            console.log("Received " + lq.length + " lq.");
        } else{
            errorMSG = res.status + ":" + res.statusText;
            console.log("ERROR!");
        }
    }

    //getPreviewPage
    async function getPreviewPage() {
 
        if (page-10>=1) {
            page-=10; 
        } else page = 1
        console.log("Charging page " +page);
        const res = await fetch("/api/v2/lq-stats?limit=10&offset="+page);

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            lq = json;
            console.log("Received " + lq.length + " lq.");
        } else {
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }
</script>

<main>
    <h1>LQ Manager</h1>
    {#await lq}
        Loading lq...
    {:then lq}

        <Table bordered responsive>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Country</th>
                        <th>Stability</th>
                        <th>Right</th>
                        <th>Health</th>
                        <th>Security</th>
                        <th>Climate</th>
                        <th>Costs</th>
                        <th>Popularity</th>
                        <th>Total</th>
                        <th>Year</th>
                        <th>Continent</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input bind:value="{newLQ.rank}"></td>
                        <td><input bind:value="{newLQ.country}"></td>
                        <td><input bind:value="{newLQ.stability}"></td>
                        <td><input bind:value="{newLQ.right}"></td>
                        <td><input bind:value="{newLQ.health}"></td>
                        <td><input bind:value="{newLQ.security}"></td>
                        <td><input bind:value="{newLQ.climate}"></td>
                        <td><input bind:value="{newLQ.costs}"></td>
                        <td><input bind:value="{newLQ.popularity}"></td>
                        <td><input bind:value="{newLQ.total}"></td>
                        <td><input bind:value="{newLQ.year}"></td>
                        <td><input bind:value="{newLQ.continent}"></td>
                        <td><Button outline color="primary" on:click={insertLQ}>Insert</Button></td>
                    </tr>
                    {#each lq as lifeq}
                    <tr>
                        <td>{lifeq.rank}</td>
                        <td><a href="#/lq-stats/{lifeq.country}/{lifeq.year}">{lifeq.country}</a></td>
                        <td>{lifeq.stability}</td>
                        <td>{lifeq.right}</td>
                        <td>{lifeq.health}</td>
                        <td>{lifeq.security}</td>
                        <td>{lifeq.climate}</td>
                        <td>{lifeq.costs}</td>
                        <td>{lifeq.popularity}</td>
                        <td>{lifeq.total}</td>
                        <td><a href="#/lq-stats/{lifeq.country}/{lifeq.year}">{lifeq.year}</a></td>
                        <td><Button outline color="danger" on:click="{deleteLQ(lifeq.country)}">Delete</Button></td>
                    </tr>
                    {/each}
                </tbody>
        </Table>
        <Button color="primary" on:click="{getLQLoadInitialData}">
            Reiniciar ejemplos iniciales
        </Button>
        <Button color="danger" on:click="{deleteLQALL}">
            Borrar todo
        </Button>
        <Button outline color="success" on:click="{getPreviewPage}">
           Atrás
        </Button>
        <Button outline color="success" on:click="{getNextPage}">
           Siguiente
        </Button>
    {/await}
    <br>
    <br>
    <Button outline color="secondary" on:click="{pop}">Back</Button>
 
</main>