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

	
	//loadInitialData
	app.get(BASE_API_URL+"/spc-stats/loadInitialData",(req,res) =>{
		//borrar lo que había
		db.remove({},{multi:true}, function (err, doc){});
		console.log("New GET .../loadInitialData");
		
		db.insert(ejemplos_spc);
		res.send(JSON.stringify(ejemplos_spc,null,2));
        console.log("Initial spc loaded:"+JSON.stringify(ejemplos_spc,null,2));
		});

	//GET /spc_stats con paginacion
	app.get(BASE_API_URL+"/spc-stats", (req,res) =>{
		const limit = req.query.limit;
		const offset = req.query.offset;

		const countryQuery = req.query.country;
		const yearQuery = req.query.year;
		const continenteQuery = req.query.continent;
		const female_rank_Query = req.query.female_rank;
		const male_rank_Query = req.query.male_rank;
		const both_sex_Query = req.query.both_sex;
		const female_number_Query = req.query.female_number;
		const male_number_Query = req.query.male_number;
		const ratio_Query = req.query.ratio;

		const startObject = offset-1;                //comienzo del primer objeto de la pagina
		const endObject = parseInt(startObject) + parseInt(limit);                    //ultimo objeto de la pagina

		db.find({}, (err, spc_stats) =>{
			spc_stats.forEach( (c) => {
				delete c._id;
			});
			var copiadb = spc_stats;


			if(limit!=null && offset != null && countryQuery==null && continenteQuery==null && yearQuery==null && female_rank_Query==null && male_rank_Query==null
				 && both_sex_Query==null && female_number_Query==null && male_number_Query==null && ratio_Query==null){	//Get /spc_stats Paginacion
				res.send(JSON.stringify(spc_stats.slice(startObject,endObject),null,2));
			}


			if (countryQuery==null && yearQuery==null && continenteQuery==null && female_rank_Query==null && male_rank_Query==null && both_sex_Query==null 
				&& female_number_Query==null && male_number_Query==null && ratio_Query==null && limit==null && offset == null) { //get normal
				res.send(JSON.stringify(spc_stats,null,2));

			} if (countryQuery!=null || yearQuery!=null || continenteQuery!=null || female_rank_Query!=null || male_rank_Query!=null || both_sex_Query!=null
				|| female_number_Query!=null || male_number_Query!=null || ratio_Query!=null) { //busquedas

				if (countryQuery!=null) {			//country
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].country!=countryQuery) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 
				if (yearQuery!=null) {			//year
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].year!=parseInt(yearQuery)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (continenteQuery!=null) {			//continente
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].continent!=continenteQuery) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (female_rank_Query!=null) {			//female_rank
					for(var i=0;i<copiadb.length;i++){
						console.log(parseInt(female_rank_Query))
						if (copiadb[i].female_rank!=parseInt(female_rank_Query)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (both_sex_Query!=null) {			//male_rank
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].both_sex>parseInt(both_sex_Query)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (male_rank_Query!=null) {			//male_rank
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].male_rank!=parseInt(male_rank_Query)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (female_number_Query!=null) {			//male_rank
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].female_number>parseInt(female_number_Query)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (male_number_Query!=null) {			//male_rank
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].male_number_Query>parseInt(male_number_Query)) {
							copiadb.splice(i,1)
							i--;
						}
					}
				} 

				if (ratio_Query!=null) {			//male_rank
					for(var i=0;i<copiadb.length;i++){
						if (copiadb[i].ratio>parseInt(ratio_Query)) {
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


    // POST SUICIDE
    
    app.post(BASE_API_URL+"/spc-stats",(req,res) =>{
    	
    	var newSuicide = req.body;
    	
		db.find({country:newSuicide.country},{ year: newSuicide.year}, (err, spc_stats) =>{
			
			if((newSuicide == "") || (newSuicide.country == null) || (newSuicide.year == null)){
    			res.sendStatus(400,"BAD REQUEST");
    		} else if (spc_stats.length > 0){
    		    res.sendStatus(409,"This data already exits");
  		  	} else {
    			db.insert(newSuicide); 	
				console.log("Data created:"+JSON.stringify(newSuicide,null,2));
				var array = Array(newSuicide);
				res.send(JSON.stringify(array,null,2));
    	}
        });
    	
    	
    });
    
    // DELETE SUICIDE
    
    app.delete(BASE_API_URL+"/spc-stats", (req,res)=>{
    
		db.remove({},{multi:true}, function (err, doc){});
		db.find({}, (err, spc_stats) =>{
			if (spc_stats.length==0){
				console.log("Data spc-stats empty");
				res.sendStatus(200);
			} else {
				res.sendStatus(400,"BAD REQUEST");
			};
		});
    });
    
    // GET SUICIDE/XXX
    
    app.get(BASE_API_URL+"/spc-stats/:country", (req,res)=>{
    	console.log("New GET .../spc-stats/country");
		var countryparam = req.params.country;
		
        db.find({country: countryparam}, (err, spc_stats) =>{
            spc_stats.forEach( (c) => {
                delete c._id;
            });

			if(spc_stats.length >= 1){
				res.send(JSON.stringify(spc_stats[0],null,2));
				//res.sendStatus(200,"OK");
            	console.log("Data sent:"+JSON.stringify(spc_stats[0],null,2));
    		}else{
    			res.sendStatus(404,"SUICIDE NOT FOUND");
    		}
    	});
    	
    });
    
    // GET SUICIDE/XXX/YYY
    
    app.get(BASE_API_URL+"/spc-stats/:country/:year", (req,res)=>{
    	console.log("New GET .../spc-stats/:country/:year");
		var countryparam = req.params.country;
		var yearparam = req.params.year;
		var encontrado = false;
        db.find({country: countryparam}, {year: yearparam}, (err, spc_stats) =>{
            spc_stats.forEach( (c) => {
				delete c._id;});
			
			if(spc_stats.length>0){
				res.send(JSON.stringify(spc_stats[0],null,2));
			}else{
				res.sendStatus(404,"DATA NOT FOUND");
			}

        });
    	
    });

     // PUT SUICIDE/XXX/YYY                                          
	app.put(BASE_API_URL+"/spc-stats/:country/:year", (req, res)=>{
		var countryparam = req.params.country;
		var yearparam = req.params.year;
		
		//para ver si encuentro el bicho (no funcionaba el filtro)
		var encontrado = false;
		db.find({}, (err, spc_stats) =>{
			spc_stats.forEach( (c) => {
                if(c.year==yearparam && c.country==countryparam){
					encontrado = true;
					var newSuicide = req.body;
					//una vez encontrado vemos que no sean nulos
					if((newSuicide == "") || (newSuicide.country == null) || (newSuicide.year == null)){
						res.sendStatus(400,"BAD REQUEST");
					} else {
						db.remove(c);
						db.insert(newSuicide); 	
						res.sendStatus(201);
						console.log("Data updated: ", newSuicide);
					}
				}
            });	
		//si no hemos encontrado que coincida el año
		if (encontrado==false){
			res.sendStatus(404,"SUICIDE NOT FOUND");
		}
		});
	});
    
    // DELETE SUICIDE/XXX
    
    app.delete(BASE_API_URL+"/spc-stats/:country", (req,res)=>{
		var countryparam = req.params.country;
		        
		db.remove({country: countryparam},{multi:true}, function (err, doc){
		if(doc!=0){
			res.sendStatus(200,"SUCCESFULLY DELETED");
			}else{
				res.sendStatus(404,"SUICIDE NOT FOUND");
			}
			});
    });
    
    // DELETE SUICIDE/XXX/YYY
    
    app.delete(BASE_API_URL+"/spc-stats/:country/:year", (req,res)=>{
    	var yearparam = req.params.year;
    	var countryparam = req.params.country;
		
		db.remove({country: countryparam}, {year: countryparam}, function (err, doc){
			if(doc!=0){
				res.sendStatus(200,"SUCCESFULLY DELETED");
			}else{
				res.sendStatus(404,"SUICIDE NOT FOUND");
			}
		});
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