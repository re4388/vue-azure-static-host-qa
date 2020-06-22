<template>
  <div class=workspace>
    <b-overlay :show="loading" rounded="sm">
      <template v-slot:overlay>
        <div class="text-center">
          <b-icon icon="search" font-scale="3" animation="cylon"></b-icon>
          <div>{{loading_msg}}</div>
          <b-button
            ref="cancel"
            variant="outline-danger"
            size="sm"
            @click="clickCancel"
            aria-describedby="cancel-label">
            Cancel
          </b-button>
        </div>
      </template>
      <el-card
        class="card">
        <div class="_container">
          <el-form
            class="_content form"
            ref="form"
            :rules="rules"
            :model="form">
            <el-form-item label="Keyword" prop="keyword">
              <el-input
                v-model="form.keyword"
                placeholder="keyword to find papers">
              </el-input>
            </el-form-item>
            <el-form-item label="Number of Papers" prop="npaper">
              <el-select
                v-model="form.npaper"
                placeholder="number of papers">
                <el-option
                  v-for="(x, i) in npaperOption"
                  :key="i"
                  :label="x"
                  :value="x">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Question" prop="question">
              <el-input
                v-model="form.question"
                type="textarea"
                placeholder="question to ask papers">
              </el-input>
            </el-form-item>
            <el-form-item class="form-button-group">
              <el-button @click="resetForm('form')">Reset</el-button>
              <el-button type="primary" @click="submitForm('form')">Submit</el-button>
            </el-form-item>
          </el-form>
          <el-tabs
            class="_content result"
            type="border-card">
            <el-tab-pane label="Summary" class="summary">
              <el-select
                v-model="lang"
                class="summary-sel"
                placeholder="Select a language">
                <el-option
                  v-for="item in langOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <article class="summary-content">
                <h4>Keyword</h4>
                {{ result.keyword }}
                <h4>Number of Papers</h4>
                {{ result.num_papers }}
                <h4>Question</h4>
                {{ result.question }}
                <h4>Summary</h4>
                <p> {{ !result.summary_text ? '' : result.summary_text[lang] }} </p>
              </article>
            </el-tab-pane>
            <el-tab-pane label="Search Result" class="detail">
              <el-button
                class="detail-button"
                type="primary"
                :disabled="!result.job_id"
                @click="clickDownload">
                Download
                <i class="el-icon-download el-icon-right"></i>
              </el-button>
              <div
                class="detail-content"
                v-html="result.search_result"
                ></div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </b-overlay>
  </div>
</template>

<script>
import { API } from '../api/api.js'

export default {
  name: 'Workspace',
  components: {},
  props: [],
  data () {
    return {
      jobId: null,
      loading: false,
      loading_msg: '',
      intervalObj: null,
      form: {
        keyword: '',
        npaper: 10,
        question: ''
      },
      rules: {
        keyword: [
          { required: true, message: 'Please input keywords', trigger: 'blur' }
        ],
        npaper: [
          { required: true, message: 'Please select number of papers', trigger: 'change' }
        ],
        question: [
          { required: true, message: 'Please input question', trigger: 'blur' }
        ]
      },
      npaperOption: [ 10, 100, 1000, 2000, 5000, 10000, 20000 ],
      lang: 'EN',
      langOption: [
        { value: 'EN', label: 'English' },
        { value: 'TW', label: 'Traditional Chinese' },
        { value: 'CN', label: 'Simplified Chinese' },
        { value: 'JP', label: 'Japanise' },
        { value: 'KO', label: 'Korean' }
      ],
      result: {}
    }
  },
  watch: {
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          console.log('submit')
          let reqdata = {
            keyword: this.form.keyword,
            num_papers: this.form.npaper,
            question: this.form.question
          }
          console.log(reqdata)
          API.submit(reqdata).then((res) => {
            console.log(res)
            this.jobId = res.job_id
            if (this.intervalObj) clearInterval(this.intervalObj)
            this.intervalObj = setInterval(this.checkStatus, 1000)
            this.loading = true
            this.loading_msg = 'loading...'
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    clickDownload (e) {
      console.log('click download')
      let jobId = this.result.job_id
      console.log(jobId)
      API.download(jobId)
    },
    clickCancel (e) {
      console.log('job canceled')
      API.kill(this.jobId).then((res) => {
        if (this.intervalObj) clearInterval(this.intervalObj)
        this.jobId = null
        console.log(res)
      })
      this.loading = false
    },
    checkStatus () {
      let jobId = this.jobId
      if (jobId === null) return
      API.checkStatus(jobId).then((res) => {
        console.log(res)
        if (res.status === 0) { // finish
          if (this.intervalObj !== null) clearInterval(this.intervalObj)
          this.loading = false
          this.loading_msg = ''
          this.result = res
        } else if (res.status === -1) { // killed
          if (this.intervalObj !== null) clearInterval(this.intervalObj)
          this.loading = false
          this.loading_msg = ''
          this.jobId = null
          // alert(res.msg)
        } else { // pending, progressing
          this.loading_msg = res.msg
        }
      })
    }
  },
  beforeRouteLeave (to, from, next) {
    if (this.intervalObj !== null) clearInterval(this.intervalObj)
    next()
  },
  created () {
  },
  mounted () {
  }
}
</script>

<style>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.card:hover > .el-card__body {
  padding-right: 14px;
}
.el-form-item > .el-form-item__label, .el-form-item__content {
  line-height: 30px;
}
</style>

<style scoped>
.workspace {
  width: 100%;
  height: fit-content;
  padding: 10vh 0 0 0;
  margin: 0;

  display: flex;
  justify-content: center;
}
.card {
  height: fit-content;
  max-height: 75vh;
  width: fit-content;
  max-width: 80vw;
  overflow-y: hidden;
}
.card > .el-card__body {
  padding: 20px;
}
.card:hover {
  overflow-y: scroll;
}
._container {
  display: flex;
  flex-wrap: wrap;
  /*flex: 1 1 auto;*/
  margin: 0;
  padding: 0;
}
._content {
  margin: 15px;
  /*flex: 1;*/
}
.form {
  height: fit-content;
  min-width: 200px;
  max-width: 300px;
  flex: 1;
}
.form > .el-form-item {
  margin-bottom: 10px;
}
.form > .form-button-group {
  margin-top: 20px;
}
.result {
  min-width: 500px;
}
.summary {
}
.summary > .summary-content {
}
.summary > .summary-content h4,p {
  margin-top: 5px;
  margin-bottom: 5px;
}
.summary > .summary-content p {
  overflow-wrap: break-word;
}
.summary > .summary-sel {
  width: 180px;
  float: right;
  position: relative;
}
.detail {
  display: flex;
  flex-direction: column;
}
.detail > .detail-button {
  width: fit-content;
  align-self: flex-end;
}
.detail > .detail-content {
  margin-top: 10px;
}
</style>
