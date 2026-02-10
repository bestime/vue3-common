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
    <div class="ShareHodoMeter-row" v-for="group in state.tableList" :key="group.id">
      <div class="ShareHodoMeter-date" v-for="item in group.data" :key="item.dateTime">
        <slot name="date" v-bind="item"/>
        
        
      </div>
    </div>
  </div>  
</template>

<script lang="ts" setup>
import { reactive, onBeforeUnmount, watch } from 'vue'
import { getCalendarList, type ICalendarItem, type IData } from './lib';

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

const state = reactive({
  tableList: [] as ReturnType<typeof getCalendarList>
})


function renderCalendar () {
  state.tableList = getCalendarList(cloneDeep(props.data))
}

watch(() => [props.data.startTime, props.data.endTime, props.data.data.length], function () {
  renderCalendar()
}, {
  immediate: true
})

</script>