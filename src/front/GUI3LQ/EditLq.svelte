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

    export let params = {};

    let lq = {};
    let updatedRank = "";
    let updatedCountry = "";
    let updatedYear = "";
    let updatedContinent = "";
    let updatedStability = "";
    let updatedRight = "";
    let updatedHealth = "";
    let updatedSecurity = "";
    let updatedClimate = "";
    let updatedCosts = "";
    let updatedPopularity = "";
    let updatedTotal = "";

    onMount(getLQ1);
    //GET
    async function getLQ1() {
 
        console.log("Fetching lq...");
        const res = await fetch("/api/v2/lq-stats/"+params.lqCountry+"/"+params.lqYear);

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            spc = json;

            updatedCountry= lq.country;
            updatedRank = lq.rank;
            updatedYear= params.suicideYear;
            updatedStability = lq.stability;
            updatedRight = lq.right;
            updatedHealth = health.right;
            updatedSecurity = lq.security;
            updatedClimate = lq.climate;
            updatedCosts = lq.costs;
            updatedPopularity = lq.popularity;
            updatedTotal = lq.total;
            updatedContinent= spc.continent;

            console.log("Received " + lq.country);
        } else {
            color = "danger";
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

     async function updateLq() {
        console.log("Updating lq..." + JSON.stringify(params.lqCountry));
 
        const res = await fetch("/api/v2/lq-stats/"+params.lqCountry+"/"+params.lqYear, {
            method: "PUT",
            body: JSON.stringify({
                country: updatedCountry,
                rank: updatedRank,
                right: updatedRight,
                stability: updatedStability,
                health: updatedHealth,
                security: updatedSecurity,
                climate: updatedClimate,
                costs: updatedCosts,
                popularity: updatedPopularity,
                total: updatedTotal,
                continent: updatedContinent,
                year: params.lqYear
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            visible = true;
            getSPC1();
            if (res.status==200) {
                color = "success";
                errorMSG = updatedCountry + " actualizado correctamente";
                console.log(updatedCountry + " updated");            
            }else if (res.status==201) {
                errorMSG = updatedCountry + " actualizado correctamente";
                color = "success";
                console.log(updatedCountry + " updated");            
            }else if (res.status==404) {
                color = "danger";
                errorMSG = updatedCountry + " no ha sido encontrado";
                console.log("SUICIDE NOT FOUND");            
            } else {
                color = "danger";
                errorMSG= "Formato incorrecto, compruebe que Country y Year estén rellenos.";
                console.log("BAD REQUEST");
            }
        });
 
    }
   
</script>
<main>
    <h1>SPC Manager</h1>
    <h3>Edit SPC <strong>{params.lqCountry}</strong></h3>
    {#await lq}
        Loading lq...
    {:then lq}
    <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
        {#if errorMSG}
            {errorMSG}
        {/if}
    </Alert>
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
                    <td><input bind:value="{updatedRank}"></td>
                    <td>{updatedCountry}</td>
                    <td><input bind:value="{updatedStability}"></td>
                    <td><input bind:value="{updatedRight}"></td>
                    <td><input bind:value="{updatedHealth}"></td>
                    <td><input bind:value="{updatedSecurity}"></td>
                    <td><input bind:value="{updatedClimate}"></td>
                    <td><input bind:value="{updatedCosts}"></td>
                    <td><input bind:value="{updatedPopularity}"></td>
                    <td><input bind:value="{updatedTotal}"></td>
                    <td>{updatedYear}</td>
                    <td><input bind:value="{updatedContinent}"></td>
                    <td> <Button outline  color="primary" on:click={updateLq}>Update</Button> </td>
                </tr>
             </tbody>
        </Table>
    {/await}
    <Button outline color="secondary" on:click="{pop}">Back</Button>
</main>
