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
    <el-dialog
      title="管理者情報"
      :visible.sync="fromVisible"
      width="40%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="ユーザー名" prop="username">
          <el-input v-model="form.username" placeholder="ユーザー名"></el-input>
        </el-form-item>
        <el-form-item label="氏名" prop="name">
          <el-input v-model="form.name" placeholder="氏名"></el-input>
        </el-form-item>
        <el-form-item label="電話番号" prop="phone">
          <el-input v-model="form.phone" placeholder="電話番号"></el-input>
        </el-form-item>
        <el-form-item label="メール" prop="email">
          <el-input v-model="form.email" placeholder="メールアドレス"></el-input>
        </el-form-item>
        <el-form-item label="アバター">
          <el-upload
            class="avatar-uploader"
            :action="$baseUrl + '/files/upload'"
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
  name: "Admin",
  data() {
    return {
      tableData: [],  // 一覧データ
      pageNum: 1,     // 現在ページ
      pageSize: 10,   // ページサイズ
      total: 0,
      username: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        username: [{ required: true, message: 'ユーザー名を入力してください', trigger: 'blur' }],
      },
      ids: []
    };
  },
  created() {
    this.load(1);
  },
  methods: {
    handleAdd() {  // 新規作成
      this.form = {};
      this.fromVisible = true;
    },
    handleEdit(row) {  // 編集
      this.form = JSON.parse(JSON.stringify(row));
      this.fromVisible = true;
    },
    save() {  // 保存
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/admin/update' : '/admin/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form
          }).then(res => {
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
    del(id) {  // 単一削除
      this.$confirm('本当に削除しますか？', '削除確認', { type: 'warning' }).then(() => {
        this.$request.delete('/admin/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました');
            this.load(1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    handleSelectionChange(rows) {  // 選択変更
      this.ids = rows.map(v => v.id);
    },
    delBatch() {  // 一括削除
      if (!this.ids.length) {
        this.$message.warning('データを選択してください');
        return;
      }
      this.$confirm('選択したデータを削除しますか？', '削除確認', { type: 'warning' }).then(() => {
        this.$request.delete('/admin/delete/batch', { data: this.ids }).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました');
            this.load(1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    load(pageNum) {  // ページ読み込み
      if (pageNum) this.pageNum = pageNum;
      this.$request.get('/admin/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          username: this.username,
        }
      }).then(res => {
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
    handleAvatarSuccess(response) {  // 画像アップロード成功時
      this.form.avatar = response.data;
    },
  }
};
</script>

<style scoped>
</style>
