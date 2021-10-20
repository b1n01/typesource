<script>
  import { Link, navigate } from "svelte-routing";
  import Modal from "./common/Modal";
  import Box from "./common/Box";
  import Button from "./common/Button";
  import { login } from "../firebase";

  // If we came from same domain go back to the
  // previous page otherwise go to the home page
  const goBack = () => {
    if (document.referrer) {
      let referrer = new URL(document.referrer);
      if (referrer.origin == window.origin) {
        history.back();
      }
    }
    navigate("/");
  };
</script>

<Modal visible class="h-full items-center justify-center">
  <Box class="max-w-md text-center">
    <div class="p-8 px-16">
      <h1 class="text-2xl font-bold ">Sign in to Typesource</h1>
      <ul class="mt-8">
        <li>📊 Track your daily progress</li>
        <li>🏁 Race against other players</li>
      </ul>
      <Button
        class="mt-8 flex items-center mx-auto"
        on:click={() => login().then(goBack)}
      >
        <img width="16px" src="images/github.svg" alt="Github logo" />
        <span class="ml-4">Sign in with Github</span>
      </Button>
      <Link href="/" class="text-xs text-gray-500 mt-4 block cursor-pointer">
        Not now, take me back to the home page
      </Link>
    </div>
  </Box>
</Modal>
