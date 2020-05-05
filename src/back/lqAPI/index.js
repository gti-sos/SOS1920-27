module.exports = function (app) {
    console.log("Registering lq API....");
    
    const dataStore = require("nedb")
    const path = require("path");


    const dbFileName = path.join(__dirname, "lq.db");

    const BASE_API_URL="/api/v1";

    const db = new dataStore({
                filename: dbFileName,
                autoload: true
                });

    
    var ejemplos_lq = [

				{ 
					rank: 1,
					country: "australia",
					stability: 90,
					right: 100,
					health: 87,
					security: 97,
					climate: 90,
					costs: 24,
					popularity: 69,
					total: 80,
					year: 2016,
					continent: "oceania"
				},
				{ 
					rank: 2,
					country: "macao",
					stability: 93,
					right: 73,
					health: 80,
					security: 100,
					climate: 49,
					costs: 68,
					popularity: 92,
					total: 79,
					year: 2016,
					continent: "africa"	
				},
				{ 
					rank: 3,
					country: "hongkong",
					stability: 86,
					right: 94,
					health: 77,
					security: 100,
					climate: 58,
					costs: 44,
					popularity: 85,
					total: 77,
					year: 2016,
					continent: "asia"
				},
				{ 
					rank: 4,
					country: "portugal",
					stability: 85,
					right: 86,
					health: 82,
					security: 100,
					climate: 70,
					costs: 47,
					popularity: 63,
					total: 77,
					year: 2016,
					continent: "europe"
				},
				{ 
					rank: 5,
					country: "malta",
					stability: 89,
					right: 83,
					health: 93,
					security: 99,
					climate: 78,
					costs: 36,
					popularity: 45,
					total: 77,
					year: 2016,
					continent: "europe"
				},
				{ 
					rank: 6,
					country: "switzerland",
					stability: 95,
					right: 100,
					health: 93,
					security: 100,
					climate: 25,
					costs: 45,
					popularity: 70,
					total: 77,
					year: 2016,
					continent: "europe"
				},
				{ 
					rank: 7,
					country: "austria",
					stability: 82,
					right: 100,
					health: 99,
					security: 100,
					climate: 25,
					costs: 33,
					popularity: 95,
					total: 76,
					year: 2016,
					continent: "europe"
				},
				{ 
					rank: 8,
					country: "singapore",
					stability: 90,
					right: 90,
					health: 72,
					security: 100,
					climate: 41,
					costs: 49,
					popularity: 93,
					total: 76,
					year: 2016,
					continent: "asia"
				},
				{ 
					rank: 9,
					country: "japan",
					stability: 89,
					right: 98,
					health: 91,
					security: 99,
					climate: 52,
					costs: 24,
					popularity: 72,
					total: 75,
					year: 2016,
					continent: "asia"
				},
				{ 
					rank: 10,
					country: "germany",
					stability: 82,
					right: 100,
					health: 98,
					security: 94,
					climate: 22,
					costs: 43,
					popularity: 87,
					total: 75,
					year: 2016,
					continent: "europe"
				},
				{ 
					rank: 11,
					country: "czechia",
					stability: 90,
					right: 82,
					health: 94,
					security: 100,
					climate: 22,
					costs: 57,
					popularity: 69,
					total: 74,
					year: 2016,
					continent: "europe"
				},
				{ 
					rank: 12,
					country: "spain",
					stability: 57,
					right: 80,
					health: 85,
					security: 97,
					climate: 75,
					costs: 36,
					popularity: 96,
					total: 74,
					year: 2016,
					continent: "europe"
				}
			];

	//loadInitialData	
	app.get(BASE_API_URL+"/lq-stats/loadInitialData",(req,res) =>{
		//borrar lo que había
		db.remove({},{multi:true}, function (err, doc){});
		console.log("New GET .../loadInitialData");
		
		db.insert(ejemplos_lq);
		res.send(JSON.stringify(ejemplos_lq,null,2));
        console.log("Initial lq loaded:"+JSON.stringify(ejemplos_lq,null,2));
		});
	
	
    /* GET LIFE_QUALITY
	app.get(BASE_API_URL+"/lq-stats", (req,res) =>{
		
		console.log("New GET .../lq-stats");
		
        db.find({}, (err, lq_stats) =>{
            lq_stats.forEach( (c) => {
                delete c._id;
            });

            res.send(JSON.stringify(lq_stats,null,2));
			//res.sendStatus(200,"OK");
            console.log("Data sent:"+JSON.stringify(lq_stats,null,2));
			
        });
    });*/
	
	
	//GET /LIFE QUALITY
	app.get(BASE_API_URL+"/lq-stats", (req,res) =>{
		function arrayRemove(arr, value) { return arr.filter(function(ele){ return ele != value; });}
		const limit = req.query.limit;
		const offset = req.query.offset;
		
		const rankQuery = req.query.rank;
		const countryQuery = req.query.country;
		const stabilityQuery = req.query.stability;
		const rightQuery = req.query.query;
		const healthQuery = req.query.health;
		const securityQuery = req.query.security;
		const climateQuery = req.query.climate;
		const costsQuery = req.query.costs;
		const popularityQuery = req.query.popularity;
		const totalQuery = req.query.total;
		const yearQuery = req.query.year;
		const continentQuery = req.query.continent;

		const startObject = offset-1;                //comienzo del primer objeto de la pagina
		const endObject = parseInt(startObject) + parseInt(limit);                    //ultimo objeto de la pagina
		
		
		db.find({}, (err, lq_stats) =>{
			lq_stats.forEach( (c) => {
				delete c._id;
			});
			var copiadb = lq_stats;


			if((limit!=null || offset != null) && countryQuery==null && yearQuery==null && rankQuery ==null && stabilityQuery ==null && rightQuery ==null && healthQuery ==null && securityQuery ==null && climateQuery ==null && costsQuery ==null && popularityQuery ==null && totalQuery ==null && continentQuery ==null){						//Get /lq_stats Paginacion
				if(limit!=null && offset != null){
					res.send(JSON.stringify(lq_stats.slice(startObject, endObject),null,2));	
				} else if (limit!=null && offset == null){
					res.send(JSON.stringify(lq_stats.slice(0,parseInt(limit)),null,2));
				} else if(limit==null && offset != null){
					res.send(JSON.stringify(lq_stats.slice(startObject,spc_stats.length),null,2));
				}
				
			}


			if (countryQuery==null && yearQuery==null && rankQuery ==null && stabilityQuery ==null && rightQuery ==null && healthQuery ==null && securityQuery ==null
				 && climateQuery ==null && costsQuery ==null && popularityQuery ==null && totalQuery ==null && continentQuery ==null && limit==null && offset == null) { //get normal
				
				res.send(JSON.stringify(lq_stats,null,2));



			} if (countryQuery!=null || yearQuery!=null || rankQuery !=null || stabilityQuery !=null || rightQuery !=null || healthQuery !=null || securityQuery !=null  
				 || climateQuery !=null || costsQuery !=null || popularityQuery !=null || totalQuery !=null || continentQuery !=null) { //busquedas
				
				if (countryQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].country!=countryQuery) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 
				if (yearQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].year!=parseInt(yearQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				
				if (rankQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].rank!=rankQuery) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (stabilityQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].stability!=parseInt(stabilityQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (rightQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].right!=parseInt(rightQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (healthQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].health!=parseInt(healthQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (securityQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].security!=parseInt(securityQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (climateQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].climate!=parseInt(climateQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (costsQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].costs!=parseInt(costsQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (popularityQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].popularity!=parseInt(popularityQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (totalQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].total!=parseInt(totalQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (continentQuery!=null) {
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].continent!=continentQuery) {
							copiadb.splice(i,1)
							i--;
						}
					}
				}
				if (copiadb.length==0) {
					res.sendStatus(404, "Data not found");
				}if (copiadb.length>0) {
					console.log("Data: "+JSON.stringify(copiadb,null,2));
					res.send(JSON.stringify(copiadb,null,2));
				}

				
			}
			
		});
	});
	
	
    // POST LIFE-QUALITY		
	
    app.post(BASE_API_URL+"/lq-stats",(req,res) =>{
    	
    	var newLQ = req.body;
    	
		db.find({country:newLQ.country},{ year: newLQ.year}, (err, lq_stats) =>{
			
			if((newLQ == "") || (newLQ.country == null) || (newLQ.year == null)){
    			res.sendStatus(400,"BAD REQUEST");
    		} else if (lq_stats.length > 0){
    		    res.sendStatus(409,"This data already exits");
  		  	} else {
    			db.insert(newLQ); 	
				console.log("Data created:"+JSON.stringify(newLQ,null,2));
				res.send(JSON.stringify(Array(newLQ),null,2));
    	}
        });
    	

    });
    
    
    
    // DELETE LIFE-QUALITY
    
    app.delete(BASE_API_URL+"/lq-stats", (req,res)=>{
    
		db.remove({},{multi:true}, function (err, doc){});
		db.find({}, (err, lq_stats) =>{
			if (lq_stats.length==0){
				console.log("Data lq-stats empty");
				res.sendStatus(200);
			} else {
				res.sendStatus(400,"BAD REQUEST");
			};
		});
    });

    // GET LQ-STATS/XXX
    
    app.get(BASE_API_URL+"/lq-stats/:country", (req,res)=>{
    	console.log("New GET .../lq-stats/country");
		var countryparam = req.params.country;
		
        db.find({country: countryparam}, (err, lq_stats) =>{
            lq_stats.forEach( (c) => {
                delete c._id;
            });

			if(lq_stats.length >= 1){
				res.send(JSON.stringify(lq_stats[0],null,2));
				//res.sendStatus(200,"OK");
            	console.log("Data sent:"+JSON.stringify(lq_stats[0],null,2));
    		}else{
    			res.sendStatus(404,"LIFE QUALITY NOT FOUND");
    		}
    	});
    	
    });
    
    // GET LQ-STATS/XXX/YYY
    
    app.get(BASE_API_URL+"/lq-stats/:country/:year", (req,res)=>{
    	console.log("New GET .../lq-stats/:country/:year");
		var countryparam = req.params.country;
    	var yearparam = req.params.year;
        db.find({country: countryparam, year: yearparam}, (err, lq_stats) =>{
            lq_stats.forEach( (c) => {
                delete c._id;
            });

			if(lq_stats.length == 1){
    			res.send(JSON.stringify(lq_stats[0],null,2));
				//res.sendStatus(200,"OK");
            	console.log("Data sent:"+JSON.stringify(lq_stats[0],null,2));
    		}else{
    			res.sendStatus(404,"LIFE QUALITY NOT FOUND");
    		}
            
        });
    	
    });
    
    // PUT LQ/XXX/YYY                                         
	app.put(BASE_API_URL+"/lq-stats/:country/:year", (req, res)=>{
		var countryparam = req.params.country;
		var yearparam = req.params.year;
		
		var encontrado = false;
		db.find({}, (err, lq_stats) =>{
			lq_stats.forEach( (c) => {
                if(c.year==yearparam && c.country==countryparam){
					encontrado = true;
					var newLQ = req.body;
					//una vez encontrado vemos que no sean nulos
					if((newLQ == "") || (newLQ.country == null) || (newLQ.year == null)){
						res.sendStatus(400,"BAD REQUEST");
					} else {
						db.remove(c);
						db.insert(newLQ); 	
						res.sendStatus(201);
						console.log("Data updated: ", newLQ);
					}
				}
            });	
		//si no hemos encontrado que coincida el año
		if (encontrado==false){
			res.sendStatus(404,"LIFE QUALITY NOT FOUND");
		}
		});
	});
        
    // DELETE LQ/XXX
    
    app.delete(BASE_API_URL+"/lq-stats/:country", (req,res)=>{
		var countryparam = req.params.country;
		var copiadb=[];
			db.remove({country: countryparam},{multi:true}, function (err, doc){
			if(doc!=0){
				res.sendStatus(200,"SUCCESFULLY DELETED");
    			}else{
    				res.sendStatus(404,"LIFE QUALITY NOT FOUND");
    			}
		   	});
    });
    
    // DELETE LQ/XXX/YYY
    app.get(BASE_API_URL+"/lq-stats/:country/:year", (req,res)=>{
        console.log("New GET .../lq-stats/:country/:year");
        var countryparam = req.params.country;
        var yearparam = req.params.year;
        var encontrado = false;
        db.find({country: countryparam}, (err, lq_stats) =>{
            lq_stats.forEach( (c) => {
                delete c._id;
                if(c.year==yearparam){
                    encontrado=true;
                    res.send(JSON.stringify(c,null,2));
                    //res.sendStatus(200,"OK");
                    console.log("Data sent:"+JSON.stringify(c,null,2));
                }
            });
            if (encontrado==false) {
                res.sendStatus(404,"LIFE QUALITY NOT FOUND");
            }

        });

    });

	// Métodos no permitidos

     app.post(BASE_API_URL+"/lq-stats/:country",(req,res) =>{
    	res.sendStatus(405,"Method Not Allowed");
    });

	app.put(BASE_API_URL+"/lq-stats", (req, res)=>{
		res.sendStatus(405,"Method Not Allowed");
	});
	
	console.log("LQ OK");
		
};