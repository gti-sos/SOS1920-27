module.exports = function (app) {
    console.log("Registering spc API....");
    
    const dataStore = require("nedb")
    const path = require("path");


    const dbFileName = path.join(__dirname, "spc.db");

    const BASE_API_URL="/api/v1";

    const db = new dataStore({
                filename: dbFileName,
                autoload: true
                });

    
    var spc_stats = [];

	app.get(BASE_API_URL+"/spc-stats/loadInitialData",(req,res) =>{
		console.log("New GET .../loadInitialData");
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
						spc_stats = filteredSpc_stats;
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
	
	console.log("SPC OK");
    
};