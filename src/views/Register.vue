<template>
  <div class="container">
    <div style="width: 350px; padding: 30px; background-color: rgba(255, 255, 255, .9); border-radius: 5px;">
      <div style="text-align: center; font-size: 24px; margin-bottom: 40px; color: #000">新規登録</div>
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" placeholder="アカウント名を入力してください" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" placeholder="パスワードを入力してください" show-password v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPass">
          <el-input prefix-icon="el-icon-lock" placeholder="パスワードを確認してください" show-password v-model="form.confirmPass"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button style="width: 100%; background-color: #009788; border-color: #009788; color: white" @click="register">登 録</el-button>
        </el-form-item>
        <div style="display: flex; align-items: center">
          <div style="flex: 1"></div>
          <div style="flex: 1; text-align: right">
            すでにアカウントをお持ちの方は <a href="/login">ログイン</a> 
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    // パスワード確認バリデーション
    const validatePassword = (rule, confirmPass, callback) => {
      if (confirmPass === '') {
        callback(new Error('確認用パスワードを入力してください'))
      } else if (confirmPass !== this.form.password) {
        callback(new Error('2回入力したパスワードが一致しません'))
      } else {
        callback()
      }
    }
    return {
      form: { role: 'USER' },
      rules: {
        username: [
          { required: true, message: 'アカウント名を入力してください', trigger: 'blur' },
        ],
        password: [
          { required: true, message: 'パスワードを入力してください', trigger: 'blur' },
        ],
        confirmPass: [
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    register() {
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          // 検証成功
          this.$request.post('/register', this.form).then(res => {
            if (res.code === '200') {
              this.$router.push('/login')  // ログインページへ遷移
              this.$message.success('登録が完了しました')
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  overflow: hidden;
  background-image: url("@/assets/imgs/bg1.jpg");
  background-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}
a {
  color: #2a60c9;
}
</style>
