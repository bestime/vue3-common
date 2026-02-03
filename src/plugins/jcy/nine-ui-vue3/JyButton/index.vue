<script lang="ts" setup>
export interface IProp {
  type?: 'A'| "B"
}
const props = withDefaults(defineProps<IProp>(), {
  type: 'A'
})
// ddddddd
</script>

<template>
  <div class="nine_button" :type="props.type">
    <slot />
  </div>
</template>

<style lang="scss">
.nine_button {
  background-color: red;
  color: white;
  display: inline-block;
  padding: 0 10px;
  line-height: 32px;
  user-select: none;
  cursor: pointer;
  transition: 0.15s;
  border-radius: 6px;
  margin: 20px;
  &:hover {
    background-color: rgb(223, 22, 22);
  }
}
</style>
