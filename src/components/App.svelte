<script>
  import { Router, Route } from "svelte-routing";
  import Nav from "./Nav";
  import Editor from "./Editor";
  import Explorer from "./Explorer";
  import Match from "./Match";
  import Debug from "./Debug";
  import InfoBox from "./InfoBox";
  import Stats from "./Stats";
  import Chart from "./Chart";
  import Modal from "./common/Modal";
  import Signin from "./Signin";
  import { userState } from "../states";
</script>

<Router>
  <Nav />
  <div class="mx-auto flex min-w-lg max-w-screen-2xl">
    <Route path="/">
      <div class="w-1/3 m-4 mr-2 xl:m-8 xl:mr-4 2xl:w-1/4">
        <div class="mb-4 xl:mb-8">
          <InfoBox />
        </div>
        <div class="mb-4 xl:mb-8">
          <Explorer />
        </div>
        <!-- <div>
          <Match />
        </div> -->
      </div>
      <div class="w-2/3 m-4 ml-2 xl:m-8 xl:ml-4 2xl:w-3/4">
        <Editor />
      </div>
      <Modal visible={$userState.matches("offline.ended")}>
        <Chart />
      </Modal>
    </Route>
    <Route path="stats">
      <Stats />
    </Route>
    <Route path="signin">
      <Signin />
    </Route>
  </div>
  {#if process.env.NODE_ENV === "development"}
    <Debug />
  {/if}
</Router>
