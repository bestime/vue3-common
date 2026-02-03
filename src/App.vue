<style lang="scss" scoped>
.app-scale-outer {
  position:absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  flex-shrink: 0;  
  
  :deep(.nine_size_box_body) {
    display: flex;
    flex-direction: column;    
  }
}

#app-root-container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #f4f4f4;
}
</style>

<template>
  <RouterView/>
</template>

<script setup lang="ts">
import { NineSizeBox } from '@bestime/nine-ui-vue3'
import 'dayjs/locale/zh-cn';
import { nextTick, onMounted, reactive } from 'vue';
import { IS_DEV } from './utils/constant';

const state = reactive({
  control: false,
  scaleMode: 'scale-stretch' as 'initial' | 'scale-stretch' | 'scale-aspect' | 'scale-aspect-scroll',
})

console.log("IS_DEV", IS_DEV)

if(IS_DEV) {
  state.control = true
  state.scaleMode = 'initial'
}
</script>
