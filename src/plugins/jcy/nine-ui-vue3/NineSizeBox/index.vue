<style lang="scss">
$transition:0.3s ease-out;

.nine_size_box_root {
  
  position:relative;
  &[show-control=true] {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      border: #117bff solid 3px;
      z-index:4;
      pointer-events: none;
      transition: $transition;
      opacity: 0;
    } 
    &:hover {
      &::before {
        opacity: 1;
      }
      .nine_size_box_control {
        transform: scale(1);
        opacity: 1;
        visibility: visible;
      }
    }
  } 
  
}

.nine_size_box_container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.nine_size_box_control {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  background-color: #117bff;
  transition: $transition;
  color: #fff;
  padding: 0;
  margin: 0;
  border: none;
  list-style: none;
  padding: 0 0;
  transform: scale(0);
  
  transform-origin: left top;
  opacity: 0;
  visibility: hidden;
  li {
    font-size: 14px;
    padding: 4px 10px;
    user-select: none;
    cursor: pointer;
    margin: 0;
    line-height: normal;
    color:#bbd9ff;
    &:hover {
      background-color: #4da2fd;
    }
    &.secected{
      background-color: #4da2fd;
      color: white;
    }
  }
}
.nine_size_box_root, .nine_size_box_body {
  box-sizing: border-box;
  border: none;
  padding: 0;
  margin: 0;
  line-height: normal;
}

.nine_size_box_body {
  position: relative;
  transform-origin: left top;
  transition: 0.2s;
  position:relative;
}

.nine_size_box_computed_size {
  overflow: hidden;
}

</style>

<template>
  <div class="nine_size_box_root scroll_bar_container" ref="dom-ref" :mode="mode" :show-control="props.control">
    <ul class="nine_size_box_control">
      <li v-for="item in modeList" :class="{'secected': item.key === mode}" :key="item.key" @click="mode=item.key">{{ item.label }}</li>
    </ul>
    <div class="nine_size_box_container scroll_bar_wrap" ref="nsbContainer">
      <div class="nine_size_box_computed_size scroll_bar_view" :style="state.cmpStyle">
        <div class="nine_size_box_body" :style="state.scaleStyle" v-if="state.scaleStyle">
          <slot class="slot-wrpper"/>
        </div>
      </div>
    </div>
    <div tip="这个用来计算滚动条宽高的，不用显示出来" style="width: 200px;height: 200px;overflow: scroll;visibility: hidden;" ref="scroll-size">
      <div style="height: 250px;"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getRelativePos, observeDomResize, setStorage } from '@bestime/utils_browser'
import { throttle } from '@bestime/utils_base'
import { nextTick, onMounted, onUnmounted, reactive, useTemplateRef, watch } from 'vue'
import ScrollBar from '@bestime/scroll-bar'
import "@bestime/scroll-bar/dist/index.min.css"



interface IProps {
  control?: boolean
  uiWidth?: number
  uiHeight?: number
  interval?: number
}

export type TModeKey = 'initial' | 'scale-stretch' | 'scale-aspect' | 'scale-aspect-scroll'

const modeList: {key: TModeKey, label: string}[] = [
  {
    key: 'initial',
    label: '原始尺寸'
  },
  {
    key: 'scale-stretch',
    label: '缩放-拉伸'
  },
  {
    key: 'scale-aspect',
    label: '缩放-等比'
  },
  {
    key: 'scale-aspect-scroll',
    label: '缩放-等比滚动'
  },
]


const mode = defineModel<TModeKey>('mode', {
  default: 'scale-stretch'
})
const props = withDefaults(defineProps<IProps>(), {
  control: true,
  uiWidth: 1920,
  uiHeight: 1080,
  interval: 200,
})

const emit = defineEmits<{
  (name: 'on-scale', query: {
    x: number,
    y: number
  }): void
}>()

const rootDom = useTemplateRef('dom-ref')
const oSizeContainer = useTemplateRef('nsbContainer')
const oScrollSize = useTemplateRef('scroll-size')




const state = reactive({
  scaleStyle: void 0 as undefined | Record<string, any>,
  cmpStyle: void 0 as undefined | Record<string, any>,
})
let setScale: ReturnType<typeof throttle> | undefined
let _obse: ReturnType<typeof observeDomResize> | undefined



let iScroll:ScrollBar | undefined = undefined

onMounted(function () {
  setScale?.cancel()
  
  setScale = throttle(function () {
    const parentSize = getRelativePos(rootDom.value!)
    let ratioX = parentSize.width / props.uiWidth
    let ratioY = parentSize.height / props.uiHeight
    

    if(mode.value === 'initial') {
      ratioX = 1
      ratioY = 1
    } else if(mode.value === 'scale-aspect') {
      const minScale = Math.min(ratioX, ratioY)
      ratioX = minScale
      ratioY = minScale
    } else if (mode.value === 'scale-aspect-scroll') {
      // const maxScale = getRatioWidthScrollBar(parentSize.width, parentSize.height)
      const maxScale = Math.max(ratioX, ratioY)
      ratioX = maxScale
      ratioY = maxScale
      
    }
    
    
    const cmpWidth = Math.ceil(props.uiWidth * ratioX)
    const cmpHeight = Math.ceil(props.uiHeight * ratioY)
    const targetStyle: Record<string, any> = {
      width: props.uiWidth + 'px',
      height: props.uiHeight + 'px',
      transform: `scale(${ratioX},${ratioY})`
    }      

    if(mode.value === 'initial') {
      delete targetStyle.transform
    }
    state.scaleStyle = targetStyle
    state.cmpStyle = {
      width: cmpWidth + 'px',
      height: cmpHeight + 'px',
    }
    const etData = {
      x: ratioX,
      y: ratioY
    }
    emit('on-scale', etData)
    setStorage('nine-size-scale',etData)
    
    oSizeContainer.value!.scrollTop = 0
    oSizeContainer.value!.scrollLeft = 0
    nextTick(function () {
      if(!iScroll) {
        iScroll = new ScrollBar({
          el: rootDom.value!,
          fade: false
        })
      }
      iScroll?.refresh()
    })
  }, props.interval)

  _obse = observeDomResize(rootDom.value!, () => {
    setScale?.()
  }, ['width', 'height'], props.interval)
})

watch(() => mode.value, function () {
  setScale?.()
})

onUnmounted(function () {
  iScroll?.dispose()
  setScale?.dispose()
  _obse?.()
})
</script>
