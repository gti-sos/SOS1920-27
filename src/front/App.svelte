<script>
	import Router from 'svelte-spa-router'
	
	import NotFound from './NotFound.svelte';

	import Home from './Home.svelte';

	import GUI1SPC from './GUI1SPC/Home.svelte';
	import GUI1SPCHighChart from './GUI1SPC/HighChart.svelte';
	import GUI1SPCApexChart from './GUI1SPC/ApexChart.svelte';
	import EditSpc from './GUI1SPC/EditSpc.svelte';

	import GUI2POVERTY from './GUI2POVERTY/Home.svelte';
	import EditPoverty from './GUI2POVERTY/EditPoverty.svelte';
	//import GUI2PovertyHighChart from "./GUI2POVERTY/HighChart.svelte";
	
	import GUI3LQ from './GUI3LQ/Home.svelte';
	import EditLq from './GUI3LQ/EditLq.svelte';
	
	const routes = {
		"/" : Home,
		"/public/index.html" : Home,
		"/gui1spc": GUI1SPC,
		"/gui1SPCHighChart": GUI1SPCHighChart,
		"/gui1SPCApexChart": GUI1SPCApexChart,
		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
		"/gui2poverty": GUI2POVERTY,
		"/poverty-stats/:country/:year":EditPoverty,
		"/gui3lq": GUI3LQ,
		"/lq-stats/:lqCountry/:lqYear":EditLq,
		"*": NotFound
	};
</script>

<main>
	<Router {routes} />
</main>