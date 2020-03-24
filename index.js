const express = require("express");
const bodyParser = require("body-parser");

var app = express();
//para la pagina inicio
app.use(bodyParser.json());
app.use("/",express.static("./public"));

var port = process.env.PORT || 80;

spc_stats = [];
lq_stats = [];
poverty_stats = [];

const BASE_API_URL = "/api/v1";

// --------------- LOAD INITIAL DATA
	// SUICIDE

		app.get(BASE_API_URL+"/spc-stats/loadInitialData",(req,res) =>{
			var ejemplos_spc = [
				{ 
					country: "guyana",
					both_sex: 30.2,
					male_rank: 3,
					male_number: 46.6,
					female_rank: 5,
					female_number: 14.2,
					ratio: 3.28,
					year: 2013,
					continent: "south america"	
				},
				{ 
					country: "lesotho",
					both_sex: 28.9,
					male_rank: 25,
					male_number: 22.7,
					female_rank: 1,
					female_number: 32.6,
					ratio: 0.7,
					year: 2013,
					continent: "africa"	
				},
				{ 
					country: "russia",
					both_sex: 26.5,
					male_rank: 1,
					male_number: 48.3,
					female_rank: 31,
					female_number: 7.5,
					ratio: 6.44,
					year: 2013,
					continent: "europe"	
				},
				{ 
					country: "lithuania",
					both_sex: 25.7,
					male_rank: 2,
					male_number: 47.5,
					female_rank: 37,
					female_number: 6.7,
					ratio: 7.09,
					year: 2013,
					continent: "europe"	
				},
				{ 
					country: "suriname",
					both_sex: 23.2,
					male_rank: 6,
					male_number: 36.1,
					female_rank: 13,
					female_number: 10.9,
					ratio: 3.31,
					year: 2013,
					continent: "south america"	
				}
			];

			spc_stats = ejemplos_spc;
			res.send(JSON.stringify(spc_stats,null,2));
			res.sendStatus(201,"DATA CREATED");
		});

// LQ-STATS

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
					country: "hong kong",
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

// POVERTY

		app.get(BASE_API_URL+"/poverty-stats/loadInitialData",(req,res) =>{
			var ejemplos_poverty = [   
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
					content:"africa"	
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

			poverty_stats = ejemplos_poverty;
			res.send(JSON.stringify(poverty_stats,null,2));
			res.sendStatus(201,"DATA CREATED");
		});


// ---------------SUICIDE

    // GET SUICIDE
    
    app.get(BASE_API_URL+"/spc-stats", (req,res) =>{
    	res.send(JSON.stringify(spc_stats,null,2));
    	console.log("Data sent:"+JSON.stringify(spc_stats,null,2));
    });
    
    // POST SUICIDE
    
    app.post(BASE_API_URL+"/spc-stats",(req,res) =>{
    	
    	var newSuicide = req.body;
    	
    	var filteredSpc_stats = spc_stats.filter((c) => {
    		return ((c.country == newSuicide.country) && (c.year == newSuicide.year));
    	});
    	
    	if((newSuicide == "") || (newSuicide.country == null) || (newSuicide.year == null)){
    		res.sendStatus(400,"BAD REQUEST");
    	} else if (filteredSpc_stats.length > 0){
    	    res.sendStatus(409,"This data already exits");
    	} else {
    		spc_stats.push(newSuicide); 	
    		res.sendStatus(201,"CREATED");
    	}
    });
    
    // DELETE SUICIDE
    
    app.delete(BASE_API_URL+"/spc-stats", (req,res)=>{
    
    	spc_stats = [];
    	console.log("spc_stats empty");
		res.sendStatus(200,"OK");

    });
    
    // GET SUICIDE/XXX
    
    app.get(BASE_API_URL+"/spc-stats/:country", (req,res)=>{
    	
    	var country = req.params.country;
    	
    	var filteredSpc_stats = spc_stats.filter((c) => {
    		return (c.country == country);
    	});
    	
    	
    	if(filteredSpc_stats.length >= 1){
    		res.send(filteredSpc_stats[0]);
    	}else{
    		res.sendStatus(404,"SUICIDE NOT FOUND");
    	}
    });
    
    // GET SUICIDE/XXX/YYY
    
    app.get(BASE_API_URL+"/spc-stats/:country/:year", (req,res)=>{
    	
    	var country = req.params.country;
    	var year = req.params.year;
    	
    	var filteredSpc_stats = spc_stats.filter((c) => {
    		return (c.country == country && c.year == year);
    	});
    	
    	if(filteredSpc_stats.length == 1){
    		res.send(filteredSpc_stats[0]);
    	}else{
    		res.sendStatus(404,"SUICIDE NOT FOUND");
    	}
    });

     // PUT SUICIDE/XXX/YYY                                          
        app.put(BASE_API_URL+"/spc-stats/:country/:year", (req, res)=>{
            var country = req.params.country;
            var year = req.params.year;
            var filteredSpc_stats = spc_stats.filter((c)=>{
                return (c.country == country && c.year == year);
            })
            
            if(filteredSpc_stats.length == 0){
                res.sendStatus(404,"SUICIDE NOT FOUND");
            }else{
                    var newSuicide = req.body;
                    
                    if((newSuicide == "") || (newSuicide.country == null) || (newSuicide.year == null)){
                		res.sendStatus(400,"BAD REQUEST");
                	} else {
                		spc_stats.push(newSuicide); 	
                		res.sendStatus(201,"CREATED");
                	}
            }

        })
        
    
    // DELETE SUICIDE/XXX
    
    app.delete(BASE_API_URL+"/spc-stats/:country", (req,res)=>{
    	
    	var country = req.params.country;
    	
    	var filteredSpc_stats = spc_stats.filter((c) => {
    		return (c.country != country);
    	});
    	
    	
    	if(filteredSpc_stats.length < spc_stats.length){
    		spc_stats = filteredSpc_stats;
    		res.sendStatus(200);
    	}else{
    		res.sendStatus(404,"SUICIDE NOT FOUND");
    	}
    });
    
    // DELETE SUICIDE/XXX/YYY
    
    app.delete(BASE_API_URL+"/spc-stats/:country/:year", (req,res)=>{
    	
    	var country = req.params.country;
    	var country = req.params.year;
    	
    	var filteredSpc_stats = spc_stats.filter((c) => {
    		return (c.country != country && c.year != year);
    	});
    	
    	
    	if(filteredSpc_stats.length < spc_stats.length){
    		spc_stats = filteredSpc_stats;
    		res.sendStatus(200);
    	}else{
    		res.sendStatus(404,"SUICIDE NOT FOUND");
    	}
    });

	//No permitidos
	
     app.post(BASE_API_URL+"/spc-stats/:country",(req,res) =>{
    	res.sendStatus(405,"Method Not Allowed");
    });

	app.put(BASE_API_URL+"/spc-stats", (req, res)=>{
		res.sendStatus(405,"Method Not Allowed");
	});
// ---------------LIFE_QUALITY

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
    	
    	if((newLQ == "") || (newLQ.country == null) ||(newLQ.year == null)){
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
                    
                if((newLQ == "") || (newLQ.country == null) || (newLQ.year == null)){
                	res.sendStatus(400,"BAD REQUEST");
                } else {
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


// ---------------POVERTY

//GET /poverty_stats
app.get(BASE_API_URL+"/poverty-stats", (req,res) =>{
    	res.send(JSON.stringify(poverty_stats,null,2));
    	console.log("Data sent:"+JSON.stringify(poverty_stats,null,2));
    });
    
//POST /poverty_stats
app.post(BASE_API_URL+"/poverty-stats", (req, res)=>{
	poverty_stats.push(req.body);
	res.sendStatus(201, "CREATED");
});

//DELETE //poverty_stats
app.delete(BASE_API_URL+"/poverty-stats",(req, res)=>{
	var poverty_stats_empty=[];
	poverty_stats=poverty_stats_empty;
	console.log("Data poverty_stats empty");
	res.sendStatus(200);
});

//GET /poverty_stats/country
app.get(BASE_API_URL+"/poverty-stats/:country", (req, res)=>{
	var country = req.params.country;
	var filtered_poverty_stats= poverty_stats.filter((c)=>{
		return (c.country == country);
	})
	if(filtered_poverty_stats.length>=1){
		res.send(JSON.stringify(filtered_poverty_stats, null, 2));
	}else{
		res.sendStatus(404,"NOT FOUND")
	}
	
});

//GET /poverty_stats/country/year
app.get(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
	var country = req.params.country;
	var year = req.params.year;	
	
	var filtered_poverty_stats= poverty_stats.filter((c)=>{
		return ((c.country == country)&&(c.year==year));
	})
	
	if(filtered_poverty_stats.length>=1){
		res.send(JSON.stringify(filtered_poverty_stats, null, 2));
	}else{
		res.sendStatus(404,"NOT FOUND")
	}
	
});

//PUT /poverty_stats/country
 app.put(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
        var country = req.params.country;
        var filtered_poverty_stats = poverty_stats.filter((c)=>{
            return ((c.country != country)&&(c.year!=year));
        })
        
        if(filteredpoverty_stats.length == poverty_stats.length){
            res.sendStatus(404,"POVERTY NOT FOUND");
        }else{
                var newResource = req.body;
                
                if((newResource == "") || (newResource.country == null)){
            		res.sendStatus(400,"BAD REQUEST");
            	} else {
            		poverty_stats.push(newResource); 	
            		res.sendStatus(201,"CREATED");
            	}
        }
    });


//DELETE /poverty_stats/country/year
app.delete(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
	var country= req.params.country;
	var year = req.params.year;
	
	var filtered_poverty_stats = poverty_stats.filter((c)=>{
		return ((c.country != country)&&(c.year != year));
	});
	
	if(filtered_poverty_stats.length==poverty_stats.length){
		res.sendStatus(404,"NOT FOUND");
	}else{
		poverty_stats=filtered_poverty_stats;
		res.sendStatus(200);
	}
});

//DELETE /poverty_stats/country
app.delete(BASE_API_URL+"/poverty-stats/:country", (req, res)=>{
	var country= req.params.country;
	
	var filtered_poverty_stats = poverty_stats.filter((c)=>{
		return (c.country != country);
	});
	
	if(filtered_poverty_stats.length==poverty_stats.length){
		res.sendStatus(404,"NOT FOUND");
	}else{
		poverty_stats=filtered_poverty_stats;
		res.sendStatus(200);
	}
});
//----------------FIN POVERTY

app.listen(port, () => {
	console.log("Server ready");
});
//aaaaaa
//Inicio serv
console.log("Starting server...");