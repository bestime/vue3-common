<style lang="scss" scoped>
.HodoMeter {
  box-sizing: border-box;
}

.date-header {
  background-color: #ff7c7c;
  color: white;
  height: 40px;
  line-height: 40px;
  border-bottom: red solid 2px;
}

.is-holiday {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.current-users {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

<template>
  <div class="HodoMeter">
    <div>时间范围：{{ state.hodoData.startTime }} - {{ state.hodoData.endTime }}</div>
    <div class="current-users">
      <span>当天状态：</span>
      <UserItem v-for="user in state.activeUserList" :key="user.userId" :data="user"/>
    </div>
    <ShareHodoMeter :data="state.hodoData" @on-active-change="onActiveChange">
      <template #date="item">
        <div class="date-header">
          <b>{{ item.week }}</b>
          <span>{{ item.dateTime }}</span>
        </div>
        <div class="is-holiday" v-if="item.isHoliday">节假日</div>
        <UserItem v-else v-for="user in item.userList" :key="user.userId" :data="user"/>
      </template>
    </ShareHodoMeter>
  </div>  
</template>

<script lang="ts" setup>
import { reactive, onBeforeUnmount } from 'vue'
import ShareHodoMeter from '@/share/ShareHodoMeter/index.vue'
import type { IData, IPersonDataOutput } from '@/share/ShareHodoMeter/lib';
import UserItem from './UserItem.vue'



// 王五：仅在一天设置了几天的的数据
const testData01 = [
  { dataId: '1', dateTime: '2026-02-04',userId: '王五', status: '3', city: '四川', startTime: '2026-02-04', endTime: '2026-02-06' },
]

// 张三：第一天填了开始和结束时间，后面同状态未填开始和结束
const testData02 = [
  { dataId: '2', dateTime: '2026-02-04',userId: '张三', status: '2', city: '重庆', startTime: '2026-02-04', endTime: '' },
  { dataId: '3', dateTime: '2026-02-13',userId: '张三', status: '2', city: '重庆', startTime: '2026-02-13', endTime: '' },
]
// 李四：第一天填了开始，后面同状态填了结束时间
const testData03 = [
  { dataId: '4', dateTime: '2026-02-04',userId: '李四', status: '2', city: '重庆', startTime: '2026-02-04', endTime: '' },
  { dataId: '5', dateTime: '2026-02-06',userId: '李四', status: '2', city: '江苏', startTime: '', endTime: '2026-02-06' },
  { dataId: '6', dateTime: '2026-02-10',userId: '李四', status: '2', city: '奉节', startTime: '2026-02-10', endTime: '2026-02-13' },
  { dataId: '7', dateTime: '2026-02-18',userId: '李四', status: '2', city: '云阳', startTime: '2026-02-18', endTime: '2026-02-20' },
]

const testData04 = [
  { dataId: '8', dateTime: '2026-02-06',userId: '杨金星', status: '3', city: '浙江', startTime: '2026-02-06', endTime: '2026-02-11' },
]

// 刘旭斐：仅填了开始时间
const testData05 = [
  { dataId: '9', dateTime: '2026-02-02',userId: '刘旭斐', status: '2', city: '山西', startTime: '2026-02-02', endTime: '' },
]

// 罗辉剑：中途状态变化
const testData06 = [
  { dataId: '10', dateTime: '2026-02-02',userId: '罗辉剑', status: '2', city: '重庆', startTime: '2026-02-02', endTime: '' },
  { dataId: '11', dateTime: '2026-02-05',userId: '罗辉剑', status: '2', city: '四川', startTime: '2026-02-05', endTime: '' },
  { dataId: '12', dateTime: '2026-02-08',userId: '罗辉剑', status: '2', city: '天津', startTime: '2026-02-08', endTime: '' },
  { dataId: '13', dateTime: '2026-02-12',userId: '罗辉剑', status: '3', city: '老家', startTime: '2026-02-12', endTime: '2026-03-01' },
]
const testData08 = [
  { dataId: '14-0', dateTime: '2026-02-01',userId: '蒋重阳', status: '1', city: '居家', startTime: '2026-02-01', endTime: '' },
  { dataId: '14', dateTime: '2026-02-11',userId: '蒋重阳', status: '2', city: '重庆', startTime: '2026-02-11', endTime: '2026-02-15' },
  { dataId: '15', dateTime: '2026-02-20',userId: '蒋重阳', status: '2', city: '四川', startTime: '2026-02-20', endTime: '' },
  { dataId: '15', dateTime: '2026-02-24',userId: '蒋重阳', status: '3', city: '合川', startTime: '2026-02-24', endTime: '2026-02-26' },
]


const state = reactive({
  activeUserList: [] as IPersonDataOutput[],
  hodoData: {
    activeTime: '2026-02-07',
    startTime: '2026-02-02',
    endTime: '2026-03-01',
    holidays: [
      '2026-01-31',
      '2026-02-01',
      '2026-02-07',
      '2026-02-08',
      '2026-02-14',
      '2026-02-15',
      '2026-02-21',
      '2026-02-22',
      '2026-02-28',
      '2026-03-01',
    ],
    data: [
      testData01,
      testData02,
      testData03,
      testData04,
      testData05,
      testData06,
      testData08
    ].flat()
  } as IData
})


function onActiveChange (data: IPersonDataOutput[]) {
  state.activeUserList = data
}

</script>