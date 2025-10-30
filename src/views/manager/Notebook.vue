<template>
  <div>
    <!-- 🔍 検索欄 -->
    <div class="search">
      <el-input placeholder="タイトルを入力して検索" style="width: 200px" v-model="title"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    <!-- 🧭 操作ボタン -->
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規作成</el-button>
     <!--  <el-button type="danger" plain @click="delBatch">一括削除</el-button> -->
      <el-button type="success" plain v-if="tableData.length" @click="toggleSelectAll">
        {{ isAllSelected ? '全解除' : '全選択' }}
      </el-button>
    </div>

    <!-- ✅ 管理者：表格模式 -->
    <div class="table" v-if="user.role === 'ADMIN' && tableData.length">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="番号" width="80" align="center" sortable></el-table-column>
        <el-table-column label="カバー" width="120">
          <template v-slot="scope">
            <el-image
              style="width: 60px;"
              v-if="scope.row.cover"
              :src="scope.row.cover"
              :preview-src-list="[scope.row.cover]"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="タイトル" show-overflow-tooltip></el-table-column>
        <el-table-column label="内容" width="120">
          <template v-slot="scope">
            <el-button @click="showContent(scope.row.content)" type="text">内容を表示</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="作成日" width="180"></el-table-column>
        <el-table-column prop="userName" label="作成者" width="150"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template v-slot="scope">
            <el-button plain type="primary" @click="handleEdit(scope.row)" size="mini">編集</el-button>
            <el-button plain type="danger" size="mini" @click="del(scope.row.id)">削除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- ✅ 一般ユーザー：卡片模式 + 右上角复选框 -->
    <div v-else-if="tableData.length" style="margin-top: 10px">
      <el-row :gutter="10" style="margin-bottom: 10px">
        <el-col v-for="item in tableData" :key="item.id" :span="12" style="margin-bottom: 5px">
          <div class="card">
            <!-- ✅ 右上角选择框 -->
            <el-checkbox
              v-model="checkedIds"
              :label="item.id"
              class="note-checkbox"
            ></el-checkbox>

            <div style="flex: 1;">
              <div style="font-size: 20px; margin-bottom: 10px" class="line1">{{ item.title }}</div>
              <div style="color: #666; display: flex; align-items: center">
                <div style="flex: 1">
                  <span><i class="el-icon-user"></i> {{ item.userName }}</span>
                  <span style="margin-left: 10px"><i class="el-icon-date"></i> {{ item.date }}</span>
                </div>
                <div style="flex: 1;">
                  <el-button @click="showContent(item.content)" type="text" style="font-size: 14px"><i class="el-icon-reading"></i> 閲覧</el-button>
                  <el-button @click="handleEdit(item)" type="text" style="font-size: 14px; color: #2a60c9"><i class="el-icon-edit"></i> 編集</el-button>
                  <el-button @click="del(item.id)" type="text" style="font-size: 14px; color: red"><i class="el-icon-delete"></i> 削除</el-button>
                </div>
              </div>
            </div>
            <img :src="item.cover" alt="" style="width: 120px; height: 60px; margin-left: 10px">
          </div>
        </el-col>
      </el-row>

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

    <!-- ✏️ 編集・追加ダイアログ -->
    <el-dialog title="情報" :visible.sync="fromVisible" width="60%" :close-on-click-modal="false" destroy-on-close>
      <el-form label-width="100px" style="padding-right: 50px" :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="title" label="タイトル">
          <el-input v-model="form.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="カバー" prop="cover">
          <el-upload
            :action="'https://43.165.181.179:9090/files/upload'"
            :headers="{ token: user.token }"
            list-type="picture"
            :on-success="handleCoverSuccess"
          >
            <el-button type="primary">カバーをアップロード</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item prop="content" label="内容">
          <div id="editor"></div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="save">確定</el-button>
      </div>
    </el-dialog>

    <!-- 📖 閲覧用 -->
    <el-dialog title="情報" :visible.sync="contentVisible" width="50%" :close-on-click-modal="false" destroy-on-close>
      <div class="w-e-text">
        <div v-html="content"></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="contentVisible = false">確定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import E from 'wangeditor'

export default {
  name: "Notebook",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      title: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        title: [{ required: true, message: 'タイトルを入力してください', trigger: 'blur' }],
      },
      ids: [],         // 管理者选中
      checkedIds: [],  // 用户卡片选中
      editor: null,
      contentVisible: false,
      content: ''
    }
  },
  computed: {
    isAllSelected() {
      return this.checkedIds.length === this.tableData.length && this.tableData.length > 0
    }
  },
  created() {
    this.load(1)
  },
  methods: {
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.checkedIds = []
      } else {
        this.checkedIds = this.tableData.map(item => item.id)
      }
    },
    showContent(content) {
      this.content = content
      this.contentVisible = true
    },
    handleAdd() {
      this.form = {}
      this.setRichText()
      this.fromVisible = true
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.setRichText(this.form.content)
      this.fromVisible = true
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.form.content = this.editor.txt.html()
          this.$request({
            url: this.form.id ? '/notebook/update' : '/notebook/add',
            method: this.form.id ? 'PUT' : 'POST',
            data: this.form
          }).then(res => {
            if (res.code === '200') {
              this.$message.success('保存に成功しました')
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
      this.$confirm('削除してもよろしいですか？', '削除の確認', { type: "warning" }).then(() => {
        this.$request.delete('/notebook/delete/' + id).then(res => {
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
      const selected = this.user.role === 'ADMIN' ? this.ids : this.checkedIds
      if (!selected.length) {
        this.$message.warning('データを選択してください')
        return
      }
      this.$confirm('これらのデータを一括削除してもよろしいですか？', '削除の確認', { type: "warning" })
        .then(() => {
          this.$request.delete('/notebook/delete/batch', { data: selected }).then(res => {
            if (res.code === '200') {
              this.$message.success('削除しました')
              this.load(1)
              this.ids = []
              this.checkedIds = []
            } else {
              this.$message.error(res.msg)
            }
          })
        })
        .catch(() => {})
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/notebook/selectPage', {
        params: { pageNum: this.pageNum, pageSize: this.pageSize, title: this.title }
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
    handleCoverSuccess(res) {
      this.form.cover = res.data
    },
    setRichText(content) {
      this.$nextTick(() => {
        this.editor = new E(`#editor`)
        this.editor.config.uploadImgServer = this.$baseUrl + '/files/editor/upload'
        this.editor.config.uploadFileName = 'file'
        this.editor.config.uploadImgHeaders = { token: this.user.token }
        this.editor.config.uploadImgParams = { type: 'img' }
        this.editor.config.placeholder = '本文を入力してください'
        this.editor.create()
        if (content) {
          this.editor.txt.html(content)
        }
      })
    },
  }
}
</script>

<style scoped>
.card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.note-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 99;
  background: #fff;
  border-radius: 4px;
  padding: 2px 4px;
}
</style>

