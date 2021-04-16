<script>
  import Input from "./Input.svelte";
  import Button from "./Button.svelte";
  import * as Y from "yjs";
  import { WebrtcProvider } from "y-webrtc";
  import { fileContent, fileUrl } from "../stores";

  const url = new URL(window.location.href);
  let roomReady = false; // wheter the room is ready tro trigger updatemaps
  let roomKey; // the room  key
  let ydoc = new Y.Doc();
  let fileMap = ydoc.getMap("file"); // store the url of the selected file

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

  // Create and join a room
  const createRoom = () => {
    roomKey = generateRoomKey();
    roomReady = true;
    joinRoom(roomKey);
  };

  // Join a room
  const joinRoom = (roomKey) => {
    updateUrlRoomKey(roomKey);
    new WebrtcProvider(roomKey, ydoc);
    fileMap = ydoc.getMap("file");
    fileMap.observe(syncFile);
  };

  // Leave the room
  const leaveRoom = () => {
    roomKey = null;
    roomReady = false;
    updateUrlRoomKey(roomKey);
    ydoc.destroy();
  };

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
</script>

<div class="p-4 rounded bg-float text-white flex flex-col">
  <h1 class="font-bold">Match</h1>

  {#if !roomReady}
    <Button label="Create a room" class="mt-4" on:click={createRoom} />
  {:else}
    <div class="flex mt-4">
      <Input value={url.href} readonly />
      <Button label="Copy" class="ml-4" />
    </div>
    <Button label="Leave room" class="mt-4" danger on:click={leaveRoom} />
  {/if}
  <Button
    label="Log map"
    class="mt-4"
    on:click={() => console.log(fileMap.toJSON())}
  />
</div>
