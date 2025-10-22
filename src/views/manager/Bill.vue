<template>
  <div>
    <!-- 🔍 検索エリア -->
    <div class="search">
      <el-input placeholder="帳簿タイプを選択して検索" style="width: 200px; margin-right: 10px" v-model="type"></el-input>
      <el-input placeholder="カテゴリを選択して検索" style="width: 200px; margin-right: 10px" v-model="category"></el-input>
      <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="start" placeholder="開始日を選択" style="width: 200px; margin-right: 10px"></el-date-picker>
      <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="end" placeholder="終了日を選択" style="width: 200px;"></el-date-picker>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    <!-- 🧩 操作ボタン -->
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規</el-button>
      <el-button type="danger" plain @click="delBatch">一括削除</el-button>
      <el-button type="info" plain @click="exportBatch">一括エクスポート</el-button>
    </div>

    <!-- 📋 テーブル -->
    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="番号" width="70" align="center" sortable></el-table-column>
        <el-table-column prop="type" label="帳簿タイプ"></el-table-column>
        <el-table-column prop="category" label="カテゴリ"></el-table-column>
        <el-table-column prop="payType" label="支払方法"></el-table-column>
        <el-table-column prop="money" label="金額"></el-table-column>
        <el-table-column prop="comment" label="メモ"></el-table-column>
        <el-table-column prop="time" label="日付"></el-table-column>
        <el-table-column prop="userName" label="ユーザー名"></el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">編集</el-button>
            <el-button size="mini" type="danger" plain @click="del(scope.row.id)">削除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 📖 ページネーション -->
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

    <!-- 🧾 記帳情報ダイアログ -->
    <el-dialog title="記帳情報" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        
        <!-- 帳簿タイプ -->
        <el-form-item label="帳簿タイプ" prop="type">
          <el-select
            style="width: 100%"
            v-model="form.type"
            @change="getCategoryList"
            :disabled="form.id"
            placeholder="帳簿タイプを選択"
          >
            <el-option value="支出">支出</el-option>
            <el-option value="収入">収入</el-option>
          </el-select>
        </el-form-item>

        <!-- カテゴリ -->
        <el-form-item label="カテゴリ" prop="category">
          <el-select
            style="width: 100%"
            v-model="form.category"
            placeholder="カテゴリを選択"
          >
            <el-option v-for="item in categoryList" :key="item.id" :value="item.name">{{ item.name }}</el-option>
          </el-select>
        </el-form-item>

        <!-- 支払方法 -->
        <el-form-item label="支払方法" prop="payType">
          <el-select
            v-model="form.payType"
            style="width: 100%"
            placeholder="支払方法を選択"
          >
            <el-option value="Paypay">Paypay</el-option>
            <el-option value="ギフト券">ギフト券</el-option>
            <el-option value="銀行カード">銀行カード</el-option>
            <el-option value="現金">現金</el-option>
          </el-select>
        </el-form-item>

        <!-- 金額 -->
        <el-form-item label="金額" prop="money">
          <el-input v-model="form.money" placeholder="金額を入力" :disabled="form.id" :min="1"></el-input>
        </el-form-item>

        <!-- メモ -->
        <el-form-item label="メモ" prop="comment">
          <el-input type="textarea" v-model="form.comment" placeholder="メモを入力"></el-input>
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
  name: "Bill",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      type: null,
      category: null,
      start: null,
      end: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        type: [{ required: true, message: '帳簿タイプを選択してください', trigger: 'blur' }],
        category: [{ required: true, message: 'カテゴリを選択してください', trigger: 'blur' }],
        payType: [{ required: true, message: '支払方法を選択してください', trigger: 'blur' }],
        money: [
          { required: true, message: '金額を入力してください', trigger: 'blur' },
          { pattern: /^(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/, message: '金額は数値で入力し、小数点以下は最大2桁までです', trigger: 'blur' }
        ]
      },
      ids: [],
      categoryList: []
    }
  },
  created() {
    this.load(1)
  },
  methods: {
    exportBatch() {
      let url = this.$baseUrl + '/bill/export'
      if (this.user.role === 'USER') {
        url += '?userId=' + this.user.id
      }
      window.open(url)
    },
    getCategoryList() {
      if (this.form.category) {
        this.form.category = ''
      }
      this.$request.get('/category/selectAll', {
        params: { type: this.form.type }
      }).then(res => {
        this.categoryList = res.data || []
      })
    },
    handleAdd() {
      this.form = {}
      this.fromVisible = true
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.$request.get('/category/selectAll', {
        params: { type: this.form.type }
      }).then(res => {
        this.categoryList = res.data || []
      })
      this.fromVisible = true
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request({
            url: this.form.id ? '/bill/update' : '/bill/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form
          }).then(res => {
            if (res.code === '200') {
              this.$message.success('保存しました')
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
      this.$confirm('このデータを削除してもよろしいですか？', '削除の確認', { type: "warning" }).then(() => {
        this.$request.delete('/bill/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => { })
    },
    handleSelectionChange(rows) {
      this.ids = rows.map(v => v.id)
    },
    delBatch() {
      if (!this.ids.length) {
        this.$message.warning('削除するデータを選択してください')
        return
      }
      this.$confirm('選択したデータを削除しますか？', '削除の確認', { type: "warning" }).then(() => {
        this.$request.delete('/bill/delete/batch', { data: this.ids }).then(res => {
          if (res.code === '200') {
            this.$message.success('削除しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => { })
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/bill/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          type: this.type,
          category: this.category,
          start: this.start,
          end: this.end,
        }
      }).then(res => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
    },
    reset() {
      this.type = null
      this.category = null
      this.start = null
      this.end = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
  }
}
</script>

<style scoped>
.search, .operation {
  margin-bottom: 15px;
}
</style>
