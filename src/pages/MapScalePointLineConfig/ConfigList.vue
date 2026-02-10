<style lang="scss" scoped>
.ConfigList {
  background-color: #ddd;
  border: #ddd solid 1px;
  margin: 10px;
  padding: 10px;
}
ul {
  box-sizing: border-box;
  padding: 0;
  margin: 5px 0;
  list-style: none;
  background-color: #f5f5f5;
  li {
    
    padding: 5px;
    border-radius: 6px;
  }
}

</style>

<template>
  <div class="ConfigList">
    
    <!-- <h3>{{props.data}}</h3> -->
    <ul v-for="item in props.data" :key="item.zoom">
      <button @click="toEdit(item.zoom)">编辑此项</button>
      <button @click="toDelete(item.zoom)">删除此项</button>
      <li>
        <b>缩放：</b>
        <span>{{item.zoom}}</span>
      </li>
      <li>
        <b>开启等比缩放：</b>
        <span>{{item.data.enableScale}}</span>
      </li>
      <li>
        <b>图标尺寸：</b>
        <span>{{item.data.iconSize}}</span>
      </li>
      <li>
        <b>图标水平偏移：</b>
        <span>{{item.data.iconHorizontalOffset}}</span>
      </li>
      <li>
        <b>图标垂直偏移：</b>
        <span>{{item.data.iconVerticalOffset}}</span>
      </li>
      <li>
        <b>文字大小：</b>
        <span>{{item.data.fontSize}}</span>
      </li>
      <li>
        <b>文字水平偏移：</b>
        <span>{{item.data.fontHorizontalOffset}}</span>
      </li>
      <li>
        <b>文字垂直偏移：</b>
        <span>{{item.data.fontVerticalOffset}}</span>
      </li>
    </ul>
  </div>  
</template>

<script lang="ts" setup>
import type { ShareMaptalksZoomLayerConfig } from '@/share/ShareMaptalksZoomLayer';
import { reactive, onBeforeUnmount } from 'vue'
const props = defineProps<{
  data: any[]
}>()


const emits = defineEmits<{
  (name: 'on-edit', zoom: number): void
  (name: 'on-delete', zoom: number): void
}>()
function toEdit (zoom: number) {
  emits('on-edit', zoom)
}

function toDelete (zoom: number) {
  emits('on-delete', zoom)
}
</script>