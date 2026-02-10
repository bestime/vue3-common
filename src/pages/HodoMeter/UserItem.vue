<style lang="scss" scoped>
.UserItem {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin: 5px;
  &[status="1"] {
    color: #666;
    background-color: #eeeeef;
  }
  &[status="2"] {
    color: blue;
    background-color: #dfdffb;
  }
  &[status="3"] {
    color: red;
    background-color: #f9e9e9;
  }
}
</style>

<template>
  <div class="UserItem" :status="props.data.status">
    <span>{{ props.data.userId }}</span>
    <b>{{ props.data.fmtStatus }}（{{ props.data.city }}）</b>
    <!-- <br><i>{{ props.data.startTime }}至 {{ props.data.endTime }}</i> -->
  </div>  
</template>

<script lang="ts" setup>
import type { IPersonDataOutput } from '@/share/ShareHodoMeter/lib';
import { reactive, onBeforeUnmount } from 'vue'


const props = defineProps<{
  data: IPersonDataOutput
}>()
</script>

