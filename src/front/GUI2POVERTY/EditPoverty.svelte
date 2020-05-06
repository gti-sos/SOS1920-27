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

    export let params = {};

    let visible = false;
    let color = "danger";

    let poverty = {}; 
    let updatedCountry = "";
    let updatedUnder190 = "";
    let updatedUnder320 = "";
    let updatedUnder550 = "";
    let updatedYear = "";
    let updatedContinent = "";
    let errorMSG = "";

    const BASE_API_URL="/api/v2";

    onMount(getPoverty);

    //GET OBJECT
    async function getPoverty() {
        console.log("Fetching poverty...");
        const res = await fetch(BASE_API_URL+"/poverty-stats?country="+params.country+"&year="+params.year);
 
        if (res.ok) {

            console.log("Ok:");
            console.log("data poverty of "+ params.country +" found");
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
        console.log("Updating poverty...");
 
        const res = await fetch(BASE_API_URL+"/poverty-stats/"+updatedCountry+"/"+updatedYear, {
            method: "PUT",
            body: JSON.stringify({
                country: updatedCountry,
                under_190: updatedUnder190,
                under_320: updatedUnder320,
                under_550: updatedUnder550,
                year: updatedYear,
                continent: updatedContinent
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            visible=true;
            getPoverty();
            if (res.status==200) {
                color = "success";
                errorMSG = params.country + " actualizado correctamente";
                console.log(params.country + " updated");            
            }else if (res.status==201) {
                errorMSG = params.country + " actualizado correctamente";
                color = "success";
                console.log(params.country + " updated");            
            }else if (res.status==404) {
                color = "danger";
                errorMSG = params.country + " no ha sido encontrado";
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
    {#await poverty}
        Loading poverty...
    {:then poverty}

    <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
        {#if errorMSG}
            STATUS: {errorMSG}
        {/if}
    </Alert>
        
        <Table responsive>
            <thead>
                <tr>
                    <th>Country*</th>
                    <th>Under_190</th>
                    <th>Under_320</th>
                    <th>Under_550</th>
                    <th>Year*</th>
                    <th>Continent</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{updatedCountry}</td>
                    <td><input bind:value="{updatedUnder190}"></td>
                    <td><input bind:value="{updatedUnder320}"></td>
                    <td><input bind:value="{updatedUnder550}"></td>
                    <td>{updatedYear}</td>
                    <td><input bind:value="{updatedContinent}"></td>
                    <td> <Button outline  color="primary" on:click={updatePoverty}>Update</Button> </td>
                </tr>
             </tbody>
        </Table>
    {/await}
    <Button outline color="secondary" on:click="{pop}">Back</Button>
</main>