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

    //Para busquedas
    import { UncontrolledCollapse, Collapse, CardBody, Card } from "sveltestrap";
    let isOpen = false;
    let busquedas = "/api/v3/spc-stats?";

    //ALERTAS
    let visible = false;
    let color = "danger";
    

    let page = 1;
    let totaldata=12;
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

    let searchSpc = {
        country: null,
        both_sex: null,
        male_rank: null,
        male_number: null,
        female_rank: null,
        female_number: null,
        ratio: null,
        year: null,
        continent: null
    };
    let errorMSG = "";
    onMount(getSPC);
 
    //GET
    async function getSPC() {
 
        console.log("Fetching spc...");
        const res = await fetch("/api/v3/spc-stats?limit=10&offset=1");
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
        await fetch("/api/v3/spc-stats/loadInitialData");
        const res = await fetch("/api/v3/spc-stats?limit=10&offset=1");
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            spc = json;
            totaldata=12;
            console.log("Received " + spc.length + " spc.");
        } else {
            errorMSG= res.status + ": " + res.statusText;
            console.log("ERROR!");
        }
    }

    //INSERT
    async function insertSPC() {
 
        console.log("Inserting spc..." + JSON.stringify(newSpc));
        const res = await fetch("/api/v3/spc-stats", {
            method: "POST",
            body: JSON.stringify(newSpc),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            
            visible = true;
            if (res.status==200) {
                totaldata++;
                color = "success";
                errorMSG = newSpc.country +" creado correctamente";
                console.log("Inserted "+newSpc.country +" spc.");            
            }else if (res.status== 400) {
                color = "danger";
                errorMSG = "Formato incorrecto, compruebe que Country y Year estén rellenos.";
                console.log("BAD REQUEST");            
            }else if (res.status==409) {
                color = "danger";
                errorMSG = newSpc.country +" " +newSpc.year +"  ya existe, recuerde que Year y Country son exclusivos.";
                console.log("This data already exits");            
            } else {
                color = "danger";
                errorMSG= "Formato incorrecto, compruebe que Country y Year estén rellenos.";
                console.log("BAD REQUEST");
            }
        });
         
    }

    //DELETE SPECIFIC
    async function deleteSPC(name, year) {
        const res = await fetch("/api/v3/spc-stats/" + name + "/" + year, {
            method: "DELETE"
        }).then(function (res) {
            visible = true;
            getSPC();      
            if (res.status==200) {
                totaldata--;
                color = "success";
                errorMSG = name + " " + year + " borrado correctamente";
                console.log("Deleted " + name);            
            }else if (res.status==404) {
                color = "danger";
                errorMSG = "No se ha encontrado el objeto" + name;
                console.log("SUICIDE NOT FOUND");            
            } else {
                color = "danger";
                errorMSG= res.status + ": " + res.statusText;
                console.log("ERROR!");
            }      
        });
    }

    //DELETE ALL
    async function deleteSPCALL() {
        const res = await fetch("/api/v3/spc-stats/", {
            method: "DELETE"
        }).then(function (res) {
            getSPC();
            visible = true;
            if (res.status==200) {
                totaldata=0;
                color = "success";
                errorMSG = "Objetos borrados correctamente";
                console.log("Deleted all spc.");            
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
    }

    //SEARCH
    async function searchSPC() {
 
        console.log("Searching spc...");


        if (searchSpc.country!=null) {
            busquedas+="country="+searchSpc.country +"&";
        }if (searchSpc.both_sex!=null) {
            busquedas+="both_sex="+searchSpc.both_sex +"&";
        }if (searchSpc.male_rank!=null) {
            busquedas+="male_rank="+searchSpc.male_rank +"&";
        }if (searchSpc.male_number!=null) {
            busquedas+="male_number="+searchSpc.male_number +"&";
        }if (searchSpc.female_rank!=null) {
            busquedas+="female_rank="+searchSpc.female_rank +"&";
        }if (searchSpc.female_number!=null) {
            busquedas+="female_number="+searchSpc.female_number +"&";
        }if (searchSpc.ratio!=null) {
            busquedas+="ratio="+searchSpc.ratio +"&";
        }if (searchSpc.year!=null) {
            busquedas+="year="+searchSpc.year +"&";
        }if (searchSpc.continent!=null) {
            busquedas+="continent="+searchSpc.continent +"&";
        }

        const res = await fetch(busquedas);
        busquedas="/api/v3/spc-stats?";
        searchSpc = {
            country: null,
            both_sex: null,
            male_rank: null,
            male_number: null,
            female_rank: null,
            female_number: null,
            ratio: null,
            year: null,
            continent: null
        };
        if (res.ok) {
            visible = false;
            console.log("Ok:");
            const json = await res.json();
            spc = json;
            console.log("Received " + spc.length + " spc.");
        } else {
            visible = true;
            color = "danger";
            errorMSG = "No se ha encontrado ningún objeto";
            console.log("Data not found!");
        }
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
        const res = await fetch("/api/v3/spc-stats?limit=10&offset="+page);

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
        const res = await fetch("/api/v3/spc-stats?limit=10&offset="+page);

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
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script> <!--este es de apexcharts-->
    <h1>SPC Manager</h1>
    

      <Button color="primary" on:click={() => (isOpen = !isOpen)} class="mb-3">
        Buscar spc
      </Button>
      
      <Collapse {isOpen}>
        <Table bordered responsive>
            <tbody>
                <tr>
                    <td> <Button outline  color="primary" on:click={searchSPC}>Buscar</Button> </td>
                    <td><input placeholder="País" bind:value="{searchSpc.country}"></td>
                    <td><input placeholder="Ambos sexos" bind:value="{searchSpc.both_sex}"></td>
                    <td><input placeholder="Ranking hombres" bind:value="{searchSpc.male_rank}"></td>
                    <td><input placeholder="Número hombres (en miles)" bind:value="{searchSpc.male_number}"></td>
                    <td><input placeholder="Ranking mujeres" bind:value="{searchSpc.female_rank}"></td>
                    <td><input placeholder="Número mujeres (en miles)" bind:value="{searchSpc.female_number}"></td>
                    <td><input placeholder="Ratio" bind:value="{searchSpc.ratio}"></td>
                    <td><input placeholder="Año" bind:value="{searchSpc.year}"></td>
                    <td><input placeholder="Continente" bind:value="{searchSpc.continent}"></td>
                </tr>
            </tbody>
        </Table>
      </Collapse>

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
                    <th>Actions</th>
                    <th>Country</th>
                    <th>Both_sex</th>
                    <th>Male_rank</th>
                    <th>Male_number</th>
                    <th>Female_rank</th>
                    <th>Female_number</th>
                    <th>Ratio</th>
                    <th>Year</th>
                    <th>Continent</th>
                    
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td> <Button outline  color="primary" on:click={insertSPC}>Insertar</Button> </td>
                    <td><input bind:value="{newSpc.country}"></td>
                    <td><input bind:value="{newSpc.both_sex}"></td>
                    <td><input bind:value="{newSpc.male_rank}"></td>
                    <td><input bind:value="{newSpc.male_number}"></td>
                    <td><input bind:value="{newSpc.female_rank}"></td>
                    <td><input bind:value="{newSpc.female_number}"></td>
                    <td><input bind:value="{newSpc.ratio}"></td>
                    <td><input bind:value="{newSpc.year}"></td>
                    <td><input bind:value="{newSpc.continent}"></td>          
                </tr>
 
                {#each spc as suicide}
                    <tr>
                        <td><Button outline color="danger" on:click="{deleteSPC(suicide.country, suicide.year)}">Borrar</Button></td>
                        <td><a href="#/spc-stats/{suicide.country}/{suicide.year}">{suicide.country}</a></td>
                        <td>{suicide.both_sex}</td>
                        <td>{suicide.male_rank}</td>
                        <td>{suicide.male_number}</td>
                        <td>{suicide.female_rank}</td>
                        <td>{suicide.female_number}</td>
                        <td>{suicide.ratio}</td>
                        <td>{suicide.year}</td>
                        <td>{suicide.continent}</td>
                        
                    </tr>
                {/each}
            </tbody>
        </Table>
          <Button color="success" on:click="{getSPCLoadInitialData}">
            Reiniciar ejemplos iniciales
        </Button>
        <Button color="danger" on:click="{deleteSPCALL}">
            Borrar todo
        </Button>
        <Button outline color="primary" on:click="{getPreviewPage}">
           Atrás
        </Button>
        <Button outline color="primary" on:click="{getNextPage}">
            Siguiente
         </Button>
         
        
    {/await}
    

    

</main>
