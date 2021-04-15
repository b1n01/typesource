<script>
  import Input from "./Input.svelte";
  import Button from "./Button.svelte";
  import * as Y from "yjs";
  import { WebrtcProvider } from "y-webrtc";
  import { fileContent, fileUrl } from "../stores";

  const url = new URL(window.location.href);
  let inRoom = false; // wheter the user is in a room
  let roomKey; // the room  key
  let ydoc = new Y.Doc();
  let map = ydoc.getMap("file"); // store the url of the selected file

  // Sync file url and content
  const syncFile = (e) => {
    if (e.transaction.local) {
      // console.log("The event is triggeder locally, do nothing");
      return;
    }

    inRoom = true;

    // e.changes.keys.forEach((change, key) => {
    //   if (change.action === "add") {
    //     console.log(
    //       `Property "${key}" was added. Initial value: "${map
    //         .get(key)
    //         .substr(0, 8)}".`
    //     );
    //   } else if (change.action === "update") {
    //     console.log(
    //       `Property "${key}" was updated. New value: "${map
    //         .get(key)
    //         .substr(0, 8)}". Previous value: "${change.oldValue.substr(0, 8)}".`
    //     );
    //   } else if (change.action === "delete") {
    //     console.log(
    //       `Property "${key}" was deleted. New value: undefined. Previous value: "${change.oldValue.substr(
    //         0,
    //         8
    //       )}".`
    //     );
    //   }
    // });

    // console.log("SyncFile", e);
    if (e.keysChanged.has("content")) {
      // console.log(
      //   "Sync fine content changed",
      //   "$fileContent: " + $fileContent.substr(0, 8),
      //   ", Map content: " + map.get("content")?.substr(0, 8)
      // );
      fileContent.set(map.get("content"));
    }
    if (e.keysChanged.has("url")) {
      // console.log(
      //   "SyncFile url changed",
      //   "$fileUrl: " + $fileUrl,
      //   ", Map url: " + map.get("url")
      // );
      fileUrl.set(map.get("url"));
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

  // Enter the room
  const enterRoom = (roomKey) => {
    new WebrtcProvider(roomKey, ydoc);
    map.observe((e) => syncFile(e));
    updateUrlRoomKey(roomKey);
  };

  // Leave the room
  const leaveRoom = () => {
    roomKey = generateRoomKey();
    inRoom = false;
    updateUrlRoomKey();
    ydoc.destroy();
    ydoc = new Y.Doc();
    map = ydoc.getMap("file");
    map.set("url", "");
    map.set("content", "");
  };

  // Get or create a roomKey
  if (url.searchParams.has("r")) {
    roomKey = url.searchParams.get("r");
    enterRoom(roomKey);
  } else {
    map.set("url", "");
    map.set("content", "");
    roomKey = generateRoomKey();
  }

  $: if (inRoom && $fileContent !== map.get("content")) {
    // console.log(
    //   "Setting map content",
    //   "$fileContent: " + $fileContent.substr(0, 8),
    //   ", Map content: " + map.get("content")?.substr(0, 8)
    // );
    map.set("content", $fileContent);
  }

  $: if (inRoom && $fileUrl !== map.get("url")) {
    // console.log(
    //   "Setting map url",
    //   "$fileUrl: " + $fileUrl,
    //   ", Map url: " + map.get("url")
    // );
    map.set("url", $fileUrl);
  }
</script>

<div class="p-4 rounded bg-float text-white flex flex-col">
  <h1 class="font-bold">Match</h1>

  {#if !inRoom}
    <Button
      label="Create a room"
      class="mt-4"
      onClick={() => {
        inRoom = true;
        enterRoom(roomKey);
      }}
    />
  {:else}
    <div class="flex mt-4">
      <Input value={url.href} readonly />
      <Button label="Copy" class="ml-4" />
    </div>
    <Button label="Leave room" class="mt-4" onClick={leaveRoom} />
  {/if}
  <Button
    label="Log map"
    class="mt-4"
    onClick={() => console.log(map.toJSON())}
  />
</div>
