<template>
  <div class="colors" :class="{ 'loading': loading }">
    <b-row>
      <b-col lg="12">
        <h2>Add New Color</h2>
      </b-col>
      <b-col lg="12">
        <b-row class="form-group">
          <b-col lg="4">
            <b-form-group>
              <label class="col-form-label">Color Name *</label>
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
        <b-row class="form-group">
          <b-col lg="4">
            <b-form-group>
              <label class="col-form-label">Hex Color Code *</label>
              <b-input-group>
                <b-input-group-prepend>
                  <b-input-group-text>#</b-input-group-text>
                </b-input-group-prepend>
                <b-form-input
                  id="hexColor"
                  type="text"
                  :class="{
                    'is-valid': isValidated && validated.hexColor,
                    'is-invalid': isValidated && !validated.hexColor,
                  }"
                  :value="formData.hexColor"
                  @change="updateFormData($event, 'hexColor')"
                />
              </b-input-group>
              <b-form-invalid-feedback>
                * Required Field
              </b-form-invalid-feedback>
            </b-form-group>
          </b-col>
          <b-col lg="4">
            <b-form-group>
              <label class="col-form-label">Price</label>
              <b-input-group>
                <b-input-group-prepend>
                  <b-input-group-text>$</b-input-group-text>
                </b-input-group-prepend>
                <b-form-input
                  id="price"
                  type="number"
                  :value="formData.price || 0"
                  @change="updateFormData(parseInt($event, 10), 'price')"
                />
              </b-input-group>
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
        <b-button type="submit" variant="primary" @click="createColor()">
          <i class="fa fa-dot-circle-o" /> Create
        </b-button>
        &nbsp;&nbsp;
        <b-button type="button" variant="danger" @click="cancel()">
          <i class="fa fa-close" /> Cancel
        </b-button>
      </div>
    </b-row>
  </div>
</template>

<script>

import * as _ from 'lodash'

export default {
  name: 'NewColors',
  middleware: 'guest',
  data: () => ({
    formData: {},
    validated: {
      name: null,
      hexColor: null
    },
    isValidated: false,
    loading: false
  }),
  mounted() {
    this.formData.scrapValues = []
  },
  methods: {
    createColor() {
      const valid = this.validateData()
      if (valid) {
        this.resetValidate()
        this.loading = true
        this.$axios.post('/colors/', {
          name: this.formData.name,
          price: this.formData.price || 0,
          hexColor: `#${this.formData.hexColor}`
        })
          .then(response => {
            this.loading = false
            this.$message.success('Successfully Created!', 1, () => {
              this.$router.push('/colors')
            })
          })
          .catch(() => {
            this.loading = false
            this.$message.error('Failed to create!', () => {
              this.$router.push('/colors')
            })
          })
      }
    },
    reset() {
      this.formData = {}
      this.resetValidate()
    },
    cancel() {
      this.$router.push('/colors')
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
      _.map(this.validated, (value, key) => {
        this.validated[key] = false
        if (this.formData[key]) {
          this.validated[key] = true
        }
        if (key === 'hexColor' && !/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(this.formData[key])) {
          this.validated[key] = false
        }
      })
      _.map(this.validated, (value, key) => {
        if (!value) {
          valid = false
          this.$message.error(`The ${key} field is Invalid`, 1)
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
.colors {
  margin-bottom: 80px;
}
.actions-group {
  padding: 15px;
}
</style>
