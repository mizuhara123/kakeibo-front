<template>
  <div>
    <!-- 検索バー -->
    <div class="search">
      <el-input placeholder="ユーザー名を入力して検索" style="width: 200px" v-model="userName"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    <!-- 操作ボタン -->
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規作成</el-button>
      <el-button type="danger" plain @click="delBatch">一括削除</el-button>
    </div>

    <!-- データテーブル -->
    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="番号" width="70" align="center" sortable></el-table-column>
        <el-table-column prop="userId" label="ID"></el-table-column>
        <el-table-column prop="userName" label="ユーザー名"></el-table-column>
        <el-table-column prop="balance" label="残高"></el-table-column>
        <el-table-column prop="income" label="収入"></el-table-column>
        <el-table-column prop="pay" label="支出"></el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">編集</el-button>
            <el-button size="mini" type="danger" plain @click="del(scope.row.id)">削除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ページネーション -->
      <div class="pagination">
        <el-pagination
            background
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- ダイアログ -->
    <el-dialog title="アカウント情報" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="ID" prop="userId">
          <el-input v-model="form.userId" placeholder="IDを入力"></el-input>
        </el-form-item>
        <el-form-item label="残高" prop="balance">
          <el-input v-model="form.balance" placeholder="残高を入力"></el-input>
        </el-form-item>
        <el-form-item label="収入" prop="income">
          <el-input v-model="form.income" placeholder="収入を入力"></el-input>
        </el-form-item>
        <el-form-item label="支出" prop="pay">
          <el-input v-model="form.pay" placeholder="支出を入力"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="save">確定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Ac",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      userName: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {},
      ids: []
    }
  },
  created() {
    this.load(1)
  },
  methods: {
    handleAdd() {
      this.form = {}
      this.fromVisible = true
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.fromVisible = true
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/ac/update' : '/ac/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form
          }).then(res => {
            if (res.code === '200') {
              this.$message.success('保存が成功しました')
              this.load(1)
              this.fromVisible = false
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    del(id) {
      this.$confirm('このデータを削除してもよろしいですか？', '削除の確認', {type: "warning"}).then(response => {
        this.$request.delete('/ac/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    handleSelectionChange(rows) {
      this.ids = rows.map(v => v.id)
    },
    delBatch() {
      if (!this.ids.length) {
        this.$message.warning('データを選択してください')
        return
      }
      this.$confirm('選択されたデータを削除してもよろしいですか？', '削除の確認', {type: "warning"}).then(response => {
        this.$request.delete('/ac/delete/batch', {data: this.ids}).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/ac/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          userName: this.userName,
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.userName = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
  }
}
</script>

<style scoped>
</style>
