<template>
  <router-view/>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

button {
  box-sizing: border-box;

  padding: 0.5rem;
  border-radius: 0.1rem;
  border: 1px solid black;
  background: none;

  &:hover, &:focus {
    cursor: pointer;
    background: hsla(0, 0%, 0%, 0.1);
  }
}
</style>
