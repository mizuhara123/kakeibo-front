<template>
  <div>
   
    <div class="search">
      <el-input placeholder="カテゴリ名を入力して検索" style="width: 200px;" v-model="name"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規作成</el-button>
      <el-button type="danger" plain @click="delBatch">一括削除</el-button>
    </div>

   
    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="番号" width="70" align="center" sortable></el-table-column>
        <el-table-column prop="name" label="カテゴリ"></el-table-column>
        <el-table-column prop="type" label="タイプ"></el-table-column>
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
          :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- 💬 ダイアログ -->
    <el-dialog title="カテゴリ情報" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="カテゴリ" prop="name">
          <el-input v-model="form.name" placeholder="カテゴリを入力"></el-input>
        </el-form-item>
        <el-form-item label="タイプ" prop="type">
          <el-select style="width: 100%" v-model="form.type">
            <el-option value="支出" label="支出"></el-option>
            <el-option value="収入" label="収入"></el-option>
          </el-select>
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
  name: "Category",
  data() {
    return {
      tableData: [],  // データ一覧
      pageNum: 1,     // 現在のページ
      pageSize: 10,   // 1ページあたりの件数
      total: 0,
      name: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        name: [
          { required: true, message: 'カテゴリ名を入力してください', trigger: 'blur' },
        ],
        type: [
          { required: true, message: 'タイプを選択してください', trigger: 'blur' },
        ]
      },
      ids: []
    }
  },
  created() {
    this.load(1)
  },
  methods: {
    handleAdd() {   // 新規追加
      this.form = {}
      this.fromVisible = true
    },
    handleEdit(row) {   // 編集
      this.form = JSON.parse(JSON.stringify(row))
      this.fromVisible = true
    },
    save() {   // 保存（新規または更新）
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/category/update' : '/category/add',
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
    del(id) {   // 単一削除
      this.$confirm('本当に削除しますか？', '削除確認', { type: "warning" }).then(() => {
        this.$request.delete('/category/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    handleSelectionChange(rows) {  // 選択された行
      this.ids = rows.map(v => v.id)
    },
    delBatch() {   // 一括削除
      if (!this.ids.length) {
        this.$message.warning('データを選択してください')
        return
      }
      this.$confirm('選択したデータを削除しますか？', '削除確認', { type: "warning" }).then(() => {
        this.$request.delete('/category/delete/batch', { data: this.ids }).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    load(pageNum) {  // ページデータ取得
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/category/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          name: this.name,
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.name = null
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
