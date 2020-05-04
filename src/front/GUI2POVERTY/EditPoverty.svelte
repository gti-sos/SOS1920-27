<script>
    import {
        onMount
    } from "svelte";
    import {
        pop
    } from "svelte-spa-router";
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";

    export let params = {};

    let poverty = {}; 
    let updatedCountry = "";
    let updatedUnder190 = "";
    let updatedUnder320 = "";
    let updatedUnder550 = "";
    let updatedUnder320 = "";
    let updatedYear = "";
    let updatedContinent = "";
    let errorMSG = "";

    onMount(getPoverty);

    //GET OBJECT
    async function getPoverty() {
        console.log("Fetching poverty...");
        const res = await fetch("/api/v1/poverty-stats/"+params.country);
 
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            poverty = json;

            updatedCountry = poverty.country;
            updatedUnder190 = poverty.under_190;
            updatedUnder320 = poverty.under_320;
            updatedUnder550 = poverty.under_550;
            updatedYear = poverty.year;
            updatedContinent = poverty.continent;

            console.log("Received poverty.");
        } else {
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }       
     }

     async function updatePoverty() {
        console.log("Inserting poverty..." + JSON.stringify(params.country));
 
        const res = await fetch("/api/v1/poverty-stats/"+params.country+"/"+params.year, {
            method: "PUT",
            body: JSON.stringify({
                country: params.country,
                under_190: updatedUnder190,
                under_320: updatedUnder320,
                under_550: updatedUnder550,
                year: params.year,
                continent: updatedContinent
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            getPoverty();
        });//contact
 
    }
   
</script>
<main>
    <h3>Edit Poverty <strong>{params.country}</strong></h3>
    {#await poverty}
        Loading poverty...
    {:then poverty}
        <Table bordered>
            <thead>
                <tr>
                    <th>Country</th>
                    <th>Under_190</th>
                    <th>Under_320</th>
                    <th>Under_550</th>
                    <th>Year</th>
                    <th>Continent</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>updatedCountry</th>
                    <th><input bind:value="{updatedUnder190}"></th>
                    <th><input bind:value="{updatedUnder320}"></th>
                    <th><input bind:value="{updatedUnder550}"></th>
                    <th>updatedYear</th>
                    <th><input bind:value="{updatedContinent}"></th>
                    <td> <Button outline  color="primary" on:click={updatePoverty}>Update</Button> </td>
                </tr>
             </tbody>
        </Table>
    {/await}
    {#if errorMSG}
        <p style="color: red">ERROR: {errorMSG}</p>
    {/if}
    <Button outline color="secondary" on:click="{pop}">Back</Button>
</main>