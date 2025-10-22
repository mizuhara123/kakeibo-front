<template>
  <div class="manager-container">
    <!-- ヘッダー -->
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="@/assets/imgs/logo.png" />
        <div class="title">家計簿システム</div>
      </div>

      <div class="manager-header-center">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">ホーム</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: $route.path }">{{ $route.meta.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="manager-header-right">
        <el-dropdown placement="bottom">
          <div class="avatar">
            <img :src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
            <div>{{ user.name || '管理者' }}</div>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="goToPerson">個人情報</el-dropdown-item>
            <el-dropdown-item @click.native="$router.push('/password')">パスワード変更</el-dropdown-item>
            <el-dropdown-item @click.native="logout">ログアウト</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- メイン -->
    <div class="manager-main">
      <!-- サイドメニュー -->
      <div class="manager-main-left">
        <el-menu :default-openeds="['info', 'user']" router style="border: none" :default-active="$route.path">
          <el-menu-item index="/home">
            <i class="el-icon-s-home"></i>
            <span slot="title">ホーム</span>
          </el-menu-item>

          <el-submenu index="info">
            <template slot="title">
              <i class="el-icon-menu"></i><span>情報管理</span>
            </template>
            <el-menu-item index="/bill">帳簿管理</el-menu-item>
            <el-menu-item index="/notebook">日記</el-menu-item>
            <el-menu-item index="/plan">貯金計画</el-menu-item>
            <el-menu-item index="/ac" v-if="user.role === 'ADMIN'">アカウント情報</el-menu-item>
            <el-menu-item index="/category" v-if="user.role === 'ADMIN'">カテゴリ管理</el-menu-item>
            <el-menu-item index="/notice" v-if="user.role === 'ADMIN'">お知らせ管理</el-menu-item>
          </el-submenu>

          <el-submenu index="user" v-if="user.role === 'ADMIN'">
            <template slot="title">
              <i class="el-icon-menu"></i><span>ユーザー管理</span>
            </template>
            <el-menu-item index="/admin">管理者情報</el-menu-item>
            <el-menu-item index="/user">ユーザー情報</el-menu-item>
          </el-submenu>
        </el-menu>
      </div>

      <!-- データ表示 -->
      <div class="manager-main-right">
        <router-view @update:user="updateUser" />
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "Manager",
  data() {
    return {
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
    }
  },
  created() {
    if (!this.user.id) {
      this.$router.push('/login')
    }
  },
  methods: {
    updateUser() {
      this.user = JSON.parse(localStorage.getItem('xm-user') || '{}')
    },
    goToPerson() {
      if (this.user.role === 'ADMIN') {
        this.$router.push('/adminPerson')
      } else if (this.user.role === 'USER') {
        this.$router.push('/userPerson')
      }
    },
    logout() {
      localStorage.removeItem('xm-user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>
