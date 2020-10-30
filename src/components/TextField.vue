<template>
  <input type="text" :class="inputBackground" v-model="innerValue" />
</template>

<script>
export default {
  name: "TextField",
  props: {
    name: String,
    id: Number,
  },
  data() {
    return {
      inputBackground: this.id === 1 ? `leftInput` : `rightInput`,
    };
  },
  computed: {
    innerValue: {
      get() {
        return this.name;
      },
      set(value) {
        this.$emit("change-value", this.id, value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
input[type="text"] {
  font-size: 28px;
  width: 256px;
  height: 32px;
  text-align: center;
  border: none;
  border-bottom: 1px dashed black;
  outline: none;
  margin: 0px 12px;
}

.leftInput {
  background: rgba(180, 96, 0, 0.75);
}

.rightInput {
  background: rgba(255, 217, 135, 0.75);
}
</style>