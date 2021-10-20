<script>
  import { fly } from "svelte/transition";
  import { isEqual } from "lodash";
  import Input from "./common/Input";
  import Button from "./common/Button";
  import Box from "./common/Box";
  import { WebrtcProvider } from "y-webrtc";
  import { userState } from "../states";
  import { ydoc } from "../ystores";
  import { position, players, fileUrl, user, resetKeystrokes } from "../stores";

  const url = new URL(window.location.href); // the url
  let showCopyLabel = false; // wheter to show a confirmation for copying to clipboard
  let roomKey = null; // the room key

  let awareness; // keeps all connected players states
  let matchStartsAt = ydoc.getMap("matchStart");
  let countdown; // how many seconds until the match starts

  // Check if the match should start and the timer should be showed
  const handleMatchStart = () => {
    if (matchStartsAt.has("time")) {
      countdown = Math.ceil((matchStartsAt.get("time") - Date.now()) / 1000);

      const setCountdown = () => {
        countdown -= 1;
        if (countdown > 0) {
          setTimeout(setCountdown, 1000);
        }
      };

      userState.send("COUNTDOWN");
      setTimeout(setCountdown, 1000);

      // Staring the match when the countdown is over
      setTimeout(() => {
        userState.send("GO");
      }, countdown * 1000);

      // Finish the match
      setTimeout(() => {
        userState.send("END");
      }, countdown * 1000 + 8 * 1000); // 10 seconds match
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
      uid: $user.uid,
      position: $position,
    });
  };

  // Listen for awareness changes and update local cursors positions
  const handleAwareness = () => {
    awareness.on("change", (changes) => {
      const clientId = awareness.clientID;

      // Update players cursor
      $players = [...awareness.getStates().values()].reduce(
        (states, state) =>
          state.uid != $user.uid ? [...states, state] : states,
        []
      );

      // Set local position as last updated 'shared position'
      if (
        ["online.lobby", "online.ready.waiting", "online.finished"].some(
          $userState.matches
        )
      ) {
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
      const onlyMe = [...awareness.getStates().values()].length == 1;
      if (allUsersReady && !onlyMe && !matchStartsAt.get("time")) {
        matchStartsAt.set("time", Date.now() + 5000);
      }
    });
  };

  // Create and join a room
  const createRoom = () => {
    roomKey = generateRoomKey();
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

    userState.send("ONLINE");
  };

  // Leave the room
  const leaveRoom = () => {
    roomKey = null;
    updateUrlRoomKey();
    awareness.destroy();
    userState.send("OFFLINE");
  };

  // Get the url of the current room
  const getRoomUrl = () => url.origin + `?r=${roomKey}`;

  // Copy a value to the clipboard
  const copyRoomUrl = () => {
    let roomUrl = getRoomUrl();
    navigator.clipboard.writeText(roomUrl).then(() => {
      showCopyLabel = true;
      setTimeout(() => (showCopyLabel = false), 1500);
    });
  };

  // Set the READY event
  const setUserAsReady = () => {
    userState.send("READY");
  };

  // Reset collected metrics and restart the match
  const restartMatch = () => {
    userState.send("RESTART");
    resetKeystrokes();
  };

  // Get wheter the user has won the last match
  const didUserWon = () => {
    const winnerPos = $players.reduce(
      (winnerPos, player) =>
        player.position.lineNumber > winnerPos.lineNumber &&
        player.position.column > winnerPos.column
          ? player.position
          : winnewPos,
      { lineNumber: 0, column: 0 }
    );

    return (
      $position.lineNumber >= winnerPos.lineNumber &&
      $position.column >= winnerPos.column
    );
  };

  // If the `r` param is set join the room
  if (url.searchParams.has("r")) {
    roomKey = url.searchParams.get("r");
    if ($user) {
      joinRoom(roomKey);
    }
  }

  // Join room if we have a room key, a logged user and we are offline
  $: if ($user && roomKey && $userState.matches("offline")) {
    joinRoom(roomKey);
  }

  // Update all pears with user new position
  $: if (
    awareness &&
    !isEqual($position, awareness.getLocalState()?.position)
  ) {
    awareness.setLocalStateField("position", $position);
  }

  // Set user ready on the awareness object
  $: if ($userState.matches("online.ready")) {
    awareness.setLocalStateField("ready", true);
  }

  // Set user as not ready when the match ends
  $: if ($userState.matches("online.finished")) {
    awareness.setLocalStateField("ready", false);
    matchStartsAt.delete("time");
    countdown = null;
  }

  // When the user is online and the file changes set as not ready
  // Isn't this not allwed in Explorer.svlete:72
  $: if ($fileUrl && awareness) {
    awareness.setLocalStateField("ready", false);
    userState.send("STOP");
  }
</script>

<Box class="flex flex-col">
  <h1 class="font-bold">Room</h1>

  {#if !$user || $user.isAnonymous}
    <p class="mt-1">Signin to create a room</p>
  {:else if !roomKey}
    <Button class="mt-4" on:click={createRoom}>Create a room</Button>
  {:else}
    <div class="flex mt-4">
      <Input value={getRoomUrl()} readonly>
        <span
          slot="post-icon"
          class="w-12 mr-2 cursor-pointer flex flex-col text-center justify-center"
        >
          {#if !showCopyLabel}
            <span on:click={copyRoomUrl}>📋</span>
          {:else}
            <span in:fly={{ y: 5 }} class="text-xs">
              <span>️📋</span>
              <span class="opacity-70">Copied</span>
            </span>
          {/if}
        </span>
      </Input>
      <Button class="ml-4" danger on:click={leaveRoom}>Leave</Button>
    </div>

    <div class="flex items-center mt-4">
      <h1 class="font-bold">Match</h1>
      <div
        class="ml-2 rounded-full w-3 h-3 {$userState.matches('online.ready')
          ? 'bg-green-500 animate-pulse'
          : 'bg-red-700'}"
      />
    </div>
    <div class="mt-4">
      {#if $fileUrl && $userState.matches("online.lobby")}
        <Button on:click={setUserAsReady}>I'm Ready</Button>
      {:else if $userState.matches("online.finished")}
        <Button on:click={restartMatch}>Restart</Button>
      {:else}
        <Button disabled>I'm Ready</Button>
      {/if}

      <span class="ml-4">
        {#if $userState.matches("online.ready.countdown")}
          Match starting in {countdown}
        {:else if $userState.matches("online.ready.waiting")}
          Wait for other players
        {:else if $userState.matches("online.playing")}
          GO!
        {:else if $userState.matches("online.finished")}
          The match is over, {didUserWon() ? "you won!" : "you lost"}
        {:else if $userState.matches("online.lobby")}
          Prepare yourself
        {/if}
      </span>
    </div>

    {#if $players.length}
      <h1 class="font-bold mt-4">Live Players</h1>
      <div class="flex flex-wrap pt-4 -mb-2">
        {#each $players as player, i}
          <div
            title="{player.uid} is {player.ready ? 'ready' : 'not ready'}"
            class="bg-gray-100 border-4 rounded-full w-8 h-8 mr-2 mb-2 cursor-pointer
            {player.ready ? 'opacity-100' : 'opacity-30'} cursor-{(i % 3) + 1}"
          />
        {/each}
      </div>
    {/if}
  {/if}
</Box>
