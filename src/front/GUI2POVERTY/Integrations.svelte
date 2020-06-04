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
  
          var drug=[];
          var poverty=[];
  
          const resData = await fetch('/api/v2/poverty-stats');
          poverty = await resData.json();
  
          const resData4 = await fetch('https://sos1920-12.herokuapp.com/api/v1/drug_offences');
          drug = await resData4.json();
  
          //console.log(poverty);

          ordenarAsc(poverty,'year');
          ordenarAsc(drug,'year');
  
          var year = [];  //eje x
  
          poverty.forEach((dato)=> { //cargamos los años de poverty   
              year.push(parseInt(dato.year));
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

          //variable auxiliar para ir borrando cada vez que se seleccione un año
          var yearAux=[];
          year.forEach((y)=>{
              yearAux.push(y);
          });
  
          var res=[];
          for(var i=0;i<drug.length;i++){
              for(var y=0;y<yearAux.length;y++){
                  if(yearAux[y]==drug[i].year){
                      res.push(drug[i]);
                      yearAux.splice(y,1);
                      //console.log(yearAux);
                      break;
                  }
              }
          };
          drug=res.map((dato)=>{
              return parseFloat(dato.cannabis_offences)/1000000;
          });
  
          //seleccionamos un valor por año
          yearAux=[];
          year.forEach((y)=>{
              yearAux.push(y);
          });
  
          
  
  
          poverty=poverty.filter(function (p) {
                  return p.continent == "europe";
              });
          var res=[];
          for(var i=0;i<poverty.length;i++){
              for(var y=0;y<poverty.length;y++){
                  if(yearAux[y]==poverty[i].year){
                      res.push(poverty[i]);
                      yearAux.splice(y,1);
                      //console.log(yearAux);
                      break;
                  }
              }
          };
          
          poverty=poverty.map((p)=>{
              return parseFloat(p.under_550);
          });
  
          // console.log(poverty);
  
      var options = {
            series: [
            {
              name: "Drug",
              data: drug
            },
            {
              name: "Poverty",
              data: poverty
            }
          ],
            chart: {
            height: 350,
            type: 'line',
            dropShadow: {
              enabled: true,
              color: '#000',
              top: 18,
              left: 7,
              blur: 10,
              opacity: 0.2
            },
            toolbar: {
              show: false
            }
          },
          colors: ['#77B6EA', '#545454'],
          dataLabels: {
            enabled: true,
          },
          stroke: {
            curve: 'smooth'
          },
          title: {
            text: 'Consumo de cannabis y pobreza en Europa',
            align: 'left'
          },
          grid: {
            borderColor: '#e7e7e7',
            row: {
              colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5
            },
          },
          markers: {
            size: 1
          },
          xaxis: {
            categories: year,
            title: {
              text: 'Año'
            }
          },
          yaxis: {
            title: {
              text: 'Indice'
            },
            tickAmount: 2,
            min: 0,
            max: 1
          },
          legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5
          }
          };
  
          var chart = new ApexCharts(document.querySelector("#chart2"), options);
          chart.render();
  
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
          
          //console.log(year);
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
      //console.log(imports);
  
      //seleccionamos un valor por año
      year.forEach((y)=>{
              yearAux.push(y);
          });
          
          //console.log(year);
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
      //console.log(poverty);
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
      //console.log(datosPoverty);
  
  
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
     
     async function api3(){
  
          var traffic=[];
          var poverty=[];
  
          const resData = await fetch('/api/v2/poverty-stats');
          poverty = await resData.json();
  
          const resData4 = await fetch('https://sos1920-02.herokuapp.com/api/v2/traffic-accidents');
          traffic = await resData4.json();
  
          var dataPoverty=poverty.filter((p)=>{   //media poverty 2015
              return parseInt(p.year)==2015;
          }).map((p)=>{
              return p.under_550;
          });
          var mediaPoverty=0;
          for(var i=0;i<dataPoverty.length;i++){
              mediaPoverty+=dataPoverty[i];
          }
          mediaPoverty=mediaPoverty/dataPoverty.length;
  
  
          // console.log(dataPoverty);
          // console.log(mediaPoverty);
  
          var dataTaffic=traffic.filter((t)=>{ //media traffic 2015
              return parseInt(t.year)==2015;
          }).map((t)=>{
              return t.trafficaccidentvictim / t.injured;
          });
          var mediaTraffic=0;
          for(var i=0;i<dataTaffic.length;i++){
              mediaTraffic+=dataTaffic[i];
          }
          mediaTraffic=mediaTraffic/dataTaffic.length;
  
  
          // console.log(dataTaffic);
          // console.log(mediaTraffic);
  
          var options = {
            series: [mediaPoverty,mediaTraffic],
            chart: {
            width: 380,
            type: 'pie',
          },
          labels: ['Pobreza', 'Accidente de Trafico'],
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
          };
  
          var chart = new ApexCharts(document.querySelector("#chart4"), options);
          chart.render();
  
     }
      
     async function api4(){
          //recoger datos de apis
          var poverty=[];
          var swim=[];
  
  
          const resData = await fetch('/api/v2/poverty-stats');
          poverty = await resData.json();
          
          const resData2 = await fetch('https://sos1920-22.herokuapp.com/api/v1/swim-stats');
          swim = await resData2.json();
  
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
              return parseFloat(dato.position/dato.time);
          });
          //console.log(dataSwim);
          
          var dataPoverty=[];
          dataSwim.forEach((el)=>{
              dataPoverty.push(0);
          });
          poverty.forEach((el)=>{
              dataSwim.push(0);
          });
  
          poverty.forEach((dato)=>{
              dataPoverty.push(dato.under_320);
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
              tickInterval: 0.5,
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
    
      async function apiExterna1(){
  
          var corona = [];
          var poverty=[];
  
          const resData = await fetch('https://coronavirus-19-api.herokuapp.com/countries');
          corona = await resData.json();
          corona=corona.map((c)=>{        //cambiamos el formato de pais a minusculas
              return {
                  "country": c.country.toLowerCase(),
                  "cases": c.cases,
                  "todayCases": c.todayCases,
                  "deaths": c.deaths,
                  "todayDeaths": c.todayDeaths,
                  "recovered": c.recovered,
                  "active": c.active,
                  "critical": c.critical,
                  "casesPerOneMillion": c.casesPerOneMillion,
                  "deathsPerOneMillion": c.deathsPerOneMillion,
                  "totalTests": c.totalTests,
                  "testsPerOneMillion": c.testsPerOneMillion
                  };
          });
          
          const resData1 = await fetch('/api/v2/poverty-stats');
          poverty = await resData1.json();
  
          //recogemos datos de cada pais
          var resCorona=[];
          var resPoverty=[];
          
          poverty.forEach((p)=>{
              corona.forEach((c)=>{
                  if(p.country== c.country){
                      resCorona.push(c);
                      resPoverty.push(p);
                  }
              });
          });
  
          ordenarAsc(resCorona,'country');
          ordenarAsc(resPoverty,'country');
  
          var countries=resPoverty.map((p)=>{
              return p.country;
          });
  
          var dataTest = resCorona.map((c)=>{
              return c.testsPerOneMillion;
          });
  
          var dataPoverty = resPoverty.map((p)=>{
              return p.under_550;
          });
  
          // console.log(resCorona);
          // console.log(resPoverty);
          // console.log(countries);
          // console.log(dataTest);
          // console.log(dataPoverty);
  
          var options = {
            series: [{
            name: 'Tests por millón',
            type: 'column',
            data: dataTest
          }, {
            name: 'Indice de pobreza',
            type: 'line',
            data: dataPoverty
          }],
            chart: {
            height: 350,
            type: 'line',
          },
          stroke: {
            width: [0, 4]
          },
          title: {
            text: 'Relación tests realizados por indice de pobreza'
          },
          dataLabels: {
            enabled: true,
            enabledOnSeries: [1]
          },
          labels: countries,
          xaxis: {
            type: 'country'
          },
          yaxis: [{
            title: {
              text: 'Test realizados por millón',
            },
          
          }, {
            opposite: true,
            title: {
              text: 'Indice de pobreza'
            }
          }]
          };
  
          var chart = new ApexCharts(document.querySelector("#chartex1"), options);
          chart.render();
  
      }
   
      async function apiExterna2(){
  
        var AreaCountry=[];
        var poverty=[];
  
        const resData = await fetch("https://restcountries.eu/rest/v2/?fields=region;area");
        AreaCountry = await resData.json();
  
        //modificamos el formato
        AreaCountry = AreaCountry.map((a)=>{  
          return {
                    "region": a.region.toLowerCase(),
                    "area": a.area
                  };
        });
  
        const resData1 = await fetch("/api/v2/poverty-stats"); 
        poverty = await resData1.json();
  
        var regions=[];
  
        //cargamos las regiones
        poverty.forEach((p)=>{
          AreaCountry.forEach((a)=>{
            if(p.continent==a.region){
              regions.push(p.continent);
            }
          });
        });
  
        //quitar duplicados
        regions= regions.filter(function(valor, indiceActual, arreglo) { 
            let indiceAlBuscar = arreglo.indexOf(valor);
            if (indiceActual === indiceAlBuscar) {
                return true;
            } else {
                return false;
            }
        });
  
        // console.log(regions);
        
        //variables para sumar el area de cada region
        var data =[];
        var sum=0;
  
        //en cada posicion de data cargaremos la suma del area de cada region
        for(var i=0;i<regions.length;i++){
          sum=0;
  
          for(var j=0;j<AreaCountry.length;j++){
  
            if(regions[i]==AreaCountry[j].region){
              if(AreaCountry[j].area!=null){
                sum+=AreaCountry[j].area;
              }
            }
  
          }
  
          //los datos los cargamos en formato dato por millon
          data.push(sum/1000000);
        }
        // console.log(data);
  
        //variables para la media de indice de pobreza
        var mediaPoverty=[];
        var sum2=0;
        var tam=0;
  
        //cargamos la pobreza media de cada region
        regions.forEach((r)=>{
          sum2=0;
          poverty.forEach((p)=>{
            if(r==p.continent){
              sum2+=p.under_550;
              tam++;
            }
          });
          mediaPoverty.push(sum2/tam);
        });
        
        // console.log(mediaPoverty);
  
        //Grafica
        var options = {
            series: [{
            name: 'Area de cada region',
            type: 'area',
            data: data
          }, {
            name: 'Indice de pobreza media de cada region',
            type: 'line',
            data: mediaPoverty
          }],
            chart: {
            height: 350,
            type: 'line',
          },
          stroke: {
            curve: 'smooth'
          },
          fill: {
            type:'solid',
            opacity: [0.35, 1],
          },
          labels: regions,
          markers: {
            size: 0
          },
          yaxis: [
            {
              title: {
                text: 'Area',
              },
            },
            {
              opposite: true,
              title: {
                text: 'Indice de pobreza',
              },
            },
          ],
          tooltip: {
            shared: true,
            intersect: false,
            y: {
              formatter: function (y) {
                if(typeof y !== "undefined") {
                  return  y.toFixed(4);
                }
                return y;
              }
            }
          }
          };
  
          var chart = new ApexCharts(document.querySelector("#chartex2"), options);
          chart.render();
      }
      async function apiExterna3(){
          const jokes = await fetch("https://api.chucknorris.io/jokes/random");
          var joke = await jokes.json();
          var chiste = document.getElementById('chiste');
          chiste.innerHTML = joke.value;
          // console.log(joke.value);
      }
  
      async function apiExterna4(){
          const jokes2 = await fetch("https://joke3.p.rapidapi.com/v1/joke",{
            'method':'GET',
            'headers':{
              "x-rapidapi-host": "joke3.p.rapidapi.com",
              "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
              "useQueryString": true
            }
          });
          var joke2 = await jokes2.json();
          var chiste2 = document.getElementById('chiste2');
          chiste2.innerHTML = joke2.content;
          // console.log(joke2.content);
      }
  
      async function apiSong(){
        return 
      }
  
      async function apiExterna5(){
  
        var poverty =[];
  
        const povertyData = await fetch('/api/v2/poverty-stats');
        poverty = await povertyData.json();
  
        ordenarAsc(poverty,'continent');
        var countries = poverty.map((p)=>{
          return p.continent;
        });
        
        countries = countries.filter(function(valor, indiceActual, arreglo) { //quitar duplicados
              let indiceAlBuscar = arreglo.indexOf(valor);
              if (indiceActual === indiceAlBuscar) {
                  return true;
              } else {
                  return false;
              }
          });
  
          let res=[];
  
          const songs = await fetch("https://searchly.p.rapidapi.com/song/search?query="+countries[0],{
            'method':'GET',
              'headers':{
                "x-rapidapi-host": "searchly.p.rapidapi.com",
                "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
                "useQueryString": true
              }
          });
  
          const songs2 = await fetch("https://searchly.p.rapidapi.com/song/search?query="+countries[1],{
            'method':'GET',
              'headers':{
                "x-rapidapi-host": "searchly.p.rapidapi.com",
                "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
                "useQueryString": true
              }
          });

          const songs3 = await fetch("https://searchly.p.rapidapi.com/song/search?query="+countries[2],{
            'method':'GET',
              'headers':{
                "x-rapidapi-host": "searchly.p.rapidapi.com",
                "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
                "useQueryString": true
              }
          });
  
          var c0 = await songs.json();
          var c1 = await songs2.json();
          var c2 = await songs3.json();
  
          res.push(c0.response.results.length);
          res.push(c1.response.results.length);
          res.push(c2.response.results.length);

          // console.log(res);
          // console.log(song.response.results);
          // console.log(poverty);
          var options = {
              series: [res[0],res[1],res[2]],
              chart: {
              width: 380,
              type: 'pie',
            },
            labels: [countries[0], countries[1], countries[2]],
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: 'bottom'
                }
              }
            }]
            };
  
            var chart = new ApexCharts(document.querySelector("#chart5"), options);
            chart.render();
  
      }

      async function apiExterna6(){

        const gamesData = await  fetch("https://rawg-video-games-database.p.rapidapi.com/games",{
          method:'GET',
          headers:{
            "x-rapidapi-host": "rawg-video-games-database.p.rapidapi.com",
            "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
            "useQueryString": true
          }
        });

        var games = await gamesData.json();
        var res=[];
        
        games=games.results.map((g)=>{
          return '<li>'+g.slug+'</li>';
        });
        // console.log(games);
        
        var gamesHtml = document.getElementById('games');
        games.forEach((g)=>{
          gamesHtml.innerHTML+=g;
        });

      }

      async function apiExterna7(){

        const fraseData = await fetch('https://quoteai.p.rapidapi.com/ai-quotes/0',{
          method:'GET',
          headers:{
            "x-rapidapi-host": "quoteai.p.rapidapi.com",
            "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
            "useQueryString": true
          }
        });

        var frase = await fraseData.json();

        var fraseHtml=document.getElementById('frase');
        var autorHtml=document.getElementById('autor');

        fraseHtml.innerHTML=frase.quote;
        autorHtml.innerHTML='<br>-'+frase.author

        // console.log(frase);

      }

      //funcion auxiliar para api externa 8
      async function searchPopulation(country){
        const poblacionData = await fetch('https://world-population.p.rapidapi.com/population?country_name='+country,{
          method:'GET',
          headers:{
            "x-rapidapi-host": "world-population.p.rapidapi.com",
            "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
            "useQueryString": true
          }
        });
        var poblacion= await poblacionData.json();
        return poblacion;
      }

      async function apiExterna8(){

        
        var poverty =[];

        const povertyData = await fetch('/api/v2/poverty-stats');
        poverty = await povertyData.json();

        //mapear para tener la primera letra en mayusculas
        poverty=poverty.map((p)=>{
          return {
            "country": p.country[0].toUpperCase()+p.country.slice(1),     
            "under_190": p.under_190,
            "under_320": p.under_320,
            "under_550": p.under_550,
            "year": p.year,
            "continent": p.continent
          };
        });

        //eliminamos los paises que no esten en la api para eliminar los codigos 404
        const paisesApi = await fetch('https://world-population.p.rapidapi.com/allcountriesname',{
          method:'GET',
          headers:{
            "x-rapidapi-host": "world-population.p.rapidapi.com",
            "x-rapidapi-key": "2499b9262cmsh73c0da1a5a197bap189468jsn3435f2f24ddf",
            "useQueryString": true
          }
        });

        var paisesTotales = await paisesApi.json();
        paisesTotales = paisesTotales.body.countries.map((p)=>{
          return p;
        });

        //eliminamos los que no estan
        var res=[];
        poverty.forEach((p)=>{
          paisesTotales.forEach((pa)=>{
            if(p.country == pa){
              res.push(p);
            }
          });
        });

        poverty=res;
        console.log(poverty);
        
        //recolectamos los datos con la funcion auxiliar para hacer varias llamadas
        var population = [];

        for(var i=0;i<poverty.length;i++){
          population.push(await searchPopulation(poverty[i].country));
        }

        var paises = [];

        population.forEach((p)=>{
          paises.push(p.body.country_name);
        });

        var data = [];

        population.forEach((p)=>{
          data.push(p.body.population);
        });

        

        console.log(paises);
        console.log(data);
        

        var options = {
          series: [{
            name: "Habitantes",
            data: data
        }],
          chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight'
        },
        
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
          },
        },
        xaxis: {
          categories: paises,
        }
        };

        var chart = new ApexCharts(document.querySelector("#chartex8"), options);
        chart.render();

      }

      apiExterna3();
      apiExterna4();
      apiExterna6();
      apiExterna7();
      apiExterna8();
  </script>
  
  <svelte:head>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts" on:load="{api1}" on:load="{api2}"></script>
      <script src="https://cdn.jsdelivr.net/npm/apexcharts"on:load="{api3}" on:load="{api4}" on:load="{apiExterna1}" on:load="{apiExterna2}"on:load="{apiExterna5}"></script>
  </svelte:head>
  
  
  
  <main>
    <div id='caja'>
    <h1>API Externa chiste aleatorios de chuck norris</h1>
    <div id="chiste"></div>
    <div style="text-align: center">fuente: <a href="https://api.chucknorris.io/jokes/random" target="_blank">aqui</a></div>
    </div><br>
    
    
    <div id='caja'>
    <h1>API Externa chiste aleatorios</h1>
    <div id="chiste2"></div>
    <div style="text-align: center">fuente: <a href="https://joke3.p.rapidapi.com/v1/joke" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API Externa frases inspiradoras sobre IA</h1>
    <div id="frase"></div>
    <div id='autor'></div>
    <div style="text-align: center">fuente: <a href="https://quoteai.p.rapidapi.com/ai-quotes/0" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
      <h1>API Externa habitantes por pais</h1>
      <div id="chartex8"></div>
      <div style="text-align: center">fuente: <a href="https://world-population.p.rapidapi.com/population" target="_blank">aqui</a></div>
      </div><br>

    <div id='caja'>
    <h1>API Externa 1</h1>
    <div id="chartex1"></div>
    <div style="text-align: center">fuente: <a href="https://coronavirus-19-api.herokuapp.com/countries" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API Externa 2</h1>
    <div id="chartex2"></div>
    <div style="text-align: center">fuente: <a href="https://restcountries.eu/rest/v2/?fields=region;area" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API externa 3</h1>
    <h3>Comparación de canciones que contienen, en el título, el nombre de la región</h3>
    <div id="chart5"></div>
    <div style="text-align: center">fuente: <a href="https://searchly.p.rapidapi.com/song/search?query=europe" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API Externa 4</h1>
    <h3>Lista de juegos más conocidos</h3>
    <div id="games"></div>
    <div style="text-align: center">fuente: <a href="https://rawg-video-games-database.p.rapidapi.com/games" target="_blank">aqui</a></div>
    </div><br>
    
    <div id='caja'>
    <h1>API SOS1029-12</h1>
    <h3>indice de pobreza y consumo de cannabis por millón</h3>
    <div id="chart2"></div>
    <div style="text-align: center">fuente: <a href="https://sos1920-12.herokuapp.com/api/v1/drug_offences" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API SOS1029-07</h1>
    <h3>indice de pobreza y consumo de alcohol por millón</h3>
    <div id="chart"></div>
    <div style="text-align: center">fuente: <a href="https://sos1920-07.herokuapp.com/api/v2/imports" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API SOS1029-02</h1>
    <h3>Media de pobreza y accidentes de trafico en 2015</h3>
    <div id="chart4"></div>
    <div style="text-align: center">fuente: <a href="https://sos1920-02.herokuapp.com/api/v2/traffic-accidents" target="_blank">aqui</a></div>
    </div><br>

    <div id='caja'>
    <h1>API SOS1029-22</h1>
    <figure class="highcharts-figure">
      <div id="container"></div>
      <div style="text-align: center">fuente: <a href="https://sos1920-22.herokuapp.com/api/v1/swim-stats" target="_blank">aqui</a></div>
    </figure>
    </div><br>
  
  </main>

  <style>

    #caja{
      padding: 2%;
      border: 1px solid black;
    }

  </style>