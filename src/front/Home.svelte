<script>
    import {
        onMount
    } from "svelte";
    import {
        pop
    } from "svelte-spa-router";
 
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
 
</script> 
 <main>
 <br>
<Button outline color="secondary"><a href="#/gui1SPC"> GUI spc</a></Button>
<Button outline color="secondary"><a href="#/gui2poverty"> GUI poverty</a></Button>
<Button outline color="secondary"><a href="#/gui3lq"> GUI lq</a></Button>

<br>
<br>
<Button outline color="secondary" on:click="{pop}">Volver</Button>
</main>