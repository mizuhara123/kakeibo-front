<template>
  <div>
    <div style="height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center">
      <div style="font-size: 40px">
        404 ページが見つかりません
        <router-link to="/">ホームに戻る</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "404",
  data() {
    return {}
  },
  methods: {}
}
</script>

<style scoped>
</style>
