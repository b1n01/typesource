<script>
    const stubContent = `// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

// This code has been ported almost directly from Go's src/bytes/buffer.go
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE
"use strict";

((window) => {
  const { assert } = window.__bootstrap.util;

  // MIN_READ is the minimum ArrayBuffer size passed to a read call by
  // buffer.ReadFrom. As long as the Buffer has at least MIN_READ bytes beyond
  // what is required to hold the contents of r, readFrom() will not grow the
  // underlying buffer.
  const MIN_READ = 32 * 1024;
  const MAX_SIZE = 2 ** 32 - 2;

  // off is the offset into dst where it will at which to begin writing values
  // from src.
  // Returns the number of bytes copied.
  function copyBytes(src, dst, off = 0) {
    const r = dst.byteLength - off;
    if (src.byteLength > r) {
      src = src.subarray(0, r);
    }
    dst.set(src, off);
    return src.byteLength;
  }

  class Buffer {
    #buf = null; // contents are the bytes buf[off : len(buf)]
    #off = 0; // read at buf[off], write at buf[buf.byteLength]

    constructor(ab) {
      if (ab == null) {
        this.#buf = new Uint8Array(0);
        return;
      }

      this.#buf = new Uint8Array(ab);
    }

    bytes(options = { copy: true }) {
      if (options.copy === false) return this.#buf.subarray(this.#off);
      return this.#buf.slice(this.#off);
    }

    empty() {
      return this.#buf.byteLength <= this.#off;
    }

    get length() {
      return this.#buf.byteLength - this.#off;
    }

    get capacity() {
      return this.#buf.buffer.byteLength;
    }

    truncate(n) {
      if (n === 0) {
        this.reset();
        return;
      }
      if (n < 0 || n > this.length) {
        throw Error("bytes.Buffer: truncation out of range");
      }
      this.#reslice(this.#off + n);
    }

    reset() {
      this.#reslice(0);
      this.#off = 0;
    }

    #tryGrowByReslice = (n) => {
      const l = this.#buf.byteLength;
      if (n <= this.capacity - l) {
        this.#reslice(l + n);
        return l;
      }
      return -1;
    };

    #reslice = (len) => {
      assert(len <= this.#buf.buffer.byteLength);
      this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    };

    readSync(p) {
      if (this.empty()) {
        // Buffer is empty, reset to recover space.
        this.reset();
        if (p.byteLength === 0) {
          // this edge case is tested in 'bufferReadEmptyAtEOF' test
          return 0;
        }
        return null;
      }
      const nread = copyBytes(this.#buf.subarray(this.#off), p);
      this.#off += nread;
      return nread;
    }

    read(p) {
      const rr = this.readSync(p);
      return Promise.resolve(rr);
    }

    writeSync(p) {
      const m = this.#grow(p.byteLength);
      return copyBytes(p, this.#buf, m);
    }

    write(p) {
      const n = this.writeSync(p);
      return Promise.resolve(n);
    }

    #grow = (n) => {
      const m = this.length;
      // If buffer is empty, reset to recover space.
      if (m === 0 && this.#off !== 0) {
        this.reset();
      }
      // Fast: Try to grow by means of a reslice.
      const i = this.#tryGrowByReslice(n);
      if (i >= 0) {
        return i;
      }
      const c = this.capacity;
      if (n <= Math.floor(c / 2) - m) {
        // We can slide things down instead of allocating a new
        // ArrayBuffer. We only need m+n <= c to slide, but
        // we instead let capacity get twice as large so we
        // don't spend all our time copying.
        copyBytes(this.#buf.subarray(this.#off), this.#buf);
      } else if (c + n > MAX_SIZE) {
        throw new Error("The buffer cannot be grown beyond the maximum size.");
      } else {
        // Not enough space anywhere, we need to allocate.
        const buf = new Uint8Array(Math.min(2 * c + n, MAX_SIZE));
        copyBytes(this.#buf.subarray(this.#off), buf);
        this.#buf = buf;
      }
      // Restore this.#off and len(this.#buf).
      this.#off = 0;
      this.#reslice(Math.min(m + n, MAX_SIZE));
      return m;
    };

    grow(n) {
      if (n < 0) {
        throw Error("Buffer.grow: negative count");
      }
      const m = this.#grow(n);
      this.#reslice(m);
    }

    async readFrom(r) {
      let n = 0;
      const tmp = new Uint8Array(MIN_READ);
      while (true) {
        const shouldGrow = this.capacity - this.length < MIN_READ;
        // read into tmp buffer if there's not enough room
        // otherwise read directly into the internal buffer
        const buf = shouldGrow
          ? tmp
          : new Uint8Array(this.#buf.buffer, this.length);

        const nread = await r.read(buf);
        if (nread === null) {
          return n;
        }

        // write will grow if needed
        if (shouldGrow) this.writeSync(buf.subarray(0, nread));
        else this.#reslice(this.length + nread);

        n += nread;
      }
    }

    readFromSync(r) {
      let n = 0;
      const tmp = new Uint8Array(MIN_READ);
      while (true) {
        const shouldGrow = this.capacity - this.length < MIN_READ;
        // read into tmp buffer if there's not enough room
        // otherwise read directly into the internal buffer
        const buf = shouldGrow
          ? tmp
          : new Uint8Array(this.#buf.buffer, this.length);

        const nread = r.readSync(buf);
        if (nread === null) {
          return n;
        }

        // write will grow if needed
        if (shouldGrow) this.writeSync(buf.subarray(0, nread));
        else this.#reslice(this.length + nread);

        n += nread;
      }
    }
  }

  async function readAll(r) {
    const buf = new Buffer();
    await buf.readFrom(r);
    return buf.bytes();
  }

  function readAllSync(r) {
    const buf = new Buffer();
    buf.readFromSync(r);
    return buf.bytes();
  }

  async function writeAll(w, arr) {
    let nwritten = 0;
    while (nwritten < arr.length) {
      nwritten += await w.write(arr.subarray(nwritten));
    }
  }

  function writeAllSync(w, arr) {
    let nwritten = 0;
    while (nwritten < arr.length) {
      nwritten += w.writeSync(arr.subarray(nwritten));
    }
  }

  window.__bootstrap.buffer = {
    writeAll,
    writeAllSync,
    readAll,
    readAllSync,
    Buffer,
  };
})(this);
`
    import { fileContent, selectedFile } from '../stores.js'
    import Loader from './Loader.svelte'

    const searchRepoEndpoint = 'https://api.github.com/search/repositories?q='
    let search = '' // content of the search input
    let repos = [] // list of repos 
    let files = [] // list of files/folders in the selected repo
    let repoBasePath = '' // base path of the selected repo
    let repoCurrentPath = '' // path of the repos's selected folder
    let selectedRepo = null // the selected repo
    let loading = false

    // $: console.log(fileContent)
    // $: console.log(repoBasePath)
    // $: console.log(repoCurrentPath)

    const handleSearch = () => {
        // Reset selected repo and file list
        files = []
        selectedRepo = null
        loading = true

		fetch(searchRepoEndpoint + search)
            .then(res => res.json())
            .then(data => {repos = data.items; loading = false})
            .catch(e => console.error(e))
	}

    const selectRepo = (repo) => {
        selectedRepo = repo
		repoBasePath = repo.contents_url.replace('/{+path}', '')
		repoCurrentPath = repoBasePath
        loading = true

        fetch(repoBasePath)
            .then(res => res.json())
            .then(data => {files = data; loading = false})
            .catch(e => console.error(e))
    }

    const goToParentFolder = async() => {
        loading = true
        repoCurrentPath = repoCurrentPath.substring(0, repoCurrentPath.lastIndexOf("/"))
        fetch(repoCurrentPath)
            .then(res => res.json())
            .then(data => { files = data; loading = false})
            .catch(e => console.error(e))
    }

    const changeFolder = (folder) => {
        loading = true
        repoCurrentPath = repoBasePath + '/' + folder.path
        fetch(repoCurrentPath)
            .then(res => res.json())
            .then(data => { files = data; loading = false})
            .catch(e => console.error(e))
    }

    const selectFile = (file) => {
        selectedFile.set(file)
        fetch(file.download_url)
            .then(res => res.text())
            .then(data => fileContent.set(data))
            .catch(e => console.error(e))
    }

    const goToFolder = (path) => {
        loading = true
        repoCurrentPath = path
        fetch(path)
            .then(res => res.json())
            .then(data => { files = data; loading = false})
            .catch(e => console.error(e))
    }

    const confirmFile = () => {
        console.log('You have choosen a file', $selectedFile)
    }

    // Remove this
    const loadFile = () => {
        fileContent.set(stubContent)
    }
</script>

<main class="p-4 rounded bg-float text-white flex flex-col">
    <h1 class="font-bold">Search file on github repositories</h1>

    <div class="flex bg-highlight border border-border rounded mt-4">
        <img src="images/search.svg" alt="Search icon" class="ml-2">
        <input bind:value={search} on:input={handleSearch} type="text" placeholder="Search repositories" class="p-2 bg-transparent outline-none w-full">
    </div>

    {#if loading }
        <Loader />
    {/if}

    {#if !loading && selectedRepo }
        <div class="font-bold mt-4 ml-2">
            <span class="cursor-pointer hover:underline" on:click={() => goToFolder(repoBasePath)}>{selectedRepo.name} </span>
            {#each repoCurrentPath.replace(repoBasePath, '').split('/') as token, index}
                <span class="cursor-pointer hover:underline" on:click={() => {
                    // build the new path from the selected breadcrumb token
                    let path = repoBasePath + repoCurrentPath.replace(repoBasePath, '').split('/').slice(0, index + 1).join('/')
                    goToFolder(path)
                }}>{token} </span><span> / </span> 
            {/each}
         </div>
        <hr class="border-highlight mt-4">
    {/if}

    {#if !loading && repos.length && !selectedRepo }
        <ul class="mt-4 max-h-64 overflow-y-auto">
            {#each repos as repo}
                <li>
                    <div on:click={() => selectRepo(repo)} class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                        {repo.full_name}
                    </div>
                <li>
            {/each}
        </ul>
    {/if}

    {#if !loading && files.length }
        <ul class="mt-4 max-h-64 overflow-y-auto">
            {#if files.length && repoCurrentPath !== repoBasePath }
                <li on:click={goToParentFolder}>
                    <div class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                        <span class="pl-4">☝ back to parent folder</span>
                    </div>
                </li>
            {/if }
            {#each files as file}
                {#if file.type == 'file' }
                    <li on:click={() => selectFile(file)}>
                        <div class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                            <img src="images/file.svg" alt="File icon">
                            <span class="pl-4">{file.name}</span>
                        </div>
                    </li>
                {:else}
                    <li on:click={() => changeFolder(file)}>
                        <div class="flex p-2 hover:bg-highlight rounded cursor-pointer">
                            <img src="images/folder.svg" alt="Folder icon">
                            <span class="pl-4">{file.name}</span>
                        </div>
                    </li>
                {/if}
            {/each}
        </ul>
    {/if}

    {#if !loading && files.length }
        <button on:click={confirmFile} class="bg-highlight border-border border py-2 px-4 rounded focus:outline-none hover:bg-border self-end mt-4">Select File</button>
    {/if}

    <!-- Remove this -->
    <button on:click={loadFile} class="bg-highlight border-border border py-2 px-4 rounded focus:outline-none hover:bg-border self-end mt-4">Load Stub File</button>

</main>