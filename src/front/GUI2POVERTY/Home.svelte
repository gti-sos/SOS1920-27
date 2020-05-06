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
    
    let visible = false;
    let color = "danger";
    let countryValue="";
    let yearValue="";
    
    let newPoverty = {
        country:"",
		under_190: "",
		under_320:"",
		under_550:"",
		year:"",
		continent:""
    };
    let poverty=[];
    let totalObj=poverty.length;
    
    let page=1;
    let errorMSG = "";
    
    
    onMount(getPoverty);

    //GET Limit ok
    async function getPoverty() {
 
        console.log("Fetching poverty...");
        const res = await fetch("/api/v1/poverty-stats?limit=10&offset="+page); //obtener limit y offset
        const res2 = await fetch("/api/v1/poverty-stats");              //obtener datos

        if (res.ok && res2.ok) {
            const json = await res.json();
            const json2 = await res2.json();
            poverty = json; //pagina
            totalObj=json2.length; //datos
            console.log("Received " + poverty.length + " data poverty.");
        } else {
            console.log("ERROR!");
        }
    }

    //GET LoadInitialData
    async function getPovertyLoadInitialData() {
        console.log("Fetching poverty...");
        const msg = await fetch("/api/v1/poverty-stats/loadInitialData").then(function(res){ //mensaje de alerta
            visible = true;
            if (res.status==200) {
                console.log("ELEMENTOS: "+ totalObj);
                color = "success";
                errorMSG = "Objetos cargados correctamente";           
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
        const elements = await fetch("/api/v1/poverty-stats/loadInitialData"); //datos cargados
        const jsonElements = await elements.json();
        page=1;
        totalObj = jsonElements.length;
        console.log("ELEMENTOS: "+ totalObj);
        const res = await fetch("/api/v1/poverty-stats?limit=10&offset=1"); //datos mostrados

        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            poverty = json;
            console.log("Loading "+poverty.length+" objects");
            console.log("Received " + poverty.length + " poverty.");
        } else {
            console.log("ERROR!");
        }
    }
    
    //INSERT
    async function insertPoverty() {
 
        console.log("Inserting poverty..." + JSON.stringify(newPoverty));

        const res = await fetch("/api/v1/poverty-stats", {
            method: "POST",
            body: JSON.stringify(newPoverty),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            visible=true;
            if (res.status==200) {
                totalObj++;
                console.log("ELEMENTOS: "+ totalObj);
                color = "success";
                errorMSG = newPoverty.country + " insertado correctamente";
                console.log(newPoverty.country + " updated");   
                getPoverty();         
            }else {
                color = "danger";
                errorMSG= "Formato incorrecto, compruebe que Country y Year estén rellenos o que no estén contenidos en la tabla.";
                console.log("BAD REQUEST");
            }
            
        });
 
    }

    //SEARCH
    async function searchPoverty(countryValue, yearValue){
        console.log("pais: "+countryValue+" año: "+yearValue);
    }

    //DELETE
    async function deletePoverty(country) {
        const res = await fetch("/api/v1/poverty-stats/" + country, {
            method: "DELETE"
        }).then(function (res) {

            getPoverty();
            visible = true;
            if (res.status==200) {
               totalObj--;
                console.log("ELEMENTO: "+ totalObj+" borrado.");
                color = "success";
                errorMSG = "Objeto borrado correctamente.";
                console.log("Deleted "+country+" poverty.");            
            }else if (res.status==400) {
                color = "danger";
                errorMSG = "Ha ocurrido un fallo.";
                console.log("BAD REQUEST");            
            } else {
                color = "danger";
                errorMSG= res.status + ": " + res.statusText;
                console.log("ERROR!");
            }
        });
    }

    //DELETE ALL
    async function deletePovertyAll() {
        const res = await fetch("/api/v1/poverty-stats/", {
            method: "DELETE"
        }).then(function (res) {
            
            getPoverty();
            visible = true;
            if (res.status==200) {
                page=1;
                totalObj=0;
                console.log("ELEMENTOS: "+ totalObj);
                color = "success";
                errorMSG = "Objetos borrados correctamente.";
                console.log("Deleted all poverty.");            
            }else if (res.status==400) {
                color = "danger";
                errorMSG = "Ha ocurrido un fallo.";
                console.log("BAD REQUEST");            
            } else {
                color = "danger";
                errorMSG= res.status + ": " + res.statusText;
                console.log("ERROR!");
            }
        });
    }
    
    // Next Page
    async function getNextPage(){
        page+=10;
        if(page>totalObj){
            page-=10;
        }
        await console.log(page);
        console.log("Fetching poverty...");
        const res = await fetch("/api/v1/poverty-stats?limit=10&offset="+page);
        
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            poverty = json;
            console.log("Received " + poverty.length + " poverty.");
        } else {
            console.log("ERROR!");
        }
    }
    //Previus Page
    async function getPreviousPage(){
        if(page-10>=0){
            page-=10;
        }
        await console.log(page);
        console.log("Fetching poverty...");
        const res = await fetch("/api/v1/poverty-stats?limit=10&offset="+page);
        
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            poverty = json;
            console.log("Received " + poverty.length + " poverty.");
        } else {
            console.log("ERROR!");
        }
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
                <th>Búsquedas</th>
            </thead>
            <tbody>
                <tr>
                    
                    Country: <input type="text" bind:value="{countryValue}"> Year: <input type="text" bind:value="{yearValue}">
                    
                    <Button outline color="info" on:click="{searchPoverty(countryValue, yearValue)}" style="margin-left: 2%;">
                        Buscar
                    </Button>
                </tr>
            </tbody>
        </Table>
        
        <Table responsive>
            <thead>
                <tr>
                    <th>Country</th>
                    <th>Under 190</th>
                    <th>Under 320</th>
                    <th>Under 550</th>
                    <th>Year</th>
                    <th>Continent</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><input bind:value="{newPoverty.country}"></td>
                    <td><input bind:value="{newPoverty.under_190}"></td>
                    <td><input bind:value="{newPoverty.under_320}"></td>
                    <td><input bind:value="{newPoverty.under_550}"></td>
                    <td><input bind:value="{newPoverty.year}"></td>
                    <td><input bind:value="{newPoverty.continent}"></td>
                    <td> <Button outline  color="primary" on:click={insertPoverty}>Insert</Button> </td>
                </tr>
 
                {#each poverty as poverty}
                    <tr>
                        <td><a href="#/poverty-stats/{poverty.country}/{poverty.year}">{poverty.country}</a></td>
                        <td>{poverty.under_190}</td>
                        <td>{poverty.under_320}</td>
                        <td>{poverty.under_550}</td>
                        <td>{poverty.year}</td>
                        <td>{poverty.continent}</td>
                        <td><Button outline color="danger" on:click="{deletePoverty(poverty.country)}">Delete</Button></td>
                    </tr>
                {/each}
            </tbody>
        </Table>
        
        <Button color="primary" on:click="{getPovertyLoadInitialData}">
            Reiniciar ejemplos iniciales
        </Button>
        <Button color="danger" on:click="{deletePovertyAll}">
            Borrar todo
        </Button>
        {#if page!=1}
        <Button outline color="success" on:click="{getPreviousPage}">
            Atras
         </Button>
         {/if}
         {#if (page+10) <= totalObj}
        <Button outline color="success" on:click="{getNextPage}">
            Siguiente
         </Button>
         {/if}
    {/await}
    <br>
    <br>
    <Button outline color="secondary" on:click="{pop}">Back</Button>
    <br>
    <br>
 
</main>