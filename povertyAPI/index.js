module.exports = function (app) {
    console.log("Registering poverty API....");
    
    const dataStore = require("nedb")
    const path = require("path");


    const dbFileName = path.join(__dirname, "poverty.db");

    const BASE_API_URL="/api/v1";

    const db = new dataStore({
                filename: dbFileName,
                autoload: true
                });
    
    var poverty_statsInit = [   
		{ 
			country:"albania",
			under_190: 0.011,
			under_320:0.077,
			under_550:0.391,
			year:2012,
			content:"europe"
		},
		{ 
			country:"algeria",
			under_190: 0.005,
			under_320:0.039,
			under_550:0.292,
			year:2011,
			content:"africa"	
		},
		{ 
			country:"angola",
			under_190: 0.301,
			under_320:0.557,
			under_550:0.794,
			year:2008,
			content:"south america"	
		},
		{ 
			country:"argentina",
			under_190: 0.004,
			under_320:0.02,
			under_550:0.071,
			year:2017,
			content:"south america"	
		},
		{ 
			country:"armenia",
			under_190: 0.014,
			under_320:0.123,
			under_550:0.5,
			year:2017,
			content:"europe"	
		}
	];


    //LOADINITIALDATA
    app.get(BASE_API_URL+"/poverty-stats/loadInitialData",(req,res) =>{
			db.remove({},{multi:true}, function (err, doc){});
			db.insert(poverty_statsInit);
		//	res.sendStatus(201,"DATA CREATED");
			res.send(JSON.stringify(poverty_statsInit,null,2));
			
		});

    //GET /poverty_stats
	//GET /poverty_stats con paginacion
    app.get(BASE_API_URL+"/poverty-stats", (req,res) =>{
        const limit = req.query.limit;
		const offset = req.query.offset;
		const countryQuery = req.query.country;
		const yearQuery = req.query.year;

        const startObject = offset-1;                									//comienzo del primer objeto de la pagina
        const endObject = parseInt(startObject) + parseInt(limit);                      //ultimo objeto de la pagina

        db.find({}, (err, poverty_stats) =>{
            poverty_stats.forEach( (c) => {
                delete c._id;
            });
			
            if((limit==null && offset == null) && (yearQuery==null && countryQuery==null)){ //Get /poverty_stats sin querys por defecto
				res.send(JSON.stringify(poverty_stats,null,2));
				
            }else if(yearQuery!=null && countryQuery!=null){				//Get /poverty_stats Busquedas
                db.find({country: countryQuery},(err, array)=>{
					var arrayGet=[];
					for(var i=0;i<array.length;i++){
						if(array[i].year==yearQuery){
							arrayGet.push(array[i]);
						}
					}
					
					if(arrayGet.length>0){
						res.send(JSON.stringify(arrayGet[0],null,2));
					}else{
						res.sendStatus(400);
					}
				})

            }else if(limit!=null && offset != null){						//Get /poverty_stats Paginacion
				res.send(JSON.stringify(poverty_stats.slice(startObject,endObject),null,2));
			}
        });
    });

	//POST /poverty_stats
	app.post(BASE_API_URL+"/poverty-stats", (req, res)=>{
		var body=req.body;
		if(body.country && body.year && body.under_190 && body.under_320 && body.under_550 && body.content){
			db.insert(req.body);
			res.sendStatus(201, "CREATED");
		}else{
			res.sendStatus(400);
		}
		
	});

	//PUT /poverty_stats
	app.put(BASE_API_URL+"/poverty-stats",(req, res)=>{
		res.sendStatus(405, "METHOD NOT ALLOWED");
	})

	//DELETE /poverty_stats
	app.delete(BASE_API_URL+"/poverty-stats", (req,res)=>{

        db.remove({},{multi:true}, function (err, doc){});
        db.find({}, (err, poverty_stats) =>{
            if (poverty_stats.length==0){
                console.log("Data spc-stats empty");
                res.sendStatus(200);
            } else {
                res.sendStatus(400,"BAD REQUEST");
            };
        });
    });

	//GET /poverty_stats/country
	app.get(BASE_API_URL+"/poverty-stats/:country", (req, res)=>{
		var countryParam = req.params.country;
		db.find({country: countryParam}, (err,poverty_stats)=>{
			poverty_stats.forEach((c)=>{
				delete c._id;
			});

			if(poverty_stats.length>=1){
				res.send(JSON.stringify(poverty_stats, null, 2));
			}else{
				res.sendStatus(404,"NOT FOUND")
			}

		});
	});
	//GET /poverty_stats/country/year
	app.get(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
        var countryparam = req.params.country;
		var yearparam = req.params.year;
        db.find({country: countryparam},{year: yearparam}, (err, poverty_stats) =>{
			poverty_stats.forEach((c)=>{
				delete c._id;
			})
             if(poverty_stats.length>0){
				 res.send(JSON.stringify(poverty_stats[0],null,2));
			 }else{
				 res.sendStatus(404,"DATA NOT FOUND");
			 }
        });
    });

	

	//PUT /poverty_stats/country				db.remove({},{multi:true}, function (err, doc){});
	 app.put(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
		var countryparam = req.params.country;
        var yearparam = req.params.year;

        //para ver si encuentro el bicho (no funcionaba el filtro)
        var encontrado = false;
        db.find({}, (err, poverty_stats) =>{
            poverty_stats.forEach( (c) => {
                if(c.year==yearparam && c.country==countryparam){
                    encontrado = true;
                    var newPoverty = req.body;
                    //una vez encontrado vemos que no sean nulos
                    if((newPoverty == "") || (newPoverty.country == null) || (newPoverty.year == null)){
                        res.sendStatus(400,"BAD REQUEST");
                    } else {
                        db.remove(c);
                        db.insert(newPoverty);
                        res.sendStatus(201);
                    }
                }
            });
        //si no hemos encontrado que coincida el año
        if (encontrado==false){
            res.sendStatus(404,"SUICIDE NOT FOUND");
        }
        });
    });

	//POST /poverty_stats/country (ERROR)
	app.post(BASE_API_URL+"/poverty-stats/:country", (req, res)=>{
		res.sendStatus(405,"METHOD NOT ALLOWED");
	})

	//DELETE /poverty_stats/country/year
	app.delete(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
		var countryParam= req.params.country;
		var yearParam = req.params.year;

		db.find({country: countryParam},{year: yearParam},(err,poverty_stats)=>{

			if(poverty_stats.length>0){
				poverty_stats.forEach((c)=>{
					db.remove(c);
				})
				res.sendStatus(200);
			}else{
				res.sendStatus(404,"DATA NOT FOUND");
			}
		})
	});

	//DELETE /poverty_stats/country
	app.delete(BASE_API_URL+"/poverty-stats/:country", (req, res)=>{
		var countryParam= req.params.country;

		db.find({country: countryParam},(err,poverty_stats)=>{

			if(poverty_stats.length>0){
				poverty_stats.forEach((c)=>{
					db.remove(c);
				})
				res.sendStatus(200);
			}else{
				res.sendStatus(404,"DATA NOT FOUND");
			}
		})
	});
	
	console.log("POVERTY OK");
    
};