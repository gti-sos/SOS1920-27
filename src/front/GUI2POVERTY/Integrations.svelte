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

    async function api1(){
        //recoger datos de apis
        var poverty=[];
        var swim=[];


        const resData = await fetch('/api/v2/poverty-stats');
        poverty = await resData.json();
        
        const resData2 = await fetch('http://sos1920-22.herokuapp.com/api/v1/swim-stats');
        swim = await resData2.json();

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
            swim=aux;
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

        //console.log(dataSwim);
        //console.log(dataPoverty);
        
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
            lineColor: 'black',
            lineWidth: 2,
            title: false,
            tickInterval: 500,
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

   async function api2(){

    var poverty=[];
    var imports=[];

    const resData = await fetch('/api/v2/poverty-stats');
    poverty = await resData.json();

    const resData2 = await fetch('https://sos1920-07.herokuapp.com/api/v2/imports');
    imports = await resData2.json();

    ordenarAsc(poverty,'year');
    var year = poverty.map((dato)=> {   
             return parseInt(dato.year);
        });

       year= year.filter(function(valor, indiceActual, arreglo) { //quitar duplicados
            let indiceAlBuscar = arreglo.indexOf(valor);
            if (indiceActual === indiceAlBuscar) {
                return true;
            } else {
                return false;
            }
        });
        //seleccionamos un valor por año
        var yearAux=[];
        year.forEach((y)=>{
            yearAux.push(y);
        });
        
        console.log(year);
        var res=[];
        for(var y=0;y<yearAux.length;y++){
            imports.forEach((i)=>{
                if(i.year==yearAux[y] && i.gdawaste!=0){
                    
                    res.push(i);
                    yearAux.splice(y,1);
                }
        });
    };
    imports=res;
    console.log(imports);

    //seleccionamos un valor por año
    year.forEach((y)=>{
            yearAux.push(y);
        });
        
        console.log(year);
        var res=[];
        for(var y=0;y<yearAux.length;y++){
            poverty.forEach((i)=>{
                if(i.year==yearAux[y]){
                    
                    res.push(i);
                    yearAux.splice(y,1);
                }
        });
    };
    poverty=res;
    console.log(poverty);
    var datosPoverty=[];
    var datosAlcohol=[];
    var pos=0;

    imports.forEach((a)=>{
            datosAlcohol.push(parseInt(a.gdaethylalcohol)/1000000);
    });

   datosPoverty=poverty.map((p)=>{
       var res=p.under_550;
       pos++;
        return res;
   });
    console.log(datosPoverty);


    var options = {
          series: [{
          name: 'poverty',
          data: datosPoverty
        }, {
          name: 'alcohol',
          data: datosAlcohol
        }],
          chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: year,
        },
        yaxis: {
          
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " por millón"
            }
          }
        }
        };

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
   }

  //  datos();
</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js" on:load="{api1}"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"on:load="{api2}"></script>
</svelte:head>



<main>
    
    <div id="chart">
        <h1>API 1</h1>
        <h3>indice de pobreza y consumo de alcohol por millón</h3>
    </div>
    <figure class="highcharts-figure">
        <h1>API 2</h1>
        <div id="container"></div>
    </figure>
    
</main>