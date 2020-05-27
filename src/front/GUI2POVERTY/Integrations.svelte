<script>

function ordenarAsc(array, key) {
       var arrayAux=[];
        for(var i=0; i < array.length-1;i++){
            for (let j = i+1; j < array.length; j++) {
                if(array[i][key] > array[j][key]){
                    arrayAux = array[i];
                    array[i]=array[j];
                    array[j]=arrayAux;
                }
            }
        }
        return array;
    }

    async function natacion(){
        //recoger datos de apis
        var poverty=[];
        var swim=[];
        var imports=[];
        var drug=[3,2,4,5,2,1,2];

        const resData = await fetch('/api/v2/poverty-stats');
        poverty = await resData.json();
        
        const resData2 = await fetch('http://sos1920-22.herokuapp.com/api/v1/swim-stats');
        swim = await resData2.json();
        
        const resData3 = await fetch('https://sos1920-07.herokuapp.com/api/v2/imports');
        imports = await resData3.json();

       // const resData4 = await fetch('http://sos1920-12.herokuapp.com/#/drug-offences');
        //drug = await resData4.json();

        //ajustar tamaño poverty con swim
        var tams=[];
        var menor=poverty.length;

        tams.push(poverty.length);
        tams.push(swim.length);
        
        tams.forEach((t)=>{
            if(menor>t){
                menor=t;
            }
        });

        var aux=[];
        var cont=menor;
        if(poverty.length!=menor){
            poverty.forEach((c)=>{
                if(cont>0){
                    aux.push(c);
                    cont--;
                }
            });
            poverty=aux;
            aux=[];
        }else if(swim.length!=menor){
            poverty.forEach((c)=>{
                if(cont>0){
                    aux.push(c);
                    cont--;
                }
            });
            poverty=aux;
            aux=[];
        }
        
        var cat = swim.map((dato)=>{
            return dato.country;
        });

        poverty.forEach((el)=>{
            cat.push(el.country);
        });
        
        var dataSwim = swim.map((dato)=>{
            return parseInt(dato.year);
        });
        
        var dataPoverty=[];
        dataSwim.forEach((el)=>{
            dataPoverty.push(0);
        });
        poverty.forEach((el)=>{
            dataSwim.push(0);
        });

        poverty.forEach((dato)=>{
            dataPoverty.push(dato.year);
        });

        console.log(dataSwim);
        console.log(dataPoverty);
        
        //Grafica
        Highcharts.chart('container', {
            chart: {
                type: 'area'
            },
            title: {
                text: 'natacion y pobreza'
            },
            subtitle: {
                
                align: 'right',
                verticalAlign: 'bottom'
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                borderWidth: 1,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
            },
            xAxis: {
                categories: cat
            },
            yAxis: {
                title: {
                    text: 'Y-Axis'
                }
            },
            plotOptions: {
                area: {
                    fillOpacity: 0.5
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'swim',
                data: dataSwim
            }, {
                name: 'poverty',
                data: dataPoverty
            }]
        });
    }  
    natacion();
</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{natacion}"></script>
</svelte:head>

<main>
    <figure class="highcharts-figure">
        <h1>API 1</h1>
        <div id="container"></div>
    </figure>

    <figure class="highcharts-figure">
        <h1>API 2</h1>
        <div id="container"></div>
    </figure>
</main>