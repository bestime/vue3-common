import { Geometry, Map, Marker, MultiPolygon, VectorLayer } from "maptalks";
import type { VectorLayerOptionsType } from "maptalks/dist/layer/VectorLayer";
import { shareFetchLocalFile } from "./shareTool";
import { _Array, defualtFormatter, isArray, isEmpty } from "@bestime/utils_base";
import type { HandlerFnResultType } from "maptalks/dist/core/Eventable";
import type { addGeometryFitViewOptions } from "maptalks/dist/layer/OverlayLayer";
import { cloneDeep, debounce, throttle } from "lodash-es";
import type { DebouncedFuncLeading } from "lodash";

/**
 * ZOOM_ID 有则表示可响应缩放
 * ZOOM_VISIBLE 配置文件是否控制显示隐藏，默认true。
 * ZOOM_GROUP 分类ID
 */


interface IShareCfg {
  enableScale?: boolean
  iconSize?: number
  iconHorizontalOffset?: number
  iconVerticalOffset?: number
  fontSize?: number,
  fontHorizontalOffset?: number,
  fontVerticalOffset?: number,
}

export interface ShareMaptalksZoomLayerConfig {
  zoom: number,
  data: Record<string, IShareCfg>
}

function getConfgByIdAndZoom(id: string, zoom: number, list: ShareMaptalksZoomLayerConfig[]){
  for(let a = 0;a<list.length;a++) {
    if(zoom >= list[a]!.zoom && list[a]!.data[id]) {
      return {
        zoom: list[a]!.zoom,
        config: list[a]!.data[id]!
      }
    }
  }
}

function hasMoreConfig (id: string, list: ShareMaptalksZoomLayerConfig[]) {
  return list.some(function (c) {
    return !isEmpty(c.data[id])
  })
}

/**
 * 先隐藏所有带缩放标识的，不然页面会闪一下
 * @param data 
 */
function hideAllGeometries (data: Geometry | Array<Geometry>) {
  if(isArray(data)) {
    data.forEach(function(item) {
      if(!isEmpty(item.properties.ZOOM_ID)) {
        item.hide()
      }      
    })
  } else {
    if(!isEmpty(data.properties.ZOOM_ID)) {
      data.hide()
    }
  }
}
function updateTextSymbol (style: Record<string, any>, more: IShareCfg, ratio: number) {
  style.textSize = defualtFormatter(undefined, more.fontSize, function (_) {
    return _ * ratio
  })
  style.textDx = defualtFormatter(undefined, more.fontHorizontalOffset, function (_) {
    return _ * ratio
  })
  style.textDy = defualtFormatter(undefined, more.fontVerticalOffset, function (_) {
    return _ * ratio
  })
}
function updateIcomSymbol (style: Record<string, any>, more: IShareCfg, ratio: number) {  
  style.markerWidth = defualtFormatter(undefined, more.iconSize, function (_) {
    return _ * ratio
  })
  style.markerHeight = defualtFormatter(undefined, more.iconSize, function (_) {
    return _ * ratio
  })
  style.markerDx = defualtFormatter(undefined, more.iconHorizontalOffset, function (_) {
    return _ * ratio
  })
  style.markerDy = defualtFormatter(undefined, more.iconVerticalOffset, function (_) {
    return _ * ratio
  })
}

export default class ShareMaptalksZoomLayer extends VectorLayer{
  _zoomList: ShareMaptalksZoomLayerConfig[] = []
  _doOnceZooming: DebouncedFuncLeading<any>
  _zoomGroupIds: string[] = []
  constructor (id: string, options?: VectorLayerOptionsType) {
    super(id, options)    
    this.onZooming = this.onZooming.bind(this)
    this._doOnceZooming = debounce(() => {
      const toZoom = this.map?.getZoom()
      if(!toZoom) return;
      this.onZooming({
        to: this.map.getZoom()
      })
    }, 300)
  }

  

  remove() {
    super.remove()
    this._doOnceZooming.cancel()
    this.map?.off('zoomend', this.onZooming)
    return this;
  }

  addTo(map: Map) {
    super.addTo(map)
    map.on('zoomend', this.onZooming)
    this._doOnceZooming()
    return this;
  }



  addGeometry(geometries: Geometry | Array<Geometry>, fitView?: boolean | addGeometryFitViewOptions) {
    hideAllGeometries(geometries)
    
    super.addGeometry(geometries, fitView)
    this._doOnceZooming()
    return this;
  }


  setConfig (data: ShareMaptalksZoomLayerConfig[]) {
    data.sort(function (a, b) {
      return b.zoom - a.zoom
    })
    console.log("配置", data)
    this._zoomList = data
    this._doOnceZooming()
  }
  
  setZoomFilter (ids: string[]) {
    this._zoomGroupIds = cloneDeep(ids)
    this._doOnceZooming()
  }
  

  onZooming (ev: any) {
    const toZoom = ev.to
    
    this.forEach(oGeo => {
      if(isEmpty(oGeo.properties.ZOOM_ID)) {
        return;
      }

      // 处理分组是否显示，如果显示，再处理后续缩放逻辑
      const gid: string = oGeo.properties.ZOOM_GROUP
      if(!isEmpty(gid)) {
        if(this._zoomGroupIds.includes(gid)) {
          oGeo.show()
        } else {
          oGeo.hide()
          return;
        }
      }
      
      const zoomVisible = oGeo.properties.ZOOM_VISIBLE !== false
      const currentCfg = getConfgByIdAndZoom(oGeo.properties.ZOOM_ID, toZoom, this._zoomList)
      const hasCfg = hasMoreConfig(oGeo.properties.ZOOM_ID, this._zoomList)
      
      if(!currentCfg) {        
        if(zoomVisible && hasCfg) {
          oGeo.hide()
        }
        return;
      }
      // todo：缩放根据比例变大，待开发
      let sizePercent = 1
      if(currentCfg.config.enableScale) {
        sizePercent = 1 + (toZoom - currentCfg.zoom) / currentCfg.zoom
      }
      
      const oldSymbol = oGeo.getSymbol()
      
      if(isArray(oldSymbol)) {
        oldSymbol.forEach(function (sb) {
          if(sb.textName) {
            updateTextSymbol(sb, currentCfg.config, sizePercent)
          }
          if(sb.markerFile) {
            updateIcomSymbol(sb, currentCfg.config, sizePercent)
          }
        })
      } else {
        if(oldSymbol.textName) {
          updateTextSymbol(oldSymbol, currentCfg.config, sizePercent)
        } else if(oldSymbol.markerFile) {
          updateIcomSymbol(oldSymbol, currentCfg.config, sizePercent)
        }
      }
      oGeo.updateSymbol(oldSymbol)
      zoomVisible && oGeo.show()
    })    
  }
}