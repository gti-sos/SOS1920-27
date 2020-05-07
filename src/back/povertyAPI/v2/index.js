module.exports = function (app) {
    console.log("Registering poverty API....");
    
    const dataStore = require("nedb")
    const path = require("path");


    const dbFileName = path.join(__dirname, "poverty.db");

    const BASE_API_URL="/api/v2";

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
			continent:"europe"
		},
		{ 
			country:"algeria",
			under_190: 0.005,
			under_320:0.039,
			under_550:0.292,
			year:2011,
			continent:"africa"	
		},
		{ 
			country:"angola",
			under_190: 0.301,
			under_320:0.557,
			under_550:0.794,
			year:2008,
			continent:"south america"	
		},
		{ 
			country:"argentina",
			under_190: 0.004,
			under_320:0.02,
			under_550:0.071,
			year:2017,
			continent:"south america"	
		},
		{ 
			country:"armenia",
			under_190: 0.014,
			under_320:0.123,
			under_550:0.5,
			year:2017,
			continent:"europe"	
		}, //5
		{ 
			country:"australia",
			under_190: 0.007,
			under_320: 0.01,
			under_550: 0.012,
			year: 2014,
			continent:"oceania"	
		}, 
		{ 
			country:"austria",
			under_190: 0.007,
			under_320: 0.007,
			under_550: 0.009,
			year: 2015,
			continent:"europe"	
		}, 
		{ 
			country:"azerbaijan",
			under_190: 0,
			under_320: 0,
			under_550: 0.082,
			year: 2005,
			continent:"europe"	
		}, 
		{ 
			country:"bangladesh",
			under_190: 0.148,
			under_320: 0.529,
			under_550: 0.845,
			year: 2016,
			continent:"asia"	
		}, 
		{ 
			country:"belarus",
			under_190: 0,
			under_320: 0,
			under_550: 0.008,
			year: 2017,
			continent:"europe"	
		}, //10
		{ 
			country:"belgium",
			under_190: 0,
			under_320: 0.002,
			under_550: 0.002,
			year: 2015,
			continent:"europe"	
		}, 
		{ 
			country:"belize",
			under_190: 0.139,
			under_320: 0.281,
			under_550: 0.53,
			year: 1999,
			continent:"north america"	
		}, 
		{ 
			country:"benin",
			under_190: 0.495,
			under_320: 0.762,
			under_550: 0.906,
			year: 2015,
			continent:"africa"	
		}, 
		{ 
			country:"bhutan",
			under_190: 0.015,
			under_320: 0.12,
			under_550: 0.386,
			year: 2017,
			continent:"asia"	
		}, 
		{ 
			country:"bolivia",
			under_190: 0.058,
			under_320: 0.118,
			under_550: 0.247,
			year: 2017,
			continent:"south america"	
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

        const startObject = offset-1;                //comienzo del primer objeto de la pagina console
		const endObject =parseInt(offset)+parseInt(limit) - 1;                    //ultimo objeto de la pagina

        db.find({}, (err, poverty_stats) =>{
            poverty_stats.forEach( (c) => {
                delete c._id;
            });
			
            if((limit==null && offset == null) && (yearQuery==null && countryQuery==null)){ //Get /poverty_stats sin querys por defecto
				res.send(JSON.stringify(poverty_stats,null,2));
				
            }else if(yearQuery!=null && countryQuery!=null){				//Get /poverty_stats Busquedas
                db.find({country: countryQuery},(err, array)=>{

					array.forEach(c=>{
						delete c._id;
					})

					var arrayGet=[];
					for(var i=0;i<array.length;i++){
						if(array[i].year==yearQuery){
							arrayGet.push(array[i]);
						}
					}
					
					if(arrayGet.length>0){
						res.send(JSON.stringify(arrayGet,null,2));
					}else{
						res.sendStatus(404);
					}
				})

			}else if(yearQuery!=null){
				console.log("yearQuery!=null");
					console.log("year: "+yearQuery);

					db.find({year: parseInt(yearQuery)},(err, array)=>{
					var arrayGet=[];

					console.log("array: "+JSON.stringify(array,null,2));
					array.forEach(c=>{
						delete c._id;
					})
					
					for(var i=0;i<array.length;i++){
						if(array[i].year==yearQuery){
							arrayGet.push(array[i]);
						}
					}
					/*if(arrayGet.length==1){
						res.send(JSON.stringify(arrayGet[0],null,2));
					}else */if(arrayGet.length>0){
						res.send(JSON.stringify(arrayGet,null,2));
					}else{
						res.sendStatus(404);
					}
				})
			}else if(countryQuery!=null){
					console.log("countryQuery!=null");
					db.find({country: countryQuery},(err, array)=>{
					var arrayGet=[];

					array.forEach(c=>{
						delete c._id;
					})
					
					for(var i=0;i<array.length;i++){
						if(array[i].country==countryQuery){
							arrayGet.push(array[i]);
						}
					}
					/*if(arrayGet.length==1){
						res.send(JSON.stringify(arrayGet[0],null,2));
					}else */if(arrayGet.length>0){
						res.send(JSON.stringify(arrayGet,null,2));
					}else{
						res.sendStatus(404);
					}
				})
			
			}else if(limit!=null && offset != null){						//Get /poverty_stats Paginacion
						
				if(limit<=0 || offset <=0){
					res.sendStatus(400);
				}else{
					if(limit==1){
						
						res.send(JSON.stringify(poverty_stats[offset-1],null,2));
					}else{
						res.send(JSON.stringify(poverty_stats.slice(startObject,endObject),null,2));
					}	
				}
				 }else if(offset!=null){

							if(offset<=0){
								res.sendStatus(400);
							}else{
									res.send(JSON.stringify(poverty_stats.slice(parseInt(offset)-1,poverty_stats.length),null,2));
							}
						}else if(limit!=null){
									if(limit<=0){
										res.sendStatus(400);
									}else if(limit==1){

												res.send(JSON.stringify(poverty_stats[0],null,2));
											}else{
												res.send(JSON.stringify(poverty_stats.slice(0,parseInt(limit)),null,2));
											}
								
				}
        });
    });

	//POST /poverty_stats
	app.post(BASE_API_URL+"/poverty-stats", (req, res)=>{

		db.find(req.body,(err, array)=>{
			var body=req.body;
			
			if(body.country!=null || body.under_190!=null || body.under_320!=null || body.under_550!=null || body.continent!=null || body.year!=null){
				
				if(array.length==0 && body.country!=null && body.year!=null && body.country!="" && body.year!=""){
					
					db.insert(req.body);
					res.send(JSON.stringify(Array(req.body), null, 2));
				}else{
					res.sendStatus(400);
				}
			}else{
				sendStatus(400);
			}	
		})	
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
		
		///////////////////

		db.find(req.body,(err, array)=>{
			var body=req.body;
			
			
			if(body.country!=null || body.under_190!=null || body.under_320!=null || body.under_550!=null || body.continent!=null || body.year!=null){
				
				if(array.length==0){

					///////////////////
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
							res.sendStatus(404,"DATA NOT FOUND");
						}
					});
					
				}else{
					res.sendStatus(404);
				}
			}else{
				sendStatus(400);
			}	
		})

		
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