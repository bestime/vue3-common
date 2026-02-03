<style lang="scss" scoped>
.MapScalePointLineConfig {
  box-sizing: border-box;
  display: flex;
  position: relative;
  .map-container {
    flex: 1;
    width: 0;
    background-color: #031845;
  }
  .edit-box {
    width: 400px;
    background-color: #f5f5f5;
    overflow: auto;
    overflow-x: hidden;
    
  }
}

.tl-top {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.info-box {
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    padding: 10px;
  }
}
.msg-tip {
  font-size: 12px;
  color: red;
  padding: 10px;
}
</style>

<template>
  <div class="MapScalePointLineConfig">
    <div class="map-container" ref="ref-map"></div>
    <ShareMaptalksLegend :data="state.legendList" v-model="state.selectedLegendIds" @on-select="onSelectLeggnds"/>
    <div class="edit-box">
      <div class="msg-tip">注：清空一个属性或删除一个配置后，需即使保存配置并重新刷新页面，因为空值不会修改页面已生效的属性！！！</div>
      <div class="tl-top">        
        <button @click="enabledEdit">开启编辑</button>
        <button @click="toPreview">预览</button>
        <button @click="saveConfig">预览并导出配置</button>
      </div>
      
      <ul class="info-box">
        
        <li>
          <b>地图配置：</b>
          <el-select v-model="state.mapId" @change="onMapSelected">
            <el-option v-for="item in state.mapList" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </li>
        <li>
          <b>缩放（{{ state.mapCurrentZoom }}）：</b>
          <input v-model="state.formData.zoom"/>
        </li>
        <li>
          <b>id：</b>
          <span>{{ state.formData.id }}</span>
        </li>
        <li>
          <b>标题：</b>
          <span>{{ state.formData.title }}</span>
        </li>
        <li>
          <b>开启等比缩放：</b>
          <el-switch v-model="state.formData.enableScale"></el-switch>
        </li>
        <li>
          <b>图标尺寸：</b>
          <input v-model="state.formData.iconSize"/>
        </li>
        <li>
          <b>图标水平偏移：</b>
          <input v-model="state.formData.iconHorizontalOffset"/>
        </li>
        <li>
          <b>图标垂直偏移：</b>
          <input v-model="state.formData.iconVerticalOffset"/>
        </li>
        <li>
          <b>文字大小：</b>
          <input v-model="state.formData.fontSize"/>
        </li>
        <li>
          <b>文字水平偏移：</b>
          <input v-model="state.formData.fontHorizontalOffset"/>
        </li>
        <li>
          <b>文字垂直偏移：</b>
          <input v-model="state.formData.fontVerticalOffset"/>
        </li>
      </ul>
      <ConfigList :data="state.historyConfig" @on-edit="onEditHis" @on-delete="onDeleteHis"/>
    </div>
  </div>  
</template>

<script lang="ts" setup>
import { reactive, onBeforeUnmount, useTemplateRef, onMounted } from 'vue'
import ShareMaptalksChinaLayer from '@/share/ShareMaptalksChinaLayer'
import { Map, Marker, MultiPolygon, TileLayer, VectorLayer } from 'maptalks'
import { requestLocalFile, serverURL } from '@/request'
import ShareMaptalksLegend,  {type ILegendItem } from '@/share/ShareMaptalksLegend.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ConfigList from './ConfigList.vue'
import type { ShareMaptalksZoomLayerConfig } from '@/share/ShareMaptalksZoomLayer'
import { assign, cloneDeep, uniq } from 'lodash-es'

let iMap: Map | undefined
const oMap = useTemplateRef('ref-map')
let currentConfig: ShareMaptalksZoomLayerConfig[] =[];



/**
 * zIndex 1 最底层背景
 * zIndex 2 最底层文字
 * zIndex 3 高亮层背景
 * zIndex 4 高亮层文字
 * 
*/

const legendListNmgLng:ILegendItem[] = [
  { id: '2', label: '管道气工厂', icon: serverURL('@local', '/static/images/gdq-1.png') },
  { id: '3', label: '煤制气工厂', icon: serverURL('@local', '/static/images/mcq-1.png') },
  { id: '4', label: '终端', icon: serverURL('@local', '/static/images/mcq-3.png') },
]

const legendListNmgGuanWang:ILegendItem[] = [
  { id: '阀室', label: '阀室', icon: serverURL('@local', '/static/images/gdq-1.png') },
  { id: '分输站', label: '分输站', icon: serverURL('@local', '/static/images/mcq-3.png') },
  { id: '压气站', label: '压气站', icon: serverURL('@local', '/static/images/mcq-1.png') },
  { id: '天然气末站', label: '天然气末站', icon: serverURL('@local', '/static/images/gdq-3.png') },
  { id: '天然气首站', label: '天然气首站', icon: serverURL('@local', '/static/images/gdq-4.png') },
  { id: '分输清管站', label: '分输清管站', icon: serverURL('@local', '/static/images/gdq-5.png') },
]

const state = reactive({
  legendList: [] as ILegendItem[],
  mapId: '',
  selectedLegendIds: legendListNmgLng.map(c=>c.id),
  mapCurrentZoom: '5',
  historyConfig: [] as any[],
  mapList: [
    { id: '1', label: '内蒙古LNG', legend: legendListNmgLng, fileName: '01.json' },
    { id: '2', label: '内蒙古管网', legend: legendListNmgGuanWang, fileName: '02.json' },
  ],
  formData: {
    zoom: '5',
    id: '',
    title: '',
    enableScale: false,    
    iconSize: '',    
    iconHorizontalOffset: '',
    iconVerticalOffset: '',
    fontSize: '',
    fontHorizontalOffset: '',
    fontVerticalOffset: '',
  }
})

const chinaLayerBackground = new ShareMaptalksChinaLayer('地带点', {
  enableMakerOffsetEdit: true,
  provinceCode: 150000,
  geoBase: serverURL('@local', '/static/json/geo'),
  outerStyle: {
    borderColor: '#263d6e',
    borderWidth: 2
  },
  defaultStyle: {
    backgroundColor: '#082258',
    borderColor: '#061a43',
    fontColor: '#395ca5',
    borderWidth: 1
  },
  provinceConfig: {
    canSelect: false,
    backgroundColor: '#06419b',
    borderColor: '#061940',
    fontColor: '#eee',
    borderWidth: 1,
    hoverBackgroundColor: '#0e4daa',
    activeBackgroundColor: '#0956d6',
    onMounseMove: function (ev) {},
    onMounseOut: function (ev) {},
    onSelect: function (adcode?: number) {
      console.log("省份城市选中", adcode)
    }
  },
  activeStyle: {
    backgroundColor: '#06419b',
    borderColor: '#0163f9',
    fontColor: 'white',
    borderWidth: 3
  },
  fitViews: [
    // { adcode: 150700, zoom: 6, center: [109.715607671875, 35.7564384926223] }
  ]
})

function onMapSelected () {
  const item = state.mapList.find(c=>c.id === state.mapId)!
  state.legendList = item.legend
  if(state.mapId === '1') {
    state.selectedLegendIds = legendListNmgLng.map(c=>c.id)
    loadConfig('nmg-config-lng.json')
  } else if(state.mapId === '2') {
    state.selectedLegendIds = legendListNmgGuanWang.map(c=>c.id)
    loadConfig('nmg-config-guanwang.json')
  }  
  redrawByData(item.fileName)
}

async function redrawByData (fileName: string) {
  const res = await requestLocalFile<any[]>('/static/json/' + fileName)
  

  const defaultStyle: any = {
    zoom: 5.9,
    data: {}
  }

  res.data.forEach(function (item) {
    defaultStyle.data[item.id] = {
      "fontSize": 0,
      "iconSize": 18,
      "enableScale": true
    }
  })

  console.log("伪造初始数据", JSON.stringify([defaultStyle]))
  
  const markerList = res.data.map(function (item) {
    
    const icon = state.legendList.find(c=>c.id === jUtilsBase.trim(item.type))!.icon
    // console.log("icon", icon)
    return new Marker(item.center, {
      zIndex: 20,
      properties: {
        ZOOM_ID: item.id,
        ZOOM_TITLE: item.name,
        ZOOM_GROUP: jUtilsBase.trim(item.type)
      },
      'symbol' : [
        {
          markerFile: icon,
          markerWidth: 22,
          markerHeight: 22,
          'markerDx'     : 0,
          'markerDy'     : 0,
          markerHorizontalAlignment: 'middle',
          markerVerticalAlignment: 'middle',
          'markerOpacity': 1
        },
        {          
          textFaceName: 'AlibabaPuHuiTi-3-55-Regular',
          textName: jUtilsBase.trim(item.name),
          textFill: 'yellow',
          textHaloFill: 'yellow',
          textHaloRadius: 0,
          textHorizontalAlignment: 'middle',
          textVerticalAlignment: 'middle',
          textAlign: 'center' as any,
          textSize: 12,
        }
      ]
    })
  })
  chinaLayerBackground.addGeometry(markerList)
  chinaLayerBackground.setZoomFilter(state.selectedLegendIds)
}

function onSelectLeggnds () {
  chinaLayerBackground.setZoomFilter(state.selectedLegendIds)
}

function onEditHis (zoom: number) {
  backFillEdit(state.formData.id, zoom.toString())
}

function onDeleteHis (v: number) {
  const cfg = currentConfig.find(c=>c.zoom === v)?.data
  console.log("删除前", state.formData.id,cloneDeep(cfg))
  delete cfg?.[state.formData.id]
  console.log("删除后", cloneDeep(cfg), currentConfig)
  backFillEdit(state.formData.id, v.toString())
  saveConfig()
}



function backFillEdit (id: string, scale?: string) {
  if(!jUtilsBase.isNull(scale)) {
    state.formData.zoom = scale
  }
  const old = currentConfig.find(c=>c.zoom === +state.formData.zoom)?.data?.[id]
  // console.log("旧的", old)
  state.formData.enableScale = old?.enableScale === true
  state.formData.iconSize = jUtilsBase.defualtFormatter('', old?.iconSize, function (_) {
    return jUtilsBase.trim(_)
  })
  state.formData.iconHorizontalOffset = jUtilsBase.defualtFormatter('', old?.iconHorizontalOffset, function (_) {
    return jUtilsBase.trim(_)
  })
  state.formData.iconVerticalOffset = jUtilsBase.defualtFormatter('', old?.iconVerticalOffset, function (_) {
    return jUtilsBase.trim(_)
  })
  state.formData.fontSize = jUtilsBase.defualtFormatter('', old?.fontSize, function (_) {
    return jUtilsBase.trim(_)
  })
  state.formData.fontHorizontalOffset = jUtilsBase.defualtFormatter('', old?.fontHorizontalOffset, function (_) {
    return jUtilsBase.trim(_)
  })
  state.formData.fontVerticalOffset = jUtilsBase.defualtFormatter('', old?.fontVerticalOffset, function (_) {
    return jUtilsBase.trim(_)
  })

  const itemZooms: any[] = []
  currentConfig.forEach(function (c) {
    if(c.data[id]) {
      itemZooms.push({
        zoom: c.zoom,
        data: c.data[id]
      })
    }
  })
  state.historyConfig = itemZooms
}

function enabledEdit () {
  chinaLayerBackground.forEach(function (item) {
    if(!jUtilsBase.isEmpty(item.properties.ZOOM_ID)) {      
      item.on('click', function (ev: any) {
        const info = ev.target.properties
        state.formData.id = info.ZOOM_ID
        state.formData.title = info.ZOOM_TITLE
        backFillEdit(info.ZOOM_ID, state.formData.zoom)
      })
    }
  })
}

async function loadConfig (fileName: string) {
  const [resChina, resLng] = await Promise.all([
    requestLocalFile('/static/json/nmg-config-china.json'),
    requestLocalFile(`/static/json/${fileName}`),
  ])
  currentConfig = assign([],jUtilsBase._Array(resChina.data), jUtilsBase._Array(resLng.data))
  console.log("哈哈哈", currentConfig)
  // currentConfig=[]
  chinaLayerBackground.setConfig(currentConfig)
}


function toPreview () {
  
  const fid = state.formData.id
  const toZoom = jUtilsBase._Number(state.formData.zoom)
  let zoomItem = currentConfig.find(c=>c.zoom === toZoom)
  const useZoomItem = zoomItem || {
    zoom: toZoom,
    data: {}
  }
  useZoomItem.data[fid] = jUtilsBase._KvPair(useZoomItem.data[fid])
  if(!zoomItem) {
    currentConfig.push(useZoomItem)
  }
  const pointItem = useZoomItem.data[fid]
  pointItem.enableScale = state.formData.enableScale === true ? true : undefined
  pointItem.iconSize = jUtilsBase.defualtFormatter(undefined, state.formData.iconSize, function (_) {
    return jUtilsBase._Number(_)
  })
  pointItem.iconHorizontalOffset = jUtilsBase.defualtFormatter(undefined, state.formData.iconHorizontalOffset, function (_) {
    return jUtilsBase._Number(_)
  })
  pointItem.iconVerticalOffset = jUtilsBase.defualtFormatter(undefined, state.formData.iconVerticalOffset, function (_) {
    return jUtilsBase._Number(_)
  })
  pointItem.fontSize = jUtilsBase.defualtFormatter(undefined, state.formData.fontSize, function (_) {
    return jUtilsBase._Number(_)
  })
  pointItem.fontHorizontalOffset = jUtilsBase.defualtFormatter(undefined, state.formData.fontHorizontalOffset, function (_) {
    return jUtilsBase._Number(_)
  })
  pointItem.fontVerticalOffset = jUtilsBase.defualtFormatter(undefined, state.formData.fontVerticalOffset, function (_) {
    return jUtilsBase._Number(_)
  })

  for(let index = 0; index<currentConfig.length; index++) {
    currentConfig[index] = jUtilsBase.shake(currentConfig[index]!) as any
    if(jUtilsBase.isEmpty(currentConfig[index]!.data)) {
      currentConfig.splice(index--, 1)
    }
  }

  chinaLayerBackground.setConfig(currentConfig)
  
  backFillEdit(state.formData.id)
}

function countIds () {
  let ids: string[] = []
  currentConfig.forEach(function (gp) {
    jUtilsBase.forEachKvPair(gp.data, function (item, id) {
      if(/^NMG-LNG-GD/.test(id) || /^NMG-LNG-ZD/.test(id))
      ids.push(id)
    })
  })
  return uniq(ids).length
}

function saveConfig () { 
  toPreview()
  const saveText = JSON.stringify(currentConfig)

  
  const cfgNum = countIds()
  ElMessageBox.confirm(saveText, `请保存此配置：${cfgNum}个`, {
    confirmButtonText: '复制并关闭'
  }).then(function () {
    jUtilsBrowser.copyText(saveText)
    ElMessage({
      message: '复制成功',
      type: 'success',
      plain: true,
    })
  })
}


onMounted(function () {
  iMap = new Map(oMap.value!, {
    center:[111.956818609375, 45.94437622504634],
    zoom: +state.formData.zoom,
    minZoom: 5.9,
    maxZoom: 12,
    draggable:true,
    control: false,
    panAnimation: false,
    doubleClickZoom: false,
    attribution: false,
    overviewControl : false,
  })

  chinaLayerBackground.addTo(iMap)


  iMap.on('click', function (ev: any) {
    console.log("点击地图", `${ev.coordinate.x}, ${ev.coordinate.y}`)
  })

  iMap.on('zoomend', function (ev: any) {
    state.formData.zoom = jUtilsBase.floorFixed(ev.to,1)    
    backFillEdit(state.formData.id)
    state.mapCurrentZoom = state.formData.zoom
    console.log("+++++++++++")
  })

  

})


</script>