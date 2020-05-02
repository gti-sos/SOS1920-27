<script>
    import {
        onMount
    } from "svelte";
 
    import Table from "sveltestrap/src/Table.svelte";
    import Button from "sveltestrap/src/Button.svelte";
 
    let contacts = [];
    let newContact = {
        name: "",
        phone: "",
        email: ""
    };
 
    onMount(getContacts);
 
    async function getContacts() {
 
        console.log("Fetching contacts...");
        const res = await fetch("/api/v1/contacts");
 
        if (res.ok) {
            console.log("Ok:");
            const json = await res.json();
            contacts = json;
            console.log("Received " + contacts.length + " contacts.");
        } else {
            console.log("ERROR!");
        }
    }
 
    async function insertContact() {
 
        console.log("Inserting contact..." + JSON.stringify(newContact));
 
        const res = await fetch("/api/v1/contacts", {
            method: "POST",
            body: JSON.stringify(newContact),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (res) {
            getContacts();
        });
 
    }
    async function deleteContact(name) {
        const res = await fetch("/api/v1/contacts/" + name, {
            method: "DELETE"
        }).then(function (res) {
            getContacts();
        });
    }
</script>
 
<main>
 
    {#await contacts}
        Loading contacts...
    {:then contacts}
        <Table bordered>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><input bind:value="{newContact.name}"></td>
                    <td><input bind:value="{newContact.email}"></td>
                    <td><input bind:value="{newContact.phone}"></td>
                    <td> <Button outline  color="primary" on:click={insertContact}>Insert</Button> </td>
                </tr>
 
                {#each contacts as contact}
                    <tr>
                        <td><a href="#/contact/{contact.name}">{contact.name}</a></td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                        <td><Button outline color="danger" on:click="{deleteContact(contact.name)}">Delete</Button></td>
                    </tr>
                {/each}
            </tbody>
        </Table>
    {/await}
 
 
</main>