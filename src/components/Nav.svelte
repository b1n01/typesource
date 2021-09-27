<script>
  import { Link } from "svelte-routing";
  import { login, logout } from "../firebase";
  import { user } from "../stores";
</script>

<nav class="bg-float text-white font-bold min-w-lg">
  <div class="mx-auto px-8 h-16 flex max-w-screen-2xl">
    <img width="22px" src="images/logo.svg" alt="Typesource logo" />
    <h1 class="text-2xl p-4"><Link to="/">Typesource</Link></h1>
    <ul class="ml-auto self-center flex">
      {#if $user}
        <li class="px-4"><Link to="/stats">Stats</Link></li>
        {#if !$user.isAnonymous}
          <li class="pl-2 cursor-pointer" on:click={logout}>Logout</li>
        {:else}
          <li class="cursor-pointer" on:click={login}>Signin</li>
        {/if}
      {/if}
    </ul>
  </div>
</nav>
