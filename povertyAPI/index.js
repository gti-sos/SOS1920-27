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
	app.get(BASE_API_URL+"/poverty-stats", (req,res) =>{
	
		db.find({}, (err, poverty_stats)=>{
			res.send(JSON.stringify(poverty_stats,null,2));
			console.log("Data sent:"+JSON.stringify(poverty_stats,null,2));
		});
	});

	//POST /poverty_stats
	app.post(BASE_API_URL+"/poverty-stats", (req, res)=>{
		//poverty_stats.push(req.body);
		
		res.sendStatus(201, "CREATED");
	});

	//PUT /poverty_stats
	app.put(BASE_API_URL+"/poverty-stats",(req, res)=>{
		res.sendStatus(405, "METHOD NOT ALLOWED");
	})

	//DELETE /poverty_stats
	app.delete(BASE_API_URL+"/poverty-stats",(req, res)=>{
		db.remove({},{multi:true}, function (err, doc){});
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
			var year = req.params.year;
			var filtered_poverty_stats = poverty_stats.filter((c)=>{
				return ((c.country != country) || (c.year!=year));
			})

			if(filtered_poverty_stats.length == poverty_stats.length){
				res.sendStatus(404,"POVERTY NOT FOUND");
			}else{
					var newResource = req.body;

					if((newResource == "") || (newResource.country == null)){
						res.sendStatus(400,"BAD REQUEST");
					} else {
						poverty_stats = filtered_poverty_stats;
						poverty_stats.push(newResource);
						res.sendStatus(201,"CREATED");
					}
			}
		});

	//POST /poverty_stats/country (ERROR)
	app.post(BASE_API_URL+"/poverty-stats/:country", (req, res)=>{
		res.sendStatus(405,"METHOD NOT ALLOWED");
	})

	//DELETE /poverty_stats/country/year
	app.delete(BASE_API_URL+"/poverty-stats/:country/:year", (req, res)=>{
		var country= req.params.country;
		var year = req.params.year;

		var filtered_poverty_stats = poverty_stats.filter((c)=>{
			return ((c.country != country ) || (c.year != year));
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
	
	console.log("POVERTY OK");
    
};