<script>
  import {
    user,
    search,
    repos,
    files,
    repoBaseUrl,
    repoCurrentUrl,
    selectedRepo,
    fileUrl,
    resetKeystrokes,
  } from "../stores";
  import { collection, query, where, getDocs } from "firebase/firestore";
  import { db } from "../firebase";
  import { userState } from "../states";
  import Loader from "./common/Loader";
  import Box from "./common/Box";
  import Input from "./common/Input";

  const searchRepoEndpoint = "https://api.github.com/search/repositories?q=";
  let loading = false; // whether the widget il loading something
  let accessToken = null; // github accessToken for the logged user

  const toggleLoader = () => (loading = !loading);
  const resetSearch = () => {
    $files = [];
    $repos = [];
    $selectedRepo = null;
  };

  // When the user is ready fetch its accessToken
  $: if ($user) {
    const usersColl = collection(db, "users");
    const select = query(usersColl, where("uid", "==", $user.uid));

    getDocs(select).then((users) => {
      accessToken = users.size ? users.docs[0].data().accessToken : null;
      if (users.docs.size > 1) {
        console.error("Found more than one user with the same uid");
      }
    });
  }

  // Decorate the request with the authorization header
  const req = (url) => {
    let options = {};
    if (process.env.NODE_ENV !== "development" && accessToken) {
      options = { headers: { Authorization: "token " + accessToken } };
    }

    return fetch(url, options);
  };

  // Search repositories
  const handleSearch = () => {
    resetSearch();
    if (!$search) return;

    toggleLoader();
    req(searchRepoEndpoint + $search)
      .then((res) => res.json())
      .then((data) => ($repos = data.items))
      .then(toggleLoader)
      .catch((e) => console.error(e));
  };

  // Select a repo
  const selectRepo = (repo) => {
    toggleLoader();
    $selectedRepo = repo;
    $repoBaseUrl = repo.contents_url.replace("/{+path}", ""); // replace `{+path}` placeholder
    $repoCurrentUrl = $repoBaseUrl;

    req($repoBaseUrl)
      .then((res) => res.json())
      .then((data) => ($files = data))
      .then(toggleLoader)
      .catch((e) => console.error(e));
  };

  // Change folder (it takes the path of the folder: `/` or `/folder/name`)
  const chageFolder = (path) => {
    toggleLoader();
    $repoCurrentUrl = ($repoBaseUrl + path).replace(/\/+$/, ""); // remove trailing slashes

    req($repoCurrentUrl)
      .then((res) => res.json())
      .then((data) => ($files = data))
      .then(toggleLoader)
      .catch((e) => console.error(e));
  };

  // Navigate to parent folder
  const goToParentFolder = () => {
    const path = getRepoPath();
    $repoCurrentUrl = path.substring(0, path.lastIndexOf("/"));
    chageFolder($repoCurrentUrl);
  };

  // Select a file
  const selectFile = (file) => {
    // Prevent the user for selecting a different file if is ready or playing
    if (["online.playing", "online.ready"].some($userState.matches)) {
      return;
    }

    $fileUrl = file.download_url;
    userState.send("STOP");
    resetKeystrokes();
  };

  // Get repo url path
  const getRepoPath = () => $repoCurrentUrl.replace($repoBaseUrl, "");

  // Debounce function (https://www.freecodecamp.org/news/javascript-debounce-example/)
  const debounce = (func, timeout = 350) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  };
</script>

<Box class="flex flex-col">
  <h1 class="font-bold">Search file on github repositories</h1>

  {#if $userState.matches("online.playing")}
    <Input
      placeholder="Seach repositories"
      class="mt-4"
      readonly
      value={$fileUrl.split("/").pop()}
    />
  {:else}
    <Input
      bind:value={$search}
      on:input={debounce(handleSearch)}
      placeholder="Seach repositories"
      class="mt-4"
    >
      <img
        slot="pre-icon"
        src="images/search.svg"
        alt="Search icon"
        class="ml-2 w-4"
      />
    </Input>

    {#if loading}
      <span class="h-32 flex justify-center items-center">
        <Loader />
      </span>
    {:else}
      {#if $selectedRepo}
        <!-- Breadcrumb -->
        <div class="font-bold mt-4 ml-2">
          <span
            class="cursor-pointer hover:underline"
            on:click={() => chageFolder("/")}
          >
            {$selectedRepo.name}
          </span>
          {#each getRepoPath().split("/") as token, index}
            <span
              class="cursor-pointer hover:underline"
              on:click={() => {
                // build the new path from the selected breadcrumb token
                const path = getRepoPath()
                  .split("/")
                  .slice(0, index + 1)
                  .join("/");
                chageFolder(path);
              }}
            >
              {token}
            </span>
            <span> / </span>
          {/each}
        </div>
        <hr class="border-highlight mt-4" />
      {/if}

      {#if $repos.length && !$selectedRepo}
        <!-- Repos list -->
        <ul class="mt-4 max-h-64 overflow-y-auto scroll">
          {#each $repos as repo}
            <li>
              <div
                on:click={() => selectRepo(repo)}
                class="flex p-2 hover:bg-highlight rounded cursor-pointer"
              >
                {repo.full_name}
              </div>
            </li>
            <li />{/each}
        </ul>
      {/if}

      {#if $files.length}
        <!-- File list -->
        <ul class="mt-4 max-h-64 overflow-y-auto scroll">
          {#if $repoCurrentUrl !== $repoBaseUrl}
            <li on:click={goToParentFolder}>
              <div class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                ☝
                <span class="pl-4">Back to parent folder</span>
              </div>
            </li>
          {/if}
          {#each $files as file}
            {#if file.type == "file"}
              <li on:click={() => selectFile(file)}>
                <div class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                  📄
                  <span class="pl-4">{file.name}</span>
                </div>
              </li>
            {:else}
              <li on:click={() => chageFolder("/" + file.path)}>
                <div class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                  📁
                  <span class="pl-4">{file.name}</span>
                </div>
              </li>
            {/if}
          {/each}
        </ul>
      {/if}
    {/if}
  {/if}
</Box>

<style>
  /* See https://digitalocean.com/community/tutorials/css-scrollbars */
  /* Works on Firefox */
  .scroll {
    scrollbar-width: auto;
    scrollbar-color: #1f2937 #283548;
  }

  /* Works on Chrome, Edge, and Safari */
  .scroll::-webkit-scrollbar {
    width: 6px;
  }

  .scroll::-webkit-scrollbar-track {
    background: #283548;
  }

  .scroll::-webkit-scrollbar-thumb {
    background-color: #1f2937;
    border-radius: 3px;
  }
</style>
