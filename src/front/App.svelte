<script>
	import Router from 'svelte-spa-router'
	
	import NotFound from './NotFound.svelte';

	import Home from './Home.svelte';
	import About from './About.svelte';
	import Analytics from './Analytics.svelte';

	import GUI1SPC from './GUI1SPC/Home.svelte';
	import GUI1SPCHighChart from './GUI1SPC/HighChart.svelte';
	import GUI1SPCChartist from './GUI1SPC/Chartist.svelte';
	import EditSpc from './GUI1SPC/EditSpc.svelte';
	import GUI1SPCIntegrations from './GUI1SPC/Integrations.svelte'; //integraciones

	import GUI2POVERTY from './GUI2POVERTY/Home.svelte';
	import EditPoverty from './GUI2POVERTY/EditPoverty.svelte';
	import GUI2PovertyHighChart from "./GUI2POVERTY/Highchart.svelte";
	import GUI2PovertyChartJS from './GUI2POVERTY/ChartJS.svelte';
	import GUI2PovertyIntegrations from './GUI2POVERTY/Integrations.svelte'; //integraciones
	
	import GUI3LQ from './GUI3LQ/Home.svelte';
	import GUI3LQHighChart from './GUI3LQ/HighChart.svelte';
	import GUI3LQApexChart from './GUI3LQ/ApexChart.svelte';
	import EditLq from './GUI3LQ/EditLq.svelte';
	import GUI3LQIntegrations from './GUI3LQ/Integrations.svelte'; //integraciones

	const routes = {
		"/" : Home,
		"/public/index.html" : Home,
		"/about" : About,
		"/analytics" : Analytics,
		
		"/gui1spc": GUI1SPC,
		"/gui1SPCHighChart": GUI1SPCHighChart,
		"/gui1SPCChartist": GUI1SPCChartist,
		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
		"/integrations/gui1integrations": GUI1SPCIntegrations,

		"/gui2poverty": GUI2POVERTY,
		"/gui2povertyHighChart": GUI2PovertyHighChart,
		"/poverty-stats/:country/:year":EditPoverty,
		"/integrations/gui2integrations": GUI2PovertyIntegrations,
		"/gui2povertyChartJS":GUI2PovertyChartJS,

		"/gui3lq": GUI3LQ,
		"/gui3LQHighChart": GUI3LQHighChart,
		"/gui3LQApexChart": GUI3LQApexChart,
		"/lq-stats/:lqCountry/:lqYear":EditLq,
		"/integrations/gui3integrations": GUI3LQIntegrations,

		"*": NotFound
	};
</script>

<main>
	<Router {routes} />
</main>