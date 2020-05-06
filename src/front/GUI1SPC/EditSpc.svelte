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

    let spc = {};
    let updatedCountry = "";
    let updatedYear = "";
    let updatedContinent = "";
    let updatedFemaleRank = "";
    let updatedMaleRank = "";
    let updatedBothSex = "";
    let updatedFemaleNumber = "";
    let updatedMaleNumber = "";
    let updatedRatio = "";
    let errorMSG = "";

    onMount(getSPC1);
    //GET
    async function getSPC1() {
 
        console.log("Fetching spc...");
        const res = await fetch("/api/v2/spc-stats/"+params.suicideCountry+"/"+params.suicideYear);

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            spc = json;

            updatedCountry= spc.country;
            updatedBothSex= spc.both_sex;
            updatedMaleRank= spc.male_rank;
            updatedMaleNumber= spc.male_number;
            updatedFemaleRank= spc.female_rank;
            updatedFemaleNumber= spc.female_number;
            updatedRatio= spc.ratio;
            updatedYear= params.suicideYear;
            updatedContinent= spc.continent;

            console.log("Received " + spc.country);
        } else {
            color = "danger";
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

     async function updateSpc() {
        console.log("Updating spc..." + JSON.stringify(params.suicideCountry));
 
        const res = await fetch("/api/v2/spc-stats/"+params.suicideCountry+"/"+params.suicideYear, {
            method: "PUT",
            body: JSON.stringify({
                country: updatedCountry,
				both_sex: updatedBothSex,
				male_rank: updatedMaleRank,
				male_number: updatedMaleNumber,
				female_rank: updatedFemaleRank,
				female_number: updatedFemaleNumber,
				ratio: updatedRatio,
				year: params.suicideYear,
				continent: updatedContinent
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
    <h3>Edit SPC <strong>{params.suicideCountry}</strong></h3>
    {#await spc}
        Loading spc...
    {:then spc}
    <Alert color={color} isOpen={visible} toggle={() => (visible = false)}>
        {#if errorMSG}
            {errorMSG}
        {/if}
    </Alert>
        <Table bordered responsive>
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
                    <td>{updatedCountry}</td>
                    <td><input bind:value="{updatedBothSex}"></td>
                    <td><input bind:value="{updatedMaleRank}"></td>
                    <td><input bind:value="{updatedMaleNumber}"></td>
                    <td><input bind:value="{updatedFemaleRank}"></td>
                    <td><input bind:value="{updatedFemaleNumber}"></td>
                    <td><input bind:value="{updatedRatio}"></td>
                    <td>{updatedYear}</td>
                    <td><input bind:value="{updatedContinent}"></td>
                    <td> <Button outline  color="primary" on:click={updateSpc}>Update</Button> </td>
                </tr>
             </tbody>
        </Table>
    {/await}
    <Button outline color="secondary" on:click="{pop}">Back</Button>
</main>
