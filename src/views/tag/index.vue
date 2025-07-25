<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="queryParams.name"
            placeholder="请输入标签名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <ButtonGroup>
            <el-button type="primary" icon="Plus" @click="handleAdd">新增</el-button>
            <el-button type="danger" icon="Delete" :disabled="selectedIds.length === 0"
              @click="handleBatchDelete">批量删除</el-button>
          </ButtonGroup>
        </div>
      </template>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tagList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="名称" align="center" prop="name" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
            <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]" :total="total" :background="true"
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body destroy-on-close>
      <el-form ref="tagFormRef" :model="tagForm" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="tagForm.name" placeholder="请输入名称" clearable />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import ButtonGroup from '@/components/ButtonGroup/index.vue'
import { getTagListApi, addTagApi, updateTagApi, deleteTagApi } from '@/api/tag/index'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  name: ''
})

const loading = ref(false)
const total = ref(0)
const tagList = ref([])
const queryFormRef = ref<FormInstance>()
const tagFormRef = ref<FormInstance>()
const submitLoading = ref(false)

// 选中项数组
const selectedIds = ref<number[]>([])

// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false,
  type: 'add'
})

// 表单数据
const tagForm = reactive({
  id: undefined,
  name: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
})

// 获取标签列表
const getList = async () => {
  loading.value = true
  try {
    const { data } = await getTagListApi(queryParams)
    tagList.value = data.records || []
    total.value = data.total || 0
  } catch (error) {
    console.error('获取标签列表失败', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

// 表格选择项变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return

  ElMessageBox.confirm(`是否确认删除 ${selectedIds.value.length} 个标签?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTagApi(selectedIds.value.join(','))
      ElMessage.success('批量删除成功')
      getList()
      selectedIds.value = []
    } catch (error) {
      console.error('批量删除失败', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => { })
}

// 删除
const handleDelete = async (row: any) => {
  ElMessageBox.confirm(`是否确认删除 ${row.name} 这个标签?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTagApi(row.id.toString())
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => { })
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields()
  }
  queryParams.name = ''
  handleQuery()
}

// 新增标签
const handleAdd = () => {
  dialog.type = 'add'
  dialog.title = '添加标签'
  dialog.visible = true
  resetForm()
}

// 修改标签
const handleUpdate = (row: any) => {
  dialog.type = 'edit'
  dialog.title = '修改标签'
  dialog.visible = true
  resetForm()
  Object.assign(tagForm, row)
}

// 提交表单
const submitForm = async () => {
  if (!tagFormRef.value) return

  await tagFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true

      try {
        if (dialog.type === 'add') {
          await addTagApi(tagForm)
          ElMessage.success('添加成功')
        } else {
          await updateTagApi(tagForm)
          ElMessage.success('修改成功')
        }
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('操作失败', error)
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 取消按钮
const cancel = () => {
  dialog.visible = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (tagFormRef.value) {
    tagFormRef.value.resetFields()
  }
  tagForm.id = undefined
  tagForm.name = ''
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 分页页码改变
const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-wrapper {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>