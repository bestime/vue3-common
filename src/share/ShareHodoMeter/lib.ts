import { arrayGroupColumn, defualtFormatter, uuid } from "@bestime/utils_base"
import dayjs, { Dayjs } from "dayjs"
import { assign, cloneDeep, groupBy, last, uniq } from "lodash-es"

export interface ICalendarItem {
  dateTime: string  
  week: string,
  label: string
  isHoliday:boolean
  userList: IPersonDataOutput[]
}

const STATUS_MAP = {
  '1': '办公',
  '2': '出差',
  '3': '休假',
}

export interface IPersonData {
  id: string,
  dateTime: string,
  userId: string,
  status: keyof typeof STATUS_MAP,
  city: string,
  startTime?: string | undefined,
  endTime?: string | undefined
}

export interface IData {
  startTime: string,
  endTime: string,
  holidays: string[],
  data: IPersonData[],
}


export interface IPersonDataOutput extends IPersonData {
  dateTimeStamp: number
  fmtStatus: string
  startTimeStamp: number
  endTimeStamp: number
  rangeTag?: 'doing' | 'end'
}



const oneDay = 1000 * 60 * 60 * 24

const weekList = [
  { id: '7', label: '周日'},
  { id: '1', label: '周一'},
  { id: '2', label: '周二'},
  { id: '3', label: '周三'},
  { id: '4', label: '周四'},
  { id: '5', label: '周五'},
  { id: '6', label: '周六'},
]

/**
 * 补全一个人每天的数据
 * @param data 
 */
function replenishOnePersonData02 (userId: string, data: IPersonDataOutput[], filterStartTimeStamp: number, filterEndTimeStamp: number) {
  if(data.length === 0) return [];
  
  filterStartTimeStamp = Math.min(filterStartTimeStamp, data[0]!.dateTimeStamp)
  filterEndTimeStamp = Math.max(filterEndTimeStamp, last(data)!.endTimeStamp)
  const result:IPersonDataOutput[] = []
  let deepCity = '重庆'
  let deepStatus: IPersonDataOutput['status'] = '1'
  let deepEndTimeStamp = data[0]!.endTimeStamp
  for(let deepTimeStamp = filterStartTimeStamp; deepTimeStamp<=filterEndTimeStamp; deepTimeStamp+=oneDay) {
    const ext = data.find(c=>c.dateTimeStamp === deepTimeStamp)
    if(ext) {
      deepCity = ext.city
      deepStatus = ext.status
      if(ext.endTimeStamp > 0) {
        deepEndTimeStamp = ext.endTimeStamp
      }          
    }
    

    const t = dayjs(deepTimeStamp)
    result.push({
      id: `${userId}-${deepTimeStamp}`,
      dateTime: t.format('YYYY-MM-DD'),
      dateTimeStamp: t.valueOf(),
      userId: userId,
      city: deepCity,
      status: deepStatus,
      fmtStatus: STATUS_MAP[deepStatus],
      startTime: undefined,
      startTimeStamp: 0,
      endTime: undefined,
      endTimeStamp: 0
    })

    // 如果到了结束时间，就重置为初始状态
    if(deepTimeStamp === deepEndTimeStamp) {
      deepCity = '重庆'
      deepStatus = '1'
      deepEndTimeStamp = 0
      
    }  
  }

  // console.log("处理一个人", data, result)

  return result;

}


function personDataParser (_: IData) {
  // 先把所有包含时间的处理为时间戳，方便后期比较大小
  const filterStartTimeStamp = dayjs(_.startTime).valueOf()
  const filterEndTimeStamp = dayjs(_.endTime).valueOf()
  const data:IPersonDataOutput[] = _.data.map(function (c) {
    const dateTimeStamp = dayjs(c.dateTime).valueOf()
    let startTimeStamp = defualtFormatter(0, c.startTime, function (_) {
      return dayjs(_).valueOf()
    })
    if(startTimeStamp<dateTimeStamp) {
      startTimeStamp = dateTimeStamp
      c.startTime = c.dateTime
    }
    return assign({}, c, {
      dateTimeStamp: dayjs(c.dateTime).valueOf(),
      startTimeStamp: defualtFormatter(0, c.startTime, function (_) {
        return dayjs(_).valueOf()
      }),
      endTimeStamp: defualtFormatter(0, c.endTime, function (_) {
        return dayjs(_).valueOf()
      }),
      fmtStatus: ''
    })
  })
  // 先从小到大排序
  data.sort(function (a,b) {
    return a.dateTimeStamp - b.dateTimeStamp
  })

  // 按人分组
  const group = groupBy(data, 'userId')
  for(let userId in group) {
    // 补全每个人每天的数据
    group[userId] = replenishOnePersonData02(userId, group[userId]!, filterStartTimeStamp, filterEndTimeStamp)
    
  }

  // console.log("处理后的数据", data, group)
  return group
}

export function getCalendarList (data: IData) {
  const t0 = new Date(data.startTime)
  const t1 = new Date(data.endTime)
  const startWeek = t0.getDay()
  const endWeek = t1.getDay()
  let from = dayjs(data.startTime)
  let to = dayjs(data.endTime)

  if(startWeek === 0) {
    from = from.subtract(6, 'day')
  }
  if(endWeek > 0) {
    to = to.add(7-endWeek, 'day') 
  }

  const list: ICalendarItem[] = []
  const userIds = uniq(data.data.map(c=>c.userId))
  const userMap = personDataParser(data)
  for(let index = from.valueOf(); index<=to.valueOf(); index+=oneDay) {
    const t = dayjs(index)
    const week = weekList[t.get('day')]!
    const userList = userIds.map(function (userId) {
      return userMap[userId]?.find(c=>c.dateTime === t.format('YYYY-MM-DD'))
    }).filter(c=>!!c)
    list.push({
      dateTime: t.format('YYYY-MM-DD'),
      label: t.format('MM-DD'),
      week: week.label,
      isHoliday: false,
      userList
    })
  }

  // 移除节假日的数据
  list.forEach(function (item) {
    if(data.holidays.includes(item.dateTime)) {
      item.isHoliday = true
      item.userList.length = 0
    }
  })

  // 按7列转换数据
  const matrix = arrayGroupColumn(list, 7)

  console.log("用户数据", userMap)
  
  console.log("矩阵", list)
  const key = uuid()
  return matrix.map(function (list, index) {
    return {
      id: `${key}-${index}`,
      data: list
    }
  })
}