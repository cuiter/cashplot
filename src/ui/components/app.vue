<template>
  <div class="app full-size">
    <page-component ref="page" />
    <nav-component ref="nav" />
  </div>
</template>

<script lang="ts">
export default {
  provide: {
    currentView: "home",
    openView: function(view: string) {
      (this as any).currentView = view;
      (this as any).$refs.page.forceUpdate();
    }
  }
}
</script>