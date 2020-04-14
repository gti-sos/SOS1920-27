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

    
    var lq_stats = [];

	app.get(BASE_API_URL+"/lq-stats/loadInitialData",(req,res) =>{
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

			lq_stats = ejemplos_lq;
			res.send(JSON.stringify(lq_stats,null,2));
			res.sendStatus(201,"DATA CREATED");
		});


    // GET LIFE_QUALITY
    
        app.get(BASE_API_URL+"/lq-stats", (req,res) =>{
    	res.send(JSON.stringify(lq_stats,null,2));
    	console.log("Data sent:"+JSON.stringify(lq_stats,null,2));
    });
    
    // POST LIFE-QUALITY
    
    app.post(BASE_API_URL+"/lq-stats",(req,res) =>{
    	
    	var newLQ = req.body;
    	var filteredLQ = lq_stats.filter((c) => {
    		return ((c.country == newLQ.country) && (c.year == newLQ.year));
    	});
    	
    	if((newLQ === "") || (newLQ.country === null) ||(newLQ.year === null)){
    		res.sendStatus(400,"BAD REQUEST");
    	} else if(filteredLQ.length > 0){
    	    res.sendStatus(409,"This data already exits");
    	}
    	else {
    		lq_stats.push(newLQ); 	
    		res.sendStatus(201,"CREATED");
    	}
    });
    
    
    // DELETE LIFE-QUALITY
    
    app.delete(BASE_API_URL+"/lq-stats", (req,res)=>{
    
    	lq_stats = [];
    	console.log("lq-stats empty");
		res.sendStatus(200,"OK");

    });

    // GET LQ-STATS/XXX
    
    app.get(BASE_API_URL+"/lq-stats/:country", (req,res)=>{
    	
    	var country = req.params.country;
    	
    	var filteredLq_stats = lq_stats.filter((c) => {
    		return (c.country == country);
    	});
    	
    	
    	if(filteredLq_stats.length >= 1){
    		res.send(filteredLq_stats[0]);
    	}else{
    		res.sendStatus(404,"LIFE-QUALITY NOT FOUND");
    	}
    });
    
    // GET LQ-STATS/XXX/YYY
    
    app.get(BASE_API_URL+"/lq-stats/:country/:year", (req,res)=>{
    	
    	var country = req.params.country;
    	var year = req.params.year;
    	
    	var filteredLq_stats = lq_stats.filter((c) => {
    		return (c.country == c.country && c.year == year);
    	});
    	
    	
    	if(filteredLq_stats.length >= 1){
    		res.send(filteredLq_stats[0]);
    	}else{
    		res.sendStatus(404,"LIFE-QUALITY NOT FOUND");
    	}
    });
    
    // PUT LQ/XXX/YYY
    
    app.put(BASE_API_URL+"/lq-stats/:country/:year", (req, res)=>{
        var country = req.params.country;
        var year = req.params.year;
        var filteredLq_stats = lq_stats.filter((c)=>{
            return (c.country == country && c.year == year);
        });
            
        if(filteredLq_stats.length == 0){
            res.sendStatus(404,"LIFE-QUALITY NOT FOUND");
        }else{
                 var newLQ = req.body;
                    
                if((newLQ === "") || (newLQ.country === null) || (newLQ.year === null)){
                	res.sendStatus(400,"BAD REQUEST");
                } else {
					lq_stats = filteredLq_stats;
                	lq_stats.push(newLQ); 	
                	res.sendStatus(201,"CREATED");
                }
            }

        })
        
    // DELETE LQ/XXX
    
    app.delete(BASE_API_URL+"/lq-stats/:country", (req,res)=>{
    	
    	var country = req.params.country;
    	
    	var filteredLq_stats = lq_stats.filter((c) => {
    		return (c.country != country);
    	});
    	
    	
    	if(filteredLq_stats.length < lq_stats.length){
    		lq_stats = filteredLq_stats;
    		res.sendStatus(200);
    	}else{
    		res.sendStatus(404,"LIFE-QUALITY NOT FOUND");
    	}
    });
    
    // DELETE LQ/XXX/YYY
    
    app.delete(BASE_API_URL+"/lq-stats/:country/:year", (req,res)=>{
    	
    	var country = req.params.country;
    	var country = req.params.year;
    	
    	var filteredLq_stats = lq_stats.filter((c) => {
    		return (c.country != country && c.year != year);
    	});
    	
    	
    	if(filteredLQ_stats.length < lq_stats.length){
    		lq_stats = filteredLq_stats;
    		res.sendStatus(200);
    	}else{
    		res.sendStatus(404,"LIFE-QUALITY NOT FOUND");
    	}
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