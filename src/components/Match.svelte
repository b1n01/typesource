<script>
  import { fly } from "svelte/transition";
  import { isEqual } from "lodash";
  import Input from "./Input.svelte";
  import Button from "./Button.svelte";
  import { WebrtcProvider } from "y-webrtc";
  import { state } from "../states";
  import { ydoc } from "../ystore";
  import {
    position,
    players,
    userReady,
    matchStarted,
    fileMap,
  } from "../stores";

  const url = new URL(window.location.href);
  let roomUrlCopied = false; // to show a confirmation for url copied to cliopbopard
  let roomReady = false; // wheter the room is ready tro trigger update shared ydoc
  let roomKey; // the room key

  let awareness; // keeps all connected players states
  let matchStartsAt = ydoc.getMap("matchStart");
  let countdown = null;

  // TODO remove this
  let userId;

  // Check id the mathc should start and the timer shiuld be shownd
  const handleMatchStart = (e) => {
    if (matchStartsAt.has("time")) {
      countdown = Math.ceil((matchStartsAt.get("time") - Date.now()) / 1000);

      const setCountdown = () => {
        countdown -= 1;
        if (countdown > 0) {
          setTimeout(setCountdown, 1000);
        }
      };

      setTimeout(setCountdown, 1000);

      setTimeout(() => {
        console.log("Match started, are we synced?");
        state.send("START");
        $matchStarted = true;
      }, countdown * 1000);
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
      const clientId = awareness.clientID;

      // Update players cursor
      let states = [];
      [...awareness.getStates().values()].forEach((state) => {
        if (state.uid != userId) states.push(state);
      });
      $players = states;

      // Set local position as last updated 'shared position'
      if (!$matchStarted) {
        let clients = [...changes.updated].filter((id) => id != clientId); // remove myself
        if (clients.length) {
          const updatedClientId = Math.max(clients); // If more than one client has changed keep the one with bigger id
          const updatedState = awareness.getStates().get(updatedClientId);
          if (!isEqual($position, updatedState.position)) {
            $position = updatedState.position;
          }
        }
      }

      // Check if all users are set as 'ready'
      let allUsersReady = [...awareness.getStates().values()].reduce(
        (allReady, state) => allReady && state.ready,
        true
      );
      if (allUsersReady && !matchStartsAt.get("time")) {
        matchStartsAt.set("time", Date.now() + 5000);
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

    matchStartsAt.observe(handleMatchStart);
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

  $: if (roomReady && !isEqual($position, awareness.getLocalState().position)) {
    awareness.setLocalStateField("position", $position);
  }

  // Set user ready on the awareness object
  $: if (roomReady && $userReady) {
    awareness.setLocalStateField("ready", $userReady);
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
    <div class="mt-4">
      {#if !$userReady && $fileMap.get("content")}
        <Button label="I'm Ready" on:click={() => ($userReady = true)} />
      {:else}
        <Button label="I'm Ready" disabled />
      {/if}

      <span>Match countdown: {countdown}</span>
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
