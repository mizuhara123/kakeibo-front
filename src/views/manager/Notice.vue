<template>
  <div>
    <!-- 🔍 検索部分 -->
    <div class="search">
      <el-input placeholder="タイトルを入力して検索" style="width: 200px" v-model="title"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    <!-- 🧩 操作ボタン -->
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規作成</el-button>
      <el-button type="danger" plain @click="delBatch">一括削除</el-button>
    </div>

    <!-- 📋 表データ -->
    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="番号" width="80" align="center" sortable></el-table-column>
        <el-table-column prop="title" label="タイトル" show-overflow-tooltip></el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
        <el-table-column prop="time" label="作成日時"></el-table-column>
        <el-table-column prop="user" label="作成者"></el-table-column>

        <el-table-column label="操作" width="180" align="center">
          <template v-slot="scope">
            <el-button plain type="primary" @click="handleEdit(scope.row)" size="mini">編集</el-button>
            <el-button plain type="danger" size="mini" @click="del(scope.row.id)">削除</el-button>
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
    <el-dialog title="お知らせ情報" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="title" label="タイトル">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="内容">
          <el-input type="textarea" :rows="5" v-model="form.content" autocomplete="off"></el-input>
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
  name: "Notice",
  data() {
    return {
      tableData: [],  // データ一覧
      pageNum: 1,     // 現在のページ
      pageSize: 10,   // 1ページあたりの件数
      total: 0,
      title: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        title: [
          { required: true, message: 'タイトルを入力してください', trigger: 'blur' },
        ],
        content: [
          { required: true, message: '内容を入力してください', trigger: 'blur' },
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
    save() {   // 保存処理（新規 or 更新）
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/notice/update' : '/notice/add',
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
        this.$request.delete('/notice/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    handleSelectionChange(rows) {   // 選択された行
      this.ids = rows.map(v => v.id)
    },
    delBatch() {   // 一括削除
      if (!this.ids.length) {
        this.$message.warning('データを選択してください')
        return
      }
      this.$confirm('選択したデータを削除しますか？', '削除確認', { type: "warning" }).then(() => {
        this.$request.delete('/notice/delete/batch', { data: this.ids }).then(res => {
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
      this.$request.get('/notice/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          title: this.title,
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.title = null
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
