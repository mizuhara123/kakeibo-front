<template>
  <div>
    <div class="card">
      <div style="margin-bottom: 10px; display: flex; align-items: center">
        <el-tag type="warning" v-if="plan.status === '未开始'">未開始</el-tag>
        <el-tag type="primary" v-if="plan.status === '进行中'">進行中</el-tag>
        <el-tag type="danger" v-if="plan.status === '已结束'">終了</el-tag>
        <el-tag type="success" v-if="plan.status === '已完成'">完了</el-tag>

        <div style="font-size: 20px; flex: 1; width: 0; margin-left: 5px" class="line1">
          {{ plan.name }}
          <span style="color: red; font-size: 16px; font-weight: bold; margin-left: 10px">￥{{ plan.money }}</span>
          <el-button type="primary" style="margin-left: 10px" @click="addPlanDetail(planId)">貯金する</el-button>
        </div>
        <div style="color: #666; margin-left: 20px; font-size: 13px; padding-right: 50px">
          <i class="el-icon-date"></i> {{ plan.end }}
        </div>
      </div>

      <div style="margin-bottom: 10px">
        <el-progress :percentage="plan.percent"></el-progress>
      </div>
    </div>

    <div style="margin-top: 10px">
      <el-row :gutter="10">
        <el-col :span="6" v-for="item in tableData" :key="item.id">
          <div class="card" style="background-color: #fff1e0; margin-bottom: 10px">
            <div style="display: flex; align-items: center; margin-bottom: 10px">
              <div style="color: #666; flex: 1">入金 ￥{{ item.money }}</div>
              <div style="display: flex; align-items: center">
                累計 <span style="color: red; font-size: 20px">{{ item.sum }}</span>
              </div>
            </div>
            <div style="display: flex; color: #666; font-size: 13px">
              <div style="flex: 1">{{ item.date }}</div>
              <div @click="del(item.id)" style="width: fit-content; cursor: pointer">
                <i class="el-icon-delete"></i><span>削除</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 貯金入力ダイアログ -->
    <el-dialog title="貯金" :visible.sync="detailFromVisible" width="30%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="detailForm" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="金額" prop="money">
          <el-input v-model="detailForm.money" placeholder="金額を入力してください"></el-input>
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
  name: "PlanDetail",
  data() {
    return {
      tableData: [],
      planId: this.$route.query.planId,
      plan: {},
      detailForm: {},
      detailFromVisible: false,
      rules: {
        money: [
          { required: true, message: '金額を入力してください', trigger: 'blur' },
          { pattern: /^\d+$/, message: '正の整数を入力してください', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      this.$request.get('/plan/selectById/' + this.planId).then(res => {
        this.plan = res.data || {}
      })

      this.$request.get('/planDetail/selectAll', { params: { planId: this.planId } }).then(res => {
        this.tableData = res.data || []
      })
    },
    addPlanDetail(planId) {
      this.detailFromVisible = true
      this.detailForm = { planId: planId }
    },
    savePlanDetail() {
      this.$request.post('/planDetail/add', this.detailForm).then(res => {
        if (res.code === '200') {
          this.$message.success('操作が成功しました')
          this.load()
          this.detailFromVisible = false
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    del(id) {
      this.$confirm('削除してもよろしいですか？', '削除の確認', { type: 'warning' }).then(() => {
        this.$request.delete('/planDetail/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('操作が成功しました')
            this.load()
          } else {
            this.$message.error(res.msg)
          }
        })
      }).catch(() => {})
    },
  }
}
</script>

<style scoped>
</style>
