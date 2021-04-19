<script>
  import { fly } from "svelte/transition";
  import { isEqual } from "lodash";
  import Input from "./Input.svelte";
  import Button from "./Button.svelte";
  import * as Y from "yjs";
  import { WebrtcProvider } from "y-webrtc";
  import {
    fileContent,
    fileUrl,
    position,
    players,
    userReady,
  } from "../stores";

  const url = new URL(window.location.href);
  let roomUrlCopied = false; // to show a confirmation for url copied to cliopbopard
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
      // Update players cursor
      let states = [];
      [...awareness.getStates().values()].forEach((state) => {
        if (state.uid != userId) states.push(state);
      });
      $players = states;

      // Set local position as last updated 'shared position'
      const clientId = awareness.clientID;
      let clients = [...changes.updated].filter((id) => id != clientId); // remove myself
      if (clients.length) {
        const updatedClientId = Math.max(clients); // If more than one client has changed keep the one with bigger id
        const updatedState = awareness.getStates().get(updatedClientId);
        if (!isEqual($position, updatedState.position)) {
          $position = updatedState.position;
        }
      }
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
    userReady.set(false);
    updateUrlRoomKey();
    awareness.destroy();
    ydoc.destroy();
  };

  // GEt the url of the current room
  const getRoomUrl = () => url.origin + `?r=${roomKey}`;

  // Copy a value to the clipboard
  const copyRoomUrl = () => {
    let roomUrl = getRoomUrl();
    navigator.clipboard.writeText(roomUrl).then(() => {
      roomUrlCopied = true;
      setTimeout(() => (roomUrlCopied = false), 1500);
    });
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

  $: if (roomReady && !isEqual($position, awareness.getLocalState().position)) {
    awareness.setLocalStateField("position", $position);
  }
</script>

<div class="p-4 rounded bg-float text-white flex flex-col">
  <h1 class="font-bold">Room</h1>

  {#if !roomReady}
    <Button label="Create a room" class="mt-4" on:click={createRoom} />
  {:else}
    <div class="flex mt-4">
      <Input value={getRoomUrl()} readonly>
        <span
          slot="post-icon"
          class="w-12 mr-2 cursor-pointer flex flex-col text-center justify-center"
        >
          {#if !roomUrlCopied}
            <span on:click={copyRoomUrl}>📋</span>
          {:else}
            <span in:fly={{ y: 5 }} class="text-xs">
              <span>️📋</span>
              <span class="opacity-70">Copied</span>
            </span>
          {/if}
        </span>
      </Input>
      <Button label="Leave" class="ml-4" danger on:click={leaveRoom} />
    </div>

    <div class="flex items-center mt-4">
      <h1 class="font-bold">Math</h1>
      <div
        class="ml-2 rounded-full w-3 h-3 {$userReady
          ? 'bg-green-500 animate-pulse'
          : 'bg-red-700'}"
      />
    </div>
    <div class="mt-4 flex justify-between">
      {#if !$userReady && $fileContent}
        <Button label="I'm Ready" on:click={() => ($userReady = true)} />
      {:else}
        <Button label="I'm Ready" disabled />
      {/if}
    </div>

    {#if $players.length}
      <h1 class="font-bold mt-4">Live Players</h1>
      <div class="flex flex-wrap pt-4 -mb-2">
        {#each $players as player}
          <div
            title="{player.uid}: [{player.position.lineNumber}:{player.position
              .column}]"
            class="bg-gray-100 border-4 border-purple-500 rounded-full w-8 h-8 mr-2 mb-2 opacity-70 cursor-pointer hover:opacity-100"
          />
        {/each}
      </div>
    {/if}
  {/if}
</div>
