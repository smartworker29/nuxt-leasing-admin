<template>
  <div class="sizes">
    <b-row>
      <b-col lg="12">
        <h2>Edit Size - {{ formData.name }}</h2>
      </b-col>
      <b-col lg="12">
        <b-row class="form-group">
          <b-col lg="4">
            <b-form-group>
              <label class="col-form-label">Size Name *</label>
              <input
                id="name"
                type="text"
                class="form-control"
                :class="{
                  'is-valid': isValidated && validated.name,
                  'is-invalid': isValidated && !validated.name
                }"
                :value="formData.name"
                @change="updateFormData($event)"
              >
              <b-form-invalid-feedback>
                * Required Field
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="12">
            <div v-if="loading" class="text-center text-danger my-2">
              <b-spinner class="align-middle" />
              <strong>Loading...</strong>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row class="justify-content-between align-items-center actions-group">
      <div>
        <b-button type="button" variant="success" @click="reset()">
          <i class="fa fa-ban" /> Reset
        </b-button>
      </div>
      <div>
        <b-button type="submit" variant="primary" @click="updateSize()">
          <i class="fa fa-dot-circle-o" /> Save
        </b-button>
        &nbsp;&nbsp;
        <b-button type="button" variant="danger" @click="deleteSize()">
          <i class="fa fa-trash" /> Delete
        </b-button>
      </div>
    </b-row>
  </div>
</template>

<script>

import * as _ from 'lodash'

export default {
  name: 'EditSize',
  middleware: 'guest',
  data: () => ({
    loading: false,
    formData: {},
    validated: {
      name: null
    },
    isValidated: false,
    sizeId: undefined
  }),
  mounted() {
    this.sizeId = this.$route.params.id
    this.loading = true
    this.$axios.get(`/sizes/${this.sizeId}`).then(response => {
      this.formData = response.data.data
      this.loading = false
    })
  },
  methods: {
    updateSize() {
      const valid = this.validateData()
      if (valid) {
        this.resetValidate()
        this.loading = true
        this.$axios.put(`/sizes/${this.sizeId}`, {
          ...this.formData
        })
          .then(response => {
            this.loading = false
            this.$message.success('Update Succeed!', 1, () => {
              this.$router.push('/sizes')
            })
          })
          .catch(() => {
            this.loading = false
            this.$message.error('Update Failed!', () => {
              this.$router.push('/sizes')
            })
          })
      }
    },
    reset() {
      this.resetValidate()
      this.$axios.get(`/sizes/${this.sizeId}`).then(response => {
        this.formData = response.data.data
      })
    },
    deleteSize() {
      this.loading = true
      this.$axios.delete(`/sizes/${this.sizeId}`)
        .then(response => {
          this.loading = false
          this.$message.success('Successfully Removed!', 1, () => {
            this.$router.push('/sizes')
          })
        })
        .catch(() => {
          this.loading = false
          this.$message.error('Failed to remove!', () => {
            this.$router.push('/sizes')
          })
        })
    },
    updateFormData(e, property = undefined) {
      this.resetValidate()
      const name = property || e.target.id
      const value = _.isObject(e) ? e.target.value : e
      this.formData = _.cloneDeep(this.formData)
      this.formData[name] = value
    },
    resetValidate() {
      this.isValidated = false
      _.map(this.validated, (value, key) => {
        this.validated[key] = null
      })
    },
    validateData() {
      let valid = true
      this.isValidated = true
      _.map(this.formData, (value, key) => {
        if (value) {
          this.validated[key] = true
        }
      })
      _.map(this.validated, (value, key) => {
        if (!value) {
          valid = false
        }
      })
      return valid
    }
  }
}
</script>
<style scope>
.row.form-group {
  margin-bottom: 1rem;
  margin: 2.5rem -15px;
}
.sizes {
  margin-bottom: 80px;
}
.actions-group {
  padding: 15px;
}
</style>
