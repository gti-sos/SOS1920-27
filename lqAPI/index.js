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
				}
			];


	//loadInitialData	
	app.get(BASE_API_URL+"/lq-stats/loadInitialData",(req,res) =>{
		//borrar lo que había
		db.remove({},{multi:true}, function (err, doc){});
		console.log("New GET .../loadInitialData");
		
		db.insert(ejemplos_lq);
		res.sendStatus(200);
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
	
	
	
	
    // POST LIFE-QUALITY		
	
	app.post(BASE_API_URL+"/lq-stats",(req,res) =>{
    	
    	var newLQ = req.body;
    	
		db.find({country:newLQ.country, year: newLQ.year}, (err, lq_stats) =>{
			
			if((newLQ == "") || (newLQ.country == null) || (newLQ.year == null)){
    			res.sendStatus(400,"BAD REQUEST");
    		} else if (lq_stats.length > 0){
    		    res.sendStatus(409,"This data already exits");
  		  	} else {
    			db.insert(newLQ); 	
				console.log("Data created:"+JSON.stringify(newLQ,null,2));
   		 		res.sendStatus(201,"CREATED");
    	}
        });
    	
    	
    });
    
    
    
    // DELETE LIFE-QUALITY
    
    app.delete(BASE_API_URL+"/lq-stats", (req,res)=>{
    
        db.remove({},{multi:true}, function (err, doc){});
        console.log("Data lq-stats empty");
        res.sendStatus(200);
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
		
		//para ver si encuentro el bicho (no funcionaba el filtro)
		var encontrado = false;
		db.getAllData().forEach( (c) => {
			if(c.year==yearparam && c.country==countryparam){
				encontrado = true;
				var newLQ = req.body;
				//una vez encontrado vemos que no sean nulos
				if((newLQ == "") || (newLQ.country == null) || (newLQ.year == null)){
					res.sendStatus(400,"BAD REQUEST");
				} else {
					db.remove(c);
					db.insert(newLQ); 	
					res.sendStatus(201,"UPDATED");
				}
			}
		})
		//si no hemos encontrado que coincida el año
		if (encontrado==false){
			res.sendStatus(404,"LIFE QUALITY NOT FOUND");
		}
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