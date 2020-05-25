<script>
	import Router from 'svelte-spa-router'
	
	import NotFound from './NotFound.svelte';

	import Home from './Home.svelte';

	import GUI1SPC from './GUI1SPC/Home.svelte';
	import GUI1SPCHighChart from './GUI1SPC/HighChart.svelte';
	import GUI1SPCApexChart from './GUI1SPC/ApexChart.svelte';
	import EditSpc from './GUI1SPC/EditSpc.svelte';
	import GUI1SPCIntegrations from './GUI1SPC/Integrations.svelte'; //integraciones

	import GUI2POVERTY from './GUI2POVERTY/Home.svelte';
	import EditPoverty from './GUI2POVERTY/EditPoverty.svelte';
<<<<<<< HEAD
	import GUI2POVERTYChart from './GUI2POVERTY/Highchart.svelte';

=======
	import GUI2PovertyHighChart from "./GUI2POVERTY/HighChart.svelte";
	import GUI2SPCIntegrations from './GUI2POVERTY/Integrations.svelte'; //integraciones
	
>>>>>>> 6a6796be8db7d3f2513bfc7466c25a008491a508
	import GUI3LQ from './GUI3LQ/Home.svelte';
	import EditLq from './GUI3LQ/EditLq.svelte';
	import GUI3SPCIntegrations from './GUI3LQ/Integrations.svelte'; //integraciones

	const routes = {
		"/" : Home,
<<<<<<< HEAD
		"/public/index.html": Home,
=======
		"/public/index.html" : Home,
		
>>>>>>> 6a6796be8db7d3f2513bfc7466c25a008491a508
		"/gui1spc": GUI1SPC,
		"/gui1SPCHighChart": GUI1SPCHighChart,
		"/gui1SPCApexChart": GUI1SPCApexChart,
		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
		"/integrations/gui1integrations": GUI1SPCIntegrations,

		"/gui2poverty": GUI2POVERTY,
<<<<<<< HEAD
		"/poverty-stats/:country/:year": EditPoverty,
		"/gui2povertyHighChart": GUI2POVERTYChart,
		"/gui3lq": GUI3LQ,
		"/lq-stats/:lqCountry/:lqYear": EditLq,
=======
		"/gui2povertyHighChart": GUI2PovertyHighChart,
		"/poverty-stats/:country/:year":EditPoverty,
		"/integrations/gui2integrations": GUI2SPCIntegrations,

		"/gui3lq": GUI3LQ,
		"/lq-stats/:lqCountry/:lqYear":EditLq,
		"/integrations/gui3integrations": GUI3SPCIntegrations,

>>>>>>> 6a6796be8db7d3f2513bfc7466c25a008491a508
		"*": NotFound
	};
</script>

<main>
	<Router {routes} />
</main>