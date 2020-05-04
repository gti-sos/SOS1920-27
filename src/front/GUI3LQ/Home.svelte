<script>
    import{
        onMount
    } from "svelte";
    import{
        pop
    } from "svelte-spa-router";

    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";

    let page = 1;
    let totaldata = 0;
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
        const res = await fetch("api/v1/lq-stats?limit=10&offset=1");

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

    //GET INITIALDATA
    async function getLQLoadInitialData() {

        console.log("Fetching lq...");
        const res = await fetch("/api/v1/lq-stats/loadInitialData");

        if (res.ok){
            console.log("Ok");
            const json = await res.json();
            lq = json;
            totaldata = lq.length;
            console.log("Received " + lq.length + " lq.");
        } else {
            errorMSG = res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

    //INSERT
    async function insertLQ(){
        console.log("Inserting lq..." + JSON.stringify(newLQ));
        const res = await fetch("/api/v1/lq-stats", {
            method: "POST",
            body: JSON.stringify(newLQ),
            headers:{
                "Content-Type": "application/json"
            }
        }).then(function (res){
            getLQ();
            console.log(totaldata);
            console.log(lq.length);
            totaldata++;
            if (spc.length>totaldata){
                errorMSG = "";
                console.log("Inserted 1 lq.");
            }else{
                errorMSG=res.status + ": " + res.statusText;
                console.log("ERROR!");
            }
        })
    }

    //DELETE SPECIFIC
    async function deleteLQ(name){
        const res = await fetch("/api/v1/lq-stats/" + name, {
            method: "DELETE"
        }).then(function (res){
            totaldata--;
            errorMSG = "";
            getLQ();
            console.log("Delete 1 lq.");
        });
    }

    //DELETE ALL
    async function deleteLQALL(){
        const res = await fetch("/api/v1/lq-stats", {
            method: "DELETE"
        }).then(function (res){
            totaldata = 0;
            errorMSG = "";
            getLQ();
            console.log("Deleted all lq.");

        });
    }

    //getNextPage
    async function getNextPage(){
        console.log(totaldata);
        if (page+10 >totaldata){
            page = 1;
        } else{
            page+=10
        }
        console.log("Charging page "+ page);
        const res = await fetch("/api/v1/lq-stats?limit=10&offset="+page);

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
        const res = await fetch("/api/v1/spc-stats?limit=10&offset="+page);

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
</script>

<main>
    <h1>LQ Manager</h1>
    {#await lq}
        Loading lq...
    {:then lq}

        <Table bordered>
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
    {#if errorMSG}
    <br>
    <p style="color: red">STATUS: {errorMSG}</p>
    {/if}
    <br>
    <br>
    <Button outline color="secondary" on:click="{pop}">Back</Button>
 
</main>