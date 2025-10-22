<template>
  <div>
    <div class="search">
      <el-input placeholder="タイトルを入力して検索" style="width: 200px" v-model="name"></el-input>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">検索</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">リセット</el-button>
    </div>

    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新規作成</el-button>
    </div>

    <div style="margin-top: 10px" v-if="tableData.length">
      <div>
        <el-row :gutter="10" style="margin-bottom: 10px">
          <el-col v-for="item in tableData" :key="item.id" :span="12" style="margin-bottom: 5px">
            <div style="display: flex; align-items: center; cursor: pointer" class="card" @click="$router.push('/planDetail?planId=' + item.id)">
              <img :src="item.cover" alt="" style="width: 80px; height: 80px">
              <div style="flex: 1; margin-left: 15px">
                <div style="margin-bottom: 10px; display: flex; align-items: center">
                  <el-tag type="warning" v-if="item.status === '未开始'">未開始</el-tag>
                  <el-tag type="primary" v-if="item.status === '进行中'">進行中</el-tag>
                  <el-tag type="danger" v-if="item.status === '已结束'">終了</el-tag>
                  <el-tag type="success" v-if="item.status === '已完成'">完了</el-tag>
                  <div style="font-size: 20px; flex: 1; width: 0" class="line1">{{ item.name }}</div>
                  <div style="color: #666; margin-left: 20px; font-size: 13px"><i class="el-icon-date"></i> {{ item.end }}</div>
                </div>
                <div style="margin-bottom: 10px">
                  <el-progress :percentage="item.percent"></el-progress>
                </div>
                <div style="display: flex; align-items: center">
                  <div style="flex: 1; color: #666">
                    <span><i class="el-icon-user"></i> {{ item.userName }}</span>
                    <span style="margin-left: 10px"><i class="el-icon-date"></i> {{ item.date }}</span>
                  </div>
                  <div style="width: 50px">
                    <el-button type="primary" @click.stop="addPlanDetail(item.id)">貯金する</el-button>
                  </div>
                  <div style="flex: 1; text-align: right">
                    <el-button @click.stop="handleEdit(item)" type="text" style="font-size: 13px; color: #2a60c9"><i class="el-icon-edit"></i> 編集</el-button>
                    <el-button @click.stop="del(item.id)" type="text" style="font-size: 13px; color: red"><i class="el-icon-delete"></i> 削除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
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

    <!-- 追加・編集ダイアログ -->
    <el-dialog title="情報" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="プラン名" prop="name">
          <el-input v-model="form.name" placeholder="プラン名"></el-input>
        </el-form-item>
        <el-form-item label="カバー" prop="cover">
          <el-upload
            :action="$baseUrl + '/files/upload'"
            :headers="{ token: user.token }"
            list-type="picture"
            :on-success="handleImgSuccess">
            <el-button type="primary">カバーをアップロード</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="目標金額" prop="money">
          <el-input v-model="form.money" placeholder="目標金額"></el-input>
        </el-form-item>
        <el-form-item label="開始日" prop="start">
          <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="form.start"
                          placeholder="開始日を選択" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="終了日" prop="end">
          <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="form.end"
                          placeholder="終了日を選択" style="width: 100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="save">確定</el-button>
      </div>
    </el-dialog>

    <!-- 貯金入力ダイアログ -->
    <el-dialog title="貯金" :visible.sync="detailFromVisible" width="30%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="detailForm" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="金額" prop="money">
          <el-input v-model="detailForm.money" placeholder="金額"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailFromVisible = false">キャンセル</el-button>
        <el-button type="primary" @click="savePlanDetail">確定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Plan",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      name: null,
      fromVisible: false,
      detailFromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        name: [{ required: true, message: 'プラン名を入力してください', trigger: 'blur' }],
        money: [
          { required: true, message: '金額を入力してください', trigger: 'blur' },
          { pattern: /^\d+$/, message: '正の整数を入力してください', trigger: 'blur' },
        ],
        start: [{ required: true, message: '開始日を選択してください', trigger: 'blur' }],
        end: [{ required: true, message: '終了日を選択してください', trigger: 'blur' }]
      },
      ids: [],
      detailForm: {}
    }
  },
  created() {
    this.load(1)
  },
  methods: {
    addPlanDetail(planId) {
      this.detailFromVisible = true
      this.detailForm = { planId: planId }
    },
    savePlanDetail() {
      this.$request.post('/planDetail/add', this.detailForm).then(res => {
        if (res.code === '200') {
          this.$message.success('操作が成功しました')
          this.load(1)
          this.detailFromVisible = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
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
            url: this.form.id ? '/plan/update' : '/plan/add',
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
      this.$confirm('削除してもよろしいですか？', '削除の確認', { type: 'warning' }).then(() => {
        this.$request.delete('/plan/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('操作が成功しました')
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
      this.$confirm('これらのデータを一括削除してもよろしいですか？', '削除の確認', { type: 'warning' }).then(() => {
        this.$request.delete('/plan/delete/batch', { data: this.ids }).then(res => {
          if (res.code === '200') {
            this.$message.success('操作が成功しました')
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum
      this.$request.get('/plan/selectPage', {
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
    handleImgSuccess(res) {
      this.form.cover = res.data
    }
  }
}
</script>

<style scoped>
</style>
