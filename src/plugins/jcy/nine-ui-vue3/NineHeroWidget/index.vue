<style lang="scss">
$transition: 500ms cubic-bezier(1.000, 0.035, 0.275, 0.950);
.nine_herowidget_wrapper {
  .clone_dom {
    margin: 0;
    border: none;
    display: none;
    box-sizing: border-box;
    visibility: hidden;
  }
}
.nine_herowidget_main {
  position:relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  font-size: 0;
  height: 100%;
}

.nine_herowidget_big {
  font-size: 0;
  position: fixed;
  left: 0;
  top: 0;
  visibility: hidden;
  overflow: hidden;
  z-index: 99999;
  
  &.is-active {
    visibility: visible;
    .nine_herowidget_mask, .nine_herowidget_size {
      visibility: visible;
      opacity: 1;
    }
  }
}
.nine_herowidget_mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  visibility: hidden;
  opacity: 0;
  transition: $transition;
}
.nine_herowidget_size {
  position: absolute;
  transition: $transition;
  overflow: hidden;
  box-sizing: border-box;
  z-index: 2;
  transform-origin: center center;
  box-shadow:0 0 40px rgba(0,0,0,0.5);
  font-size: 0;
  line-height: normal;
  visibility: hidden;
}
.nine_herowidget_sort {
  display: none;
}
</style>

<template>
  <div class="nine_herowidget_wrapper" :class="{'is-active': state.opening}" ref="rootRef">
    <div class="nine_herowidget_main" ref="mainDom">
      <slot/>
    </div>
    <div ref="sortDom" class="nine_herowidget_sort"></div>
    <div class="nine_herowidget_big" ref="bigDom" :class="{'is-active': state.opening}">
      <div class="nine_herowidget_mask" @click="toClose"></div>
      <div class="nine_herowidget_size" :class="props.popperClass" ref="sizeDom" :style="state.sizeStyle" ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { cloneEasy, toCamelCase } from '@bestime/utils_base'
import { getRelativePos, observeDomResize, removeElement } from '@bestime/utils_browser'
import { reactive, onBeforeUnmount, onMounted, useAttrs, useTemplateRef, nextTick, watch, getCurrentInstance } from 'vue'
const ints = getCurrentInstance()

interface IProps {
  maskClickClose?: boolean,
  moveElementToPopper?: boolean,
  popperClass?: string
  scale?: number
}

const isVisible = defineModel<boolean>('visible')


const props = withDefaults(defineProps<IProps>(), {
  maskClickClose: true,
  scale: 1
})


const oBigDom = useTemplateRef('bigDom')
const oSizeDom = useTemplateRef('sizeDom')
const oMainDom = useTemplateRef('mainDom')
const oRoot = useTemplateRef('rootRef')
const oSortDom = useTemplateRef('sortDom')
let _timer_01: any = 0
let _startPos = undefined as undefined | ReturnType<typeof getRelativePos>
let _prefCopy = undefined as undefined | HTMLDivElement
let _prefMainDom = undefined as undefined | HTMLDivElement

const emits = defineEmits<{
  (name: 'on-get-target-dom', callback: (oParent: HTMLElement) => void): void,
  (name: 'on-get-ratio', callback: (x: number, y: number) => void): void
  (name: 'on-close'): void
}>()


let _obs01: ReturnType<typeof observeDomResize> | undefined

const state = reactive({
  exist: false,
  opening: false,
  sizeStyle: {} as Record<string, string>
})


function hasEmits (name: string) {
  name = 'on-' + name
  return !!ints?.vnode?.props?.[toCamelCase(name)]
}

function toClose () {
  clearTimeout(_timer_01)
  state.opening = false
  if(_startPos) {
    state.sizeStyle['transform'] = 'scale(1) translate3d(0, 0, 0)'
    // this.sizeStyle['left'] = this._startPos.x + 'px'
    // this.sizeStyle['top'] = this._startPos.y + 'px'
  }
  
  _timer_01 = setTimeout(() => {
    if(isVisible.value) {
      isVisible.value = false
      emits('on-close')
    }
    
    state.exist = false
    oBigDom.value!.style['width'] = '0px'
    oBigDom.value!.style['height'] ='0px'
    oBigDom.value!.style['left'] ='0px'
    oBigDom.value!.style['top'] ='0px'
    if(_startPos && _prefMainDom) {
      oRoot.value!.insertBefore(_prefMainDom, oSortDom.value!);
      removeElement(_prefCopy!)
    }        
  }, 520)
}

function getParentContainer (callback: (el?: HTMLElement) => void) {
  if(hasEmits('on-get-target-dom')) {      
    emits('on-get-target-dom', callback)
  } else {
    callback()
  }
}

async function getScaleRatio (): Promise<{
  x: number,
  y: number
}> {
  return new Promise(resolve => {
    if(hasEmits('on-get-ratio')) {      
      emits('on-get-ratio', function (x, y) {
        resolve({
          x,
          y
        })
      })
    } else {
      resolve({
        x: 1,
        y: 1
      })
    }
  })
  
}

async function toShow () {
  if(state.exist) return;
  _obs01?.()
  clearTimeout(_timer_01)
  state.exist = true
  await moveEle()
  await nextTick()

  
  const oSize = oSizeDom.value!
  const oMain = oMainDom.value!
  const oCopy = oMain.cloneNode(true) as HTMLDivElement
  canvasToImage(oMain, oCopy)        
  oCopy.classList.add('clone_dom')
  const ratio = await getScaleRatio()
  
  const pos = getRelativePos(oMain)
  
  oCopy.style.width = pos.width + 'px'
  oCopy.style.height = pos.height + 'px'
  oRoot.value!.insertBefore(oCopy, oSortDom.value!);
  pos.x /= ratio.x
  pos.y /= ratio.y
  _startPos = cloneEasy(pos)
  _prefCopy = oCopy
  _prefMainDom = oMain
  
  state.sizeStyle = {
    width: pos.width + 'px',
    height: pos.height + 'px',
    left: pos.x+ 'px',
    top: pos.y + 'px',
    transform: ''
  }
  
  oRoot.value!.insertBefore(oCopy, oSortDom.value!);
  
  const resizeHandler = (parent: HTMLElement) => {
    const pSize = getRelativePos(parent)
    const x = (pSize.width-pos.width) / 2
    const y = (pSize.height-pos.height) / 2

    if(oBigDom.value) {
      oBigDom.value.style['width'] = pSize.width + 'px'
      oBigDom.value.style['height'] = pSize.height + 'px'
    }          
    
    // 弃用，改用transform
    // this.sizeStyle['left'] = x + 'px'
    // this.sizeStyle['top'] = y + 'px'          

    const maxScaleX = pSize.width/pos.width * 0.95
    const maxScaleY = pSize.height/pos.height* 0.95
    let realScale = Math.min(maxScaleX, maxScaleY, props.scale)
    

    // let trnX = x - pos.x
    // let trnY = y - pos.y
    // console.log("位置", pos.x, pos.y)

    // trnX -= (realScale*trnX-trnX)/2
    // trnY -= (realScale*trnY-trnY)/2

    let trnX = (pos.width * realScale - pos.width) / 2 - pos.x + (pSize.width - pos.width*realScale)/2
    let trnY = (pos.height * realScale - pos.height) / 2 - pos.y + (pSize.height - pos.height*realScale)/2

    // console.log("realScale", realScale, pos.width, pos.width*realScale)
    
    
    state.sizeStyle['transform'] = `translate3d(${trnX}px, ${trnY}px, 0) scale(${realScale})` 
    // this.sizeStyle['transform'] = `scale(${realScale})` 
    // console.log("resize", this.sizeStyle)
    
  }

  _timer_01 = setTimeout(() => {
    oCopy.style.visibility = 'visible'
    oCopy.style.display = 'block'
    oSize.appendChild(oMain)  
    state.opening = true
    getParentContainer(parent => {
      if(parent) {
        resizeHandler(parent)
        _obs01 = observeDomResize(parent, resizeHandler)
      }
    })          
  }, 16)    
}

function canvasToImage(originDom: HTMLElement, copyDom: HTMLElement) {
  const ogCanvasList = originDom.getElementsByTagName('canvas')
  const cyCanvasList = copyDom.getElementsByTagName('canvas')
  const ctxImages = []
  for(let a = 0; a<ogCanvasList.length;a++) {
    const item = ogCanvasList[a]!
    item.setAttribute('hero-canvas', `${a}`)
    ctxImages[a] = item
  }

  for(let a = 0; a<cyCanvasList.length;a++) {
    const item = cyCanvasList[a]!
    const ctx = item.getContext('2d')!
    ctx.drawImage(ogCanvasList[a]!, 0, 0)
  }
}

async function moveEle () {
  return new Promise(function (resolve) {
    getParentContainer((parent) => {
      if(parent && props.moveElementToPopper) {
        parent.appendChild(oBigDom.value!)
        resolve(undefined)
      } else {
        resolve(undefined)
      }
    })
  })
}

onMounted(function () {
  
})

onBeforeUnmount(function () {
  _obs01?.()
  clearTimeout(_timer_01)
  removeElement(oBigDom.value!)
})


watch(() => isVisible.value, function (v) {
  nextTick(function () {
    if(v) {
      toShow()
    } else {
      toClose()
    }
  })
})
</script>