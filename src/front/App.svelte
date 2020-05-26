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
	import GUI2PovertyHighChart from "./GUI2POVERTY/Highchart.svelte";
	import GUI2PovertyApexChart from './GUI2POVERTY/ApexChart.svelte';
	import GUI2PovertyIntegrations from './GUI2POVERTY/Integrations.svelte'; //integraciones
	
	import GUI3LQ from './GUI3LQ/Home.svelte';
	import GUI3LQHighChart from './GUI3LQ/HighChart.svelte';
	import GUI3LQApexChart from './GUI3LQ/ApexChart.svelte';
	import EditLq from './GUI3LQ/EditLq.svelte';
	import GUI3SPCIntegrations from './GUI3LQ/Integrations.svelte'; //integraciones

	const routes = {
		"/" : Home,
		"/public/index.html" : Home,
		
		"/gui1spc": GUI1SPC,
		"/gui1SPCHighChart": GUI1SPCHighChart,
		"/gui1SPCApexChart": GUI1SPCApexChart,
		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
		"/integrations/gui1integrations": GUI1SPCIntegrations,

		"/gui2poverty": GUI2POVERTY,
		"/gui2povertyHighChart": GUI2PovertyHighChart,
		"/poverty-stats/:country/:year":EditPoverty,
		"/integrations/gui2integrations": GUI2PovertyIntegrations,
		"/gui2povertyApexChart":GUI2PovertyApexChart,

		"/gui3lq": GUI3LQ,
		"/gui3LQHighChart": GUI3LQHighChart,
		"/gui3LQApexChart": GUI3LQApexChart,
		"/lq-stats/:lqCountry/:lqYear":EditLq,
		"/integrations/gui3integrations": GUI3SPCIntegrations,

		"*": NotFound
	};
</script>

<main>
	<Router {routes} />
</main>