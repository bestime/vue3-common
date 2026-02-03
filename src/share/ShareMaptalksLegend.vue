<style lang="scss" scoped>
.ShareMaptalksLegend {
  box-sizing: border-box;
  position: absolute;
  left: 15px;
  bottom: 15px;
  width: 140px;
  background-color: #0c286d;
  border: #2d53b4 solid 1px;
  border-radius: 6px;
  overflow: hidden;
  h5 {
    line-height: 40px;
    height: 40px;
    margin: 0;
    padding: 0;
    text-align: center;
    font-size: 16px;
    color: white;
    background-color: #18419a;
  }
  ul {
    padding: 10px 0;
    margin: 0;
    list-style: none;
    user-select: none;
  }
  li {
    display: flex;
    align-items:center;
    font-size: 14px;
    color:#4c65a2;
    padding: 5px 12px;
    text-decoration: line-through;
    cursor: pointer;
    
    &.is-selected {
      color:#F9F9F9E5;
      text-decoration: none;
    }
    img {
      width: 22px;
      height: 22px;
      margin: 0 5px 0 0;
    }
  }
}
</style>

<template>
  <div class="ShareMaptalksLegend">
    <h5 class="test">图例</h5>
    <ul>
      <li v-for="item in props.data" :key="item.id" :class="{'is-selected': isSelected(item.id)}" @click="toggleSelect(item.id)">
        <img :src="item.icon"/>
        {{ item.label }}
      </li>
    </ul>
  </div>  
</template>


<script lang="ts" setup>
import { reactive, onBeforeUnmount, computed } from 'vue'

const selectedIds = defineModel<string[]>('modelValue', {
  required: true
})


export interface ILegendItem {
  id: string,
  label: string
  icon: string
}

const props = defineProps<{
  data: ILegendItem[]
}>()

const emits = defineEmits<{
  (name: 'on-select', ids: string[]): void
}>()

function isSelected (id: string) {
  return selectedIds.value?.includes(id)
}

function toggleSelect (id: string) {
  if(isSelected(id)){
    jUtilsBase.arrayRemove(selectedIds.value, function (c) {
      return c === id
    })
  } else {
    selectedIds.value.push(id)
  }
  emits('on-select', selectedIds.value)
}
</script>