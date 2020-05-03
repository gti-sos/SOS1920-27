<script>
	import Router from 'svelte-spa-router'
	import ContactsTable from './ContactsTable.svelte';
	import EditContact from './EditContact.svelte';
	
	
	import NotFound from './NotFound.svelte';

	import Home from './Home.svelte';

	import GUI1SPC from './GUI1SPC/Home.svelte';
	import EditSpc from './GUI1SPC/EditSpc.svelte';

	import GUI2POVERTY from './GUI2POVERTY/Home.svelte';
	
	import GUI3LQ from './GUI3LQ/Home.svelte';
	
	const routes = {
		"/" : Home,
		"/gui1spc": GUI1SPC,
		"/spc-stats/:suicideCountry/:suicideYear": EditSpc,
		"/gui2poverty": GUI2POVERTY,
		"/gui3lq": GUI3LQ,
		"/contact/:contactName": EditContact,
		"*": NotFound
	};
</script>

<main>
	<!--<h1>Contact Manager</h1>-->
	<Router {routes} />
</main>