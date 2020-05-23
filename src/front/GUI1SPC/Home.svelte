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
    let busquedas = "/api/v2/spc-stats?";

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
        const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
        loadGraphs();
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
        await fetch("/api/v2/spc-stats/loadInitialData");
        const res = await fetch("/api/v2/spc-stats?limit=10&offset=1");
        loadGraphs();
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
        const res = await fetch("/api/v2/spc-stats", {
            method: "POST",
            body: JSON.stringify(newSpc),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            getSPC();
            
            visible = true;
            if (res.status==200) {
                totaldata++;
                color = "success";
                errorMSG = newSpc.country +" creado correctamente";
                loadGraphs();
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
        const res = await fetch("/api/v2/spc-stats/" + name + "/" + year, {
            method: "DELETE"
        }).then(function (res) {
            visible = true;
            getSPC();      
            loadGraphs();
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
        const res = await fetch("/api/v2/spc-stats/", {
            method: "DELETE"
        }).then(function (res) {
            getSPC();
            loadGraphs();
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
        busquedas="/api/v2/spc-stats?";
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
        const res = await fetch("/api/v2/spc-stats?limit=10&offset="+page);

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
        const res = await fetch("/api/v2/spc-stats?limit=10&offset="+page);

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

    async function loadGraphs() {
        let MyData = [];

        const resData = await fetch("/api/v2/spc-stats");
        MyData = await resData.json();

        var euro = MyData.filter(function (el) {
                return el.continent == "europe" && el.year==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": dato.both_sex
                };
        });

        var asia = MyData.filter(function (el) {
                return el.continent == "asia" && el.year==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": dato.both_sex
                };
        });

        var africa = MyData.filter(function (el) {
                return el.continent == "africa" && el.year==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": dato.both_sex
                };
        });

        var south = MyData.filter(function (el) {
                return el.continent == "south america" && el.year==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": dato.both_sex
                };
        });

        var north = MyData.filter(function (el) {
                return el.continent == "north america" && el.year==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": dato.both_sex
                };
        });

        var oceania = MyData.filter(function (el) {
                return el.continent == "oceania" && el.year==2013;
            }).map((dato)=> {     
            return {
                "name": dato.country,
                "value": dato.both_sex
                };
        });

        Highcharts.chart('container', {
            chart: {
                type: 'packedbubble',
                height: '100%'
            },
            title: {
                text: 'Suicides per 100,000 people in 2013 '
            },
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.name}:</b> {point.value}'
            },
            plotOptions: {
                packedbubble: {
                    minSize: '20%',
                    maxSize: '100%',
                    zMin: 0,
                    zMax: 1000,
                    layoutAlgorithm: {
                        gravitationalConstant: 0.05,
                        splitSeries: true,
                        seriesInteraction: false,
                        dragBetweenSeries: true,
                        parentNodeLimit: true
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}',
                        style: {
                            color: 'black',
                            textOutline: 'none',
                            fontWeight: 'normal'
                        }
                    }
                }
            },
            series: [{
                name: 'Europe',
                data: euro
            }, {
                name: 'Africa',
                data: africa
            }, {
                name: 'Oceania',
                data: oceania
            }, {
                name: 'North America',
                data: north
            }, {
                name: 'South America',
                data: south
            }, {
                name: 'Asia',
                data: asia
            }]
        });

    };


</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{loadGraphs}"></script>
</svelte:head>
<main>
    <h1>SPC Manager</h1>


    
    <Button color="primary" on:click={() => (isOpen = !isOpen)} class="mb-3">
        Buscar spc
      </Button>
      
      <Collapse {isOpen}>
        <Table bordered responsive>
            <tbody>
                <tr>
                    <td><input placeholder="País" bind:value="{searchSpc.country}"></td>
                    <td><input placeholder="Ambos sexos" bind:value="{searchSpc.both_sex}"></td>
                    <td><input placeholder="Ranking hombres" bind:value="{searchSpc.male_rank}"></td>
                    <td><input placeholder="Número hombres (en miles)" bind:value="{searchSpc.male_number}"></td>
                    <td><input placeholder="Ranking mujeres" bind:value="{searchSpc.female_rank}"></td>
                    <td><input placeholder="Número mujeres (en miles)" bind:value="{searchSpc.female_number}"></td>
                    <td><input placeholder="Ratio" bind:value="{searchSpc.ratio}"></td>
                    <td><input placeholder="Año" bind:value="{searchSpc.year}"></td>
                    <td><input placeholder="Continente" bind:value="{searchSpc.continent}"></td>
                    <td> <Button outline  color="primary" on:click={searchSPC}>Buscar</Button> </td>
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
                    <td> <Button outline  color="primary" on:click={insertSPC}>Insertar</Button> </td>
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
                        <td><Button outline color="danger" on:click="{deleteSPC(suicide.country, suicide.year)}">Borrar</Button></td>
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
    
    <br>
    <br>
    <Button outline color="secondary" on:click="{pop}">Volver</Button>
    <div id="container" style="height: 1000; min-width: 310px; max-width: 800px; margin: 100px"></div>

</main>

<style>
    .highcharts-figure, .highcharts-data-table table {
        min-width: 320px; 
        max-width: 800px;
        margin: 1em auto;
    }

    .highcharts-data-table table {
        font-family: Verdana, sans-serif;
        border-collapse: collapse;
        border: 1px solid #EBEBEB;
        margin: 10px auto;
        text-align: center;
        width: 100%;
        max-width: 500px;
    }
    .highcharts-data-table caption {
        padding: 1em 0;
        font-size: 1.2em;
        color: #555;
    }
    .highcharts-data-table th {
        font-weight: 600;
        padding: 0.5em;
    }
    .highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption {
        padding: 0.5em;
    }
    .highcharts-data-table thead tr, .highcharts-data-table tr:nth-child(even) {
        background: #f8f8f8;
    }
    .highcharts-data-table tr:hover {
        background: #f1f7ff;
    }

</style>