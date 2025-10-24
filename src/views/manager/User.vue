<template>
  <div>
    <!-- 🔍 検索部分 -->
    <div class="search">
      <el-input placeholder="アカウント名を入力して検索" style="width: 200px" v-model="username"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    <!-- 🧩 操作ボタン -->
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規作成</el-button>
      <el-button type="danger" plain @click="delBatch">一括削除</el-button>
    </div>

    <!-- 📋 テーブル -->
    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="番号" width="70" align="center" sortable></el-table-column>
        <el-table-column prop="username" label="アカウント"></el-table-column>
        <el-table-column prop="name" label="氏名"></el-table-column>
        <el-table-column prop="phone" label="電話番号"></el-table-column>
        <el-table-column prop="email" label="メールアドレス"></el-table-column>
        <el-table-column prop="sex" label="性別"></el-table-column>
        <el-table-column prop="birth" label="生年月日"></el-table-column>
        <el-table-column label="アバター">
          <template v-slot="scope">
            <div style="display: flex; align-items: center">
              <el-image
                style="width: 40px; height: 40px; border-radius: 50%"
                v-if="scope.row.avatar"
                :src="scope.row.avatar"
                :preview-src-list="[scope.row.avatar]"
              ></el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="権限"></el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">編集</el-button>
            <el-button size="mini" type="danger" plain @click="del(scope.row.id)">削除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 📑 ページネーション -->
      <div class="pagination">
        <el-pagination
          background
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[5, 10, 20]"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 💬 ダイアログ -->
    <el-dialog title="ユーザー情報" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="ユーザー名" prop="username">
          <el-input v-model="form.username" placeholder="ユーザー名を入力"></el-input>
        </el-form-item>
        <el-form-item label="氏名" prop="name">
          <el-input v-model="form.name" placeholder="氏名を入力"></el-input>
        </el-form-item>
        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="form.phone" placeholder="電話番号を入力"></el-input>
        </el-form-item>
        <el-form-item label="メールアドレス" prop="email">
          <el-input v-model="form.email" placeholder="メールアドレスを入力"></el-input>
        </el-form-item>
        <el-form-item label="性別" prop="sex">
          <el-radio-group v-model="form.sex">
            <el-radio label="男">男性</el-radio>
            <el-radio label="女">女性</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生年月日" prop="birth">
          <el-date-picker
            placeholder="日付を選択"
            style="width: 100%"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            v-model="form.birth"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="アバター">
   <el-upload
  class="avatar-uploader"
  action="https://kakeibo-front1234.vercel.app/files/upload"
  :headers="{ token: user.token }"
  list-type="picture"
  :on-success="handleAvatarSuccess"
  >
            <el-button type="primary">画像をアップロード</el-button>
          </el-upload>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "User",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      username: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        username: [
          { required: true, message: 'ユーザー名を入力してください', trigger: 'blur' },
        ],
      },
      ids: [],
    };
  },
  created() {
    this.load(1);
  },
  methods: {
    handleAdd() {
      this.form = {};
      this.fromVisible = true;
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row));
      this.fromVisible = true;
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/user/update' : '/user/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form,
          }).then((res) => {
            if (res.code === '200') {
              this.$message.success('保存が完了しました');
              this.load(1);
              this.fromVisible = false;
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    },
    del(id) {
      this.$confirm('本当に削除しますか？', '削除確認', { type: 'warning' })
        .then(() => {
          this.$request.delete('/user/delete/' + id).then((res) => {
            if (res.code === '200') {
              this.$message.success('削除しました');
              this.load(1);
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    handleSelectionChange(rows) {
      this.ids = rows.map((v) => v.id);
    },
    delBatch() {
      if (!this.ids.length) {
        this.$message.warning('データを選択してください');
        return;
      }
      this.$confirm('選択したデータを削除しますか？', '削除確認', { type: 'warning' })
        .then(() => {
          this.$request.delete('/user/delete/batch', { data: this.ids }).then((res) => {
            if (res.code === '200') {
              this.$message.success('削除しました');
              this.load(1);
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum;
      this.$request
        .get('/user/selectPage', {
          params: {
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            username: this.username,
          },
        })
        .then((res) => {
          this.tableData = res.data?.list;
          this.total = res.data?.total;
        });
    },
    reset() {
      this.username = null;
      this.load(1);
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum);
    },
    handleAvatarSuccess(response) {
      this.form.avatar = response.data;
    },
  },
};
</script>

<style scoped></style>
