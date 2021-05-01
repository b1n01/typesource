<script>
  import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
  import { collection, addDoc } from "firebase/firestore";
  import { auth, db } from "../firebase";

  const provider = new GithubAuthProvider();

  const signin = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        console.log("User access token", token);

        const user = result.user;
        console.log("User", user);

        try {
          const docRef = await addDoc(collection(db, "users"), {
            accessToken: token,
          });
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GithubAuthProvider.credentialFromError(error);
        // ...
      });
  };
</script>

<nav class="bg-float text-white font-bold min-w-lg">
  <div class="mx-auto px-8 h-16 flex max-w-screen-2xl">
    <img width="22px" src="images/logo.svg" alt="Typesource logo" />
    <h1 class="text-2xl p-4">Typesource</h1>
    <ul class="ml-auto self-center flex">
      <li class="cursor-pointer" on:click={signin}>Signin</li>
      <li class="pl-2 cursor-pointer">Info</li>
    </ul>
  </div>
</nav>
