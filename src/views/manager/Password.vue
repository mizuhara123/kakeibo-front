<template>
  <div>
    <el-card style="width: 50%">
      <el-form ref="formRef" :model="user" :rules="rules" label-width="160px" style="padding-right: 50px">
        <el-form-item label="現在のパスワード" prop="password">
          <el-input show-password v-model="user.password" placeholder="現在のパスワードを入力してください"></el-input>
        </el-form-item>
        <el-form-item label="新しいパスワード" prop="newPassword">
          <el-input show-password v-model="user.newPassword" placeholder="新しいパスワードを入力してください"></el-input>
        </el-form-item>
        <el-form-item label="新しいパスワード（確認）" prop="confirmPassword">
          <el-input show-password v-model="user.confirmPassword" placeholder="もう一度入力してください"></el-input>
        </el-form-item>
        <div style="text-align: center; margin-bottom: 20px">
          <el-button type="primary" @click="update">変更を確定</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Password",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('確認用のパスワードを入力してください'))
      } else if (value !== this.user.newPassword) {
        callback(new Error('新しいパスワードが一致しません'))
      } else {
        callback()
      }
    }

    return {
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        password: [
          { required: true, message: '現在のパスワードを入力してください', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '新しいパスワードを入力してください', trigger: 'blur' },
        ],
        confirmPassword: [
          { validator: validatePassword, required: true, trigger: 'blur' },
        ],
      }
    }
  },
  methods: {
    update() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request.put('/updatePassword', this.user).then(res => {
            if (res.code === '200') {
              // 成功時処理
              localStorage.removeItem('xm-user')   // ローカルのユーザー情報を削除
              this.$message.success('パスワードを変更しました。再ログインしてください。')
              this.$router.push('/login')
            } else {
              this.$message.error(res.msg || '変更に失敗しました')
            }
          })
        }
      })
    },
  }
}
</script>

<style scoped>
/deep/.el-form-item__label {
  font-weight: bold;
}
</style>

