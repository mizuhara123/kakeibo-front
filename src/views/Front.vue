<template>
  <div>
    <div class="front-notice">
      <i class="el-icon-bell" style="margin-right: 2px"></i>
      お知らせ：{{ top }}
    </div>

    <!-- ヘッダー -->
    <div class="front-header">
      <div class="front-header-left">
        <img src="@/assets/imgs/logo.png" alt="">
        <div class="title">フロントページ</div>
      </div>

      <div class="front-header-center">
        <div class="front-header-nav">
          <el-menu :default-active="$route.path" mode="horizontal" router>
            <el-menu-item index="/front/home">ホーム</el-menu-item>
            <el-menu-item index="/front/person">マイページ</el-menu-item>
          </el-menu>
        </div>
      </div>

      <div class="front-header-right">
        <!-- 未ログイン時 -->
        <div v-if="!user.username">
          <el-button @click="$router.push('/login')">ログイン</el-button>
          <el-button @click="$router.push('/register')">新規登録</el-button>
        </div>

        <!-- ログイン後 -->
        <div v-else>
          <el-dropdown>
            <div class="front-header-dropdown">
              <img :src="user.avatar" alt="">
              <div style="margin-left: 10px">
                <span>{{ user.name }}</span>
                <i class="el-icon-arrow-down" style="margin-left: 5px"></i>
              </div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div style="text-decoration: none" @click="logout">ログアウト</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-body">
      <router-view ref="child" @update:user="updateUser" />
    </div>
  </div>
</template>

<script>
export default {
  name: "FrontLayout",
  data () {
    return {
      top: '',
      notice: [],
      user: JSON.parse(localStorage.getItem("xm-user") || '{}'),
    }
  },
  mounted() {
    this.loadNotice()
  },
  methods: {
    // お知らせデータを取得
    loadNotice() {
      this.$request.get('/notice/selectAll').then(res => {
        this.notice = res.data
        let i = 0
        if (this.notice && this.notice.length) {
          this.top = this.notice[0].content
          setInterval(() => {
            this.top = this.notice[i].content
            i++
            if (i === this.notice.length) {
              i = 0
            }
          }, 2500)
        }
      })
    },
    updateUser() {
      this.user = JSON.parse(localStorage.getItem('xm-user') || '{}')
    },
    // ログアウト
    logout() {
      localStorage.removeItem("xm-user");
      this.$router.push("/login");
    },
  }
}
</script>

<style scoped>
@import "@/assets/css/front.css";
</style>
