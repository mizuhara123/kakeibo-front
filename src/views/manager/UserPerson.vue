<template>
  <div>
    <el-card style="width: 50%">
      <el-form :model="user" label-width="100px" style="padding-right: 50px">
        <div style="margin: 15px; text-align: center">
          <el-upload
              class="avatar-uploader"
              :action="$baseUrl + '/files/upload'"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
          >
            <img v-if="user.avatar" :src="user.avatar" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </div>

        <el-form-item label="ユーザー" prop="username">
          <el-input v-model="user.username" placeholder="ユーザー" disabled></el-input>
        </el-form-item>

        <el-form-item label="氏名" prop="name">
          <el-input v-model="user.name" placeholder="氏名を入力してください"></el-input>
        </el-form-item>

        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="user.phone" placeholder="電話番号を入力してください"></el-input>
        </el-form-item>

        <el-form-item label="メール" prop="email">
          <el-input v-model="user.email" placeholder="メールアドレスを入力してください"></el-input>
        </el-form-item>

        <el-form-item label="性別" prop="sex">
          <el-radio-group v-model="user.sex">
            <el-radio label="男">男性</el-radio>
            <el-radio label="女">女性</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生年月日" prop="birth">
          <el-date-picker
              placeholder="生年月日を選択してください"
              style="width: 100%"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              v-model="user.birth"
          ></el-date-picker>
        </el-form-item>

        <div style="text-align: center; margin-bottom: 20px">
          <el-button type="primary" @click="update">保 存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AdminPerson",
  data() {
    return {
      user: JSON.parse(localStorage.getItem('xm-user') || '{}')
    }
 },
  methods: {
   update() {
      this.$request.put('/user/update', this.user).then(res => {
        if (res.code === '200') {
          this.$message.success('保存しました')  
         localStorage.setItem('xm-user', JSON.stringify(this.user))
          this.$emit('update:user')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    handleAvatarSuccess(response) {
      this.$set(this.user, 'avatar', response.data)
    },
  }
}
</script>

<style scoped>
/deep/.el-form-item__label {
  font-weight: bold;
  white-space: nowrap;
}
/deep/.el-upload {
  border-radius: 50%;
}
/deep/.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
  border-radius: 50%;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 50%;
}
</style>
