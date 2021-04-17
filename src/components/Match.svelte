<script>
  import Input from "./Input.svelte";
  import Button from "./Button.svelte";
  import * as Y from "yjs";
  import { WebrtcProvider } from "y-webrtc";
  import { fileContent, fileUrl, position, players } from "../stores";

  const url = new URL(window.location.href);
  let roomReady = false; // wheter the room is ready tro trigger update shared ydoc
  let roomKey; // the room key
  let ydoc = new Y.Doc();
  let fileMap = ydoc.getMap("file"); // store the url of the selected file
  let awareness; // keeps all connected players states

  // TODO remove this
  let userId;

  // Sync file url and content
  const syncFile = (e) => {
    if (e.transaction.local) return;

    // Set the room as ready to trigger updates
    roomReady = true;

    if (
      e.keysChanged.has("content") &&
      $fileContent !== fileMap.get("content")
    ) {
      fileContent.set(fileMap.get("content"));
    }
    if (e.keysChanged.has("url") && $fileUrl !== fileMap.get("url")) {
      fileUrl.set(fileMap.get("url"));
    }
  };

  // Generate a random room key
  const generateRoomKey = () => {
    return Math.random().toString(36).substring(6);
  };

  // Set the roomKey as url query string
  const updateUrlRoomKey = (roomKey = "") => {
    if (roomKey) {
      url.searchParams.set("r", roomKey);
    } else {
      url.searchParams.delete("r");
    }
    window.history.pushState({ path: url.href }, "", url.href);
  };

  // Set initial user state
  const initAwareness = () => {
    awareness.setLocalState({
      uid: userId,
      position: $position,
    });
  };

  // Listen for awareness changes and update local cursors positions
  const handleAwareness = () => {
    awareness.on("change", (changes) => {
      let states = [];
      [...awareness.getStates().values()].forEach((state) => {
        if (state.uid != userId) states.push(state);
      });

      $players = states;
    });
  };

  // Create and join a room
  const createRoom = () => {
    roomKey = generateRoomKey();
    roomReady = true;
    joinRoom(roomKey);
  };

  // Join a room
  const joinRoom = (roomKey) => {
    updateUrlRoomKey(roomKey);

    let provider = new WebrtcProvider(roomKey, ydoc);
    awareness = provider.awareness;
    initAwareness();
    handleAwareness();

    fileMap.observe(syncFile);
  };

  // Leave the room
  const leaveRoom = () => {
    roomKey = null;
    roomReady = false;
    updateUrlRoomKey();
    awareness.destroy();
    ydoc.destroy();
  };

  // Todo remove this -----
  if (url.searchParams.has("uid")) {
    userId = url.searchParams.get("uid");
  } else {
    userId = Math.random().toString(36).substring(7);
    url.searchParams.set("uid", userId);
    window.history.pushState({ path: url.href }, "", url.href);
  }
  // ---------------------

  // If the `r` param is set join the room
  if (url.searchParams.has("r")) {
    roomKey = url.searchParams.get("r");
    joinRoom(roomKey);
  }

  $: if (roomReady && $fileContent !== fileMap.get("content")) {
    fileMap.set("content", $fileContent);
  }

  $: if (roomReady && $fileUrl !== fileMap.get("url")) {
    fileMap.set("url", $fileUrl);
  }

  $: if (roomReady && $position) {
    awareness.setLocalStateField("position", $position);
  }
</script>

<div class="p-4 rounded bg-float text-white flex flex-col">
  <h1 class="font-bold">Match</h1>

  {#if !roomReady}
    <Button label="Create a room" class="mt-4" on:click={createRoom} />
  {:else}
    <div class="flex mt-4">
      <Input value={url.origin + `?r=${roomKey}`} readonly />
      <Button label="Copy" class="ml-4" />
    </div>
    <Button label="Leave room" class="mt-4" danger on:click={leaveRoom} />
  {/if}
  <Button
    label="Log map"
    class="mt-4"
    on:click={() => console.log(fileMap.toJSON(), awareness.getStates())}
  />
</div>
