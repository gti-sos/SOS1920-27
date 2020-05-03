<script>
    import {
        onMount
    } from "svelte";
    import {
        pop
    } from "svelte-spa-router";
 
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
 
    let page = 1;
    let totaldata = 12;
    let spc = [];
    let newSpc = {
        country: "",
        both_sex: "",
        male_rank: "",
        male_number: "",
        female_rank: "",
        female_number: "",
        ratio: "",
        year: "",
        continent: ""
    };
    let errorMSG = "";
    onMount(getSPC);
 
    //GET
    async function getSPC() {
 
        console.log("Fetching spc...");
        const res = await fetch("/api/v1/spc-stats?limit=10&offset=1");
 
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
 
    //GET INITIALDATA
    async function getSPCLoadInitialData() {
 
        console.log("Fetching spc...");
        const res = await fetch("/api/v1/spc-stats/loadInitialData");

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            spc = json;
            totaldata = spc.length;
            console.log("Received " + spc.length + " spc.");
        } else {
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

    //INSERT
    async function insertSPC() {
 
        console.log("Inserting spc..." + JSON.stringify(newSpc));
        const res = await fetch("/api/v1/spc-stats", {
            method: "POST",
            body: JSON.stringify(newSpc),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            getSPC();
            console.log(totaldata);
            console.log(spc.length);
            totaldata++;
            if (spc.length>totaldata) {
                errorMSG = ""
                console.log("Inserted 1 spc.");            
            } else {
                errorMSG= res.status + ": " + res.statusText;
                console.log("ERROR!");
            }
        });
         
    }

    //DELETE SPECIFIC
    async function deleteSPC(name) {
        const res = await fetch("/api/v1/spc-stats/" + name, {
            method: "DELETE"
        }).then(function (res) {
            totaldata--;
            errorMSG = ""
            getSPC();      
            console.log("Deleted 1 spc.");        
        });
    }

    //DELETE ALL
    async function deleteSPCALL() {
        const res = await fetch("/api/v1/spc-stats/", {
            method: "DELETE"
        }).then(function (res) {
            totaldata=0;
            errorMSG = ""
            getSPC();         
            console.log("Deleted all spc.");     
        });
    }

    //getNextPage
    async function getNextPage() {
 
        console.log(totaldata);
        if (page+10 > totaldata) {
            page = 1
        } else {
            page+=10
        }
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
    <h1>SPC Manager</h1>
    {#await spc}
        Loading spc...
    {:then spc}
        
        <Table bordered>
            <thead>
                <tr>
                    <th>Country</th>
                    <th>Both_sex</th>
                    <th>Male_rank</th>
                    <th>Male_number</th>
                    <th>Female_rank</th>
                    <th>Female_number</th>
                    <th>Ratio</th>
                    <th>Year</th>
                    <th>Continent</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><input bind:value="{newSpc.country}"></td>
                    <td><input bind:value="{newSpc.both_sex}"></td>
                    <td><input bind:value="{newSpc.male_rank}"></td>
                    <td><input bind:value="{newSpc.male_number}"></td>
                    <td><input bind:value="{newSpc.female_rank}"></td>
                    <td><input bind:value="{newSpc.female_number}"></td>
                    <td><input bind:value="{newSpc.ratio}"></td>
                    <td><input bind:value="{newSpc.year}"></td>
                    <td><input bind:value="{newSpc.continent}"></td>
                    <td> <Button outline  color="primary" on:click={insertSPC}>Insert</Button> </td>
                </tr>
 
                {#each spc as suicide}
                    <tr>
                        <td><a href="#/spc-stats/{suicide.country}/{suicide.year}">{suicide.country}</a></td>
                        <td>{suicide.both_sex}</td>
                        <td>{suicide.male_rank}</td>
                        <td>{suicide.male_number}</td>
                        <td>{suicide.female_rank}</td>
                        <td>{suicide.female_number}</td>
                        <td>{suicide.ratio}</td>
                        <td>{suicide.year}</td>
                        <td>{suicide.continent}</td>
                        <td><Button outline color="danger" on:click="{deleteSPC(suicide.country)}">Delete</Button></td>
                    </tr>
                {/each}
            </tbody>
        </Table>
        <Button color="primary" on:click="{getSPCLoadInitialData}">
            Reiniciar ejemplos iniciales
        </Button>
        <Button color="danger" on:click="{deleteSPCALL}">
            Borrar todo
        </Button>
        <Button outline color="success" on:click="{getPreviewPage}">
           Atras
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