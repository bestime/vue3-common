<style lang="scss" scoped>
.ShareHodoMeter {
  box-sizing: border-box;
  margin: 20px;
  border: red solid 1px;
  border-right: none;
  border-bottom: none;
}

.ShareHodoMeter-row {
  display: flex;
  
  
}

.ShareHodoMeter-date {
  flex: 1;
  text-align: center;
  border: red solid 1px;
  border-left: none;
  border-top: none;
  display: flex;
  flex-direction: column;
  position:relative;
  &.is-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    border: black solid 4px;
    z-index: 2;
    pointer-events: none;
  }
}
</style>

<template>
  <div class="ShareHodoMeter">
    <!-- <div class="ShareHodoMeter-row">
      <div class="ShareHodoMeter-date">周一</div>
      <div class="ShareHodoMeter-date">周二</div>
      <div class="ShareHodoMeter-date">周三</div>
      <div class="ShareHodoMeter-date">周四</div>
      <div class="ShareHodoMeter-date">周五</div>
      <div class="ShareHodoMeter-date">周六</div>
      <div class="ShareHodoMeter-date">周日</div>
    </div> -->
    <div class="ShareHodoMeter-row" v-for="group in state.tableList" :key="group.key">
      <div class="ShareHodoMeter-date" v-for="item in group.data" :key="item.dateTime" :class="{'is-active': item.isActive}" :status="item.status">
        <slot name="date" v-bind="item" :key="item.key"/>
        
        
      </div>
    </div>
  </div>  
</template>

<script lang="ts" setup>
import { reactive, onBeforeUnmount, watch } from 'vue'
import { getCalendarList, type ICalendarItem, type IData, type IPersonDataOutput } from './lib';

import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import { defualtFormatter } from '@bestime/utils_base';



/**
 * 硬性要求
 * 1. 开始时间不能大于使用的日期
 * 2. 结束时间不能小于使用的日期
 * 3. 最新的结束日期覆盖之前已存在的结束日期
 */
const props = defineProps<{
  data: IData
}>();

const emits = defineEmits<{
  (name: 'on-active-change', data: IPersonDataOutput[]): void
}>()

const state = reactive({
  tableList: [] as ReturnType<typeof getCalendarList>['data']
})


function renderCalendar () {
  const cvt = getCalendarList(cloneDeep(props.data))
  state.tableList = cvt.data
  emits('on-active-change', cvt.activeUserList)
}

watch(() => [props.data.startTime, props.data.endTime, props.data.data.length], function () {
  renderCalendar()
}, {
  immediate: true
})

</script>