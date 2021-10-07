<script>
  import { Router, Route } from "svelte-routing";
  import Nav from "./Nav.svelte";
  import Editor from "./Editor.svelte";
  import Explorer from "./Explorer.svelte";
  import Match from "./Match.svelte";
  import Debug from "./Debug.svelte";
  import InfoBox from "./InfoBox.svelte";
  import Stats from "./Stats.svelte";
  import Chart from "./Chart.svelte";
  import Modal from "./Modal.svelte";
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
        <div>
          <Match />
        </div>
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
  </div>
  <Debug />
</Router>
