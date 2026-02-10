import { Coordinate, Map, Marker, MultiPolygon, VectorLayer } from "maptalks";
import type { VectorLayerOptionsType } from "maptalks/dist/layer/VectorLayer";
import { shareFetchLocalFile } from "./shareTool";
import { _Array, Animate, isNull } from "@bestime/utils_base";
import type { HandlerFnResultType } from "maptalks/dist/core/Eventable";
import ShareMaptalksZoomLayer from "./ShareMaptalksZoomLayer";

const CITY_DETAIL_ZOOM = 6.9

interface IShareMaptalksChinaBackgroundConfig {
  enableMakerOffsetEdit: boolean
  geoBase: string
  provinceCode: number
  outerStyle: {
    borderColor: string,
    borderWidth: number
  },
  defaultStyle: {
    backgroundColor: string,
    borderColor: string
    fontColor: string
    borderWidth: number
  }
  provinceConfig: {
    canSelect: boolean
    backgroundColor: string,
    borderColor: string
    fontColor: string
    borderWidth: number
    hoverBackgroundColor: string
    activeBackgroundColor: string
    onMouseMove: (ev:any) => void
    onMouseOut: (ev:any) => void
    onSelect: (adcode?: number) => void    
  }
  activeStyle: {
    backgroundColor: string,
    borderColor: string
    fontColor: string
    borderWidth: number
  }
  fitViews: {
    adcode: number,
    zoom: number,
    center: [number, number]
  }[]
}

export default class ShareMaptalksChinaBackground extends ShareMaptalksZoomLayer{
  _cfg: IShareMaptalksChinaBackgroundConfig
  _flyAnma: Animate<any> | undefined
  _restoreZoom = 0
  _restoreCenter?: [number, number] = [0, 0]
  constructor (id: string, config: IShareMaptalksChinaBackgroundConfig,options?: VectorLayerOptionsType) {
    super(id, options)
    this._cfg = config
    this.drawChina()
  }

  addTo(map: Map) {
    const center = map.getCenter()
    this._restoreCenter = [center.x, center.y]
    this._restoreZoom = map.getZoom()
    super.addTo(map);
    return this;
  }

  clear() {
    super.clear()
    this._flyAnma?.dispose()
    this._flyAnma = void 0
    return this;
  }

  remove() {
    super.remove()
    this._flyAnma?.dispose()
    this._flyAnma = void 0
    return this
  }

  

 

  onZooming (ev: any) {
    super.onZooming(ev)
    const toZoom = ev.to
    this.forEach(oGeo => {
      if(oGeo.properties.ZOOM_ISCITY) {
        if(toZoom >= CITY_DETAIL_ZOOM) {
          oGeo.show()
        } else {
          oGeo.hide()
        }
      }

      if(oGeo.properties.ZOOM_ISPROVINCE) {
        if(toZoom >= CITY_DETAIL_ZOOM) {
          oGeo.hide()
        } else {
          oGeo.show()
        }
      }
      
    })
    
  }




  /**
   * 高亮当前省份
   */
  _selectProvince () {
    this.forEach((item) => {
      // 高亮当前容器
      if(item.properties.adcode === this._cfg.provinceCode) {
        if(item.type === 'MultiPolygon') {
     
          item.setZIndex(4)
          item.updateSymbol({
            polygonFill: 'transparent',
            lineColor: this._cfg.activeStyle.borderColor,
            lineWidth: this._cfg.activeStyle.borderWidth
          })
          // item.hide()
        } else if(item.type === 'Point'){
          item.setZIndex(4)
          item.updateSymbol({
            textFill: this._cfg.provinceConfig.fontColor,
            textHaloFill: this._cfg.provinceConfig.fontColor
          })
          item.hide()
        }        
      }      
    })
  }

  

  async drawChina () {
    const [areaRes, borderRes] = await Promise.all([
      shareFetchLocalFile<any>(this._cfg.geoBase + '/100000_full.json'),
      shareFetchLocalFile<any>(this._cfg.geoBase + '/100000.json'),
    ])

    const geoList: MultiPolygon[] = []
    const markerList: Marker[] = []

    _Array(areaRes?.data?.features).forEach((item: any) =>{
      let dos = item.geometry.type === 'MultiPolygon' ? item.geometry.coordinates : [item.geometry.coordinates]
      
      const iMultiPoy = new MultiPolygon(dos, {
        zIndex: 1,
        interactive: false,
        visible: true,
        editable: false,
        draggable: false,
        dragShadow: false,
        properties: {
          adcode: item.properties.adcode,
          ZOOM_PARENT_CODE: item.properties.parent?.adcode,
        },
        symbol: {
          lineColor: this._cfg.defaultStyle.borderColor,
          lineWidth: this._cfg.defaultStyle.borderWidth,
          polygonFill: this._cfg.defaultStyle.backgroundColor,
          polygonOpacity: 1,
        },
      })
      geoList.push(iMultiPoy)

      var point = new Marker(item.properties.center, {
        zIndex: 2,
        visible: true,
        editable: false,
        cursor: 'pointer',
        draggable: false,
        dragShadow: false,
        interactive: false,
        properties: {
          adcode: item.properties.adcode,
          ZOOM_PARENT_CODE: item.properties.parent?.adcode,
        },
        symbol: {          
          textFaceName: 'AlibabaPuHuiTi-3-55-Regular',
          textName: jUtilsBase.trim(item.properties.name),
          textFill: this._cfg.defaultStyle.fontColor,
          textHaloFill: this._cfg.defaultStyle.fontColor,
          textHaloRadius: 0,
          textHorizontalAlignment: 'middle',
          textVerticalAlignment: 'middle',
          textAlign: 'center' as any,
          textSize: 12,
        },
      })
      markerList.push(point)
    })

    jUtilsBase._Array(borderRes?.data?.features).forEach((item: any) => {
      const iMultiPoy = new MultiPolygon(item.geometry.coordinates, {
        zIndex: 2,
        interactive: false,
        visible: true,
        editable: false,
        draggable: false,
        dragShadow: false,
        properties: {
          resident: '2',
        },
        symbol: {
          lineColor: this._cfg.outerStyle.borderColor,
          lineWidth: this._cfg.outerStyle.borderWidth,
          polygonFill: 'transparent',
          polygonOpacity: 1,
        },
      })
      geoList.push(iMultiPoy)
    })

    this.addGeometry(geoList)
    this.addGeometry(markerList)
    this._loadProvinceDetail(this._cfg.provinceCode)
    this._selectProvince()
  }

 

  async _loadProvinceDetail (code: number) {
    const [areaRes] = await Promise.all([
      shareFetchLocalFile<any>(this._cfg.geoBase + `/${code}_full.json`),      
    ])

    const geoList: MultiPolygon[] = []
    const markerList: Marker[] = []
    _Array(areaRes?.data?.features).forEach((item: any) =>{
      let dos = item.geometry.type === 'MultiPolygon' ? item.geometry.coordinates : [item.geometry.coordinates]
      this._loadCityDetail(item.properties.adcode)
      const iMultiPoy = new MultiPolygon(dos, {
        zIndex: 3,
        visible: true,
        editable: false,
        draggable: false,
        dragShadow: false,
        properties: {
          areaName: item.properties.name,
          adcode: item.properties.adcode,
          ZOOM_PARENT_CODE: item.properties.parent?.adcode,
          ZOOM_SELECTED: false,
          ZOOM_ISPROVINCE: false
        },
        symbol: {
          lineColor: this._cfg.provinceConfig.borderColor,
          lineWidth: 1,
          lineDasharray: [5,10],
          polygonFill: this._cfg.provinceConfig.backgroundColor,
          polygonOpacity: 1,
        },
      })
      if(this._cfg.provinceConfig.canSelect) {
        iMultiPoy.on('click', (ev) => {        
          geoList.forEach(c => {
            if(c !== iMultiPoy) {
              c.properties.ZOOM_SELECTED = false
              c.updateSymbol({
                polygonFill: this._cfg.provinceConfig.backgroundColor
              })
            }          
          })
          const toVal = !iMultiPoy.properties.ZOOM_SELECTED
          

          iMultiPoy.properties.ZOOM_SELECTED = toVal
          iMultiPoy.updateSymbol({
            polygonFill: toVal ? this._cfg.provinceConfig.activeBackgroundColor : this._cfg.provinceConfig.backgroundColor
          })

          this._onProvinceDetailSelected(toVal ? item.properties.adcode : undefined)
        })
        iMultiPoy.on('mouseenter', (ev) => {
          if(!iMultiPoy.properties.ZOOM_SELECTED) {
            iMultiPoy.updateSymbol({
              polygonFill: this._cfg.provinceConfig.hoverBackgroundColor
            })
          }        
        })
        iMultiPoy.on('mousemove', (ev) =>{
          this._cfg.provinceConfig.onMouseMove(ev)
        })
        iMultiPoy.on('mouseout', (ev) => {
          if(!iMultiPoy.properties.ZOOM_SELECTED) {
            iMultiPoy.updateSymbol({
              polygonFill: this._cfg.provinceConfig.backgroundColor
            })
          }
          this._cfg.provinceConfig.onMouseOut(ev)
          
        })
      }
      
      geoList.push(iMultiPoy)

      var point = new Marker(item.properties.center, {
        zIndex: 5,
        visible: true,
        editable: false,
        cursor: 'pointer',
        draggable: false,
        dragShadow: false,
        interactive: this._cfg.enableMakerOffsetEdit,
        properties: {
          ZOOM_ID: `SMTC-1-${item.properties.adcode}`,
          adcode: item.properties.adcode,
          ZOOM_TITLE: item.properties.name,
          ZOOM_PARENT_CODE: item.properties.parent?.adcode,
          ZOOM_VISIBLE: false,
          ZOOM_ISPROVINCE: true
        },
        symbol: [
          {          
            textFaceName: 'AlibabaPuHuiTi-3-55-Regular',
            textName: jUtilsBase.trim(item.properties.name),
            textFill: this._cfg.provinceConfig.fontColor,
            textHaloFill: this._cfg.provinceConfig.fontColor,
            textHaloRadius: 0,
            textHorizontalAlignment: 'middle',
            textVerticalAlignment: 'middle',
            textAlign: 'center' as any,
            textSize: 12,
          }
        ],
      })
      markerList.push(point)
    })
    this.addGeometry(geoList)
    this.addGeometry(markerList)
  }

  _onProvinceDetailSelected (code?: number) {
    const fitConfig = this._cfg.fitViews.find(c=>c.adcode === code)
    let flyZoom = this._restoreZoom
    let flyCenter = this._restoreCenter
    if(fitConfig) {
      flyZoom = fitConfig.zoom
      flyCenter = fitConfig.center      
    }

    const currentCenter = this.map.getCenter()
    const fromCenter = [currentCenter.x, currentCenter.y, currentCenter.z]


    this._flyAnma?.dispose()

    // 有目标配置或者取消选择时才进行缩放
    if(fitConfig || isNull(code)) {
      this._flyAnma = new Animate({
        from: {
          zoom: this.map.getZoom(),
          center: fromCenter
        },
        to: {
          zoom: flyZoom,
          center: flyCenter
        },
        duration: 700,
        easing: function(t, b, c, d) {
          if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
          return c / 2*((t -= 2) * t * t * t * t + 2) + b;
        },
        onChange: (newPrpo: any) => {
          this.map.setCenterAndZoom(newPrpo.center, newPrpo.zoom)
        }
      }).start()
    }
    
    this._cfg.provinceConfig.onSelect(code)
  }

  async _loadCityDetail (code: number) {
    const [areaRes] = await Promise.all([
      shareFetchLocalFile<any>(this._cfg.geoBase + `/${code}_full.json`),      
    ])
    
    const geoList: MultiPolygon[] = []
    const markerList: Marker[] = []
    _Array(areaRes?.data?.features).forEach((item: any) =>{
      let dos = item.geometry.type === 'MultiPolygon' ? item.geometry.coordinates : [item.geometry.coordinates]      
      const iMultiPoy = new MultiPolygon(dos, {
        zIndex: 3,
        visible: true,
        interactive: false,
        editable: false,
        draggable: false,
        dragShadow: false,
        properties: {
          adcode: item.properties.adcode,
          ZOOM_PARENT_CODE: code,
          ZOOM_SELECTED: false,
          ZOOM_ISCITY: true
        },
        symbol: {
          lineColor: this._cfg.provinceConfig.borderColor,
          lineWidth: this._cfg.provinceConfig.borderWidth,
          polygonFill: 'transparent',
          lineDasharray: [5,10],
          polygonOpacity: 1,
        },
      })
      iMultiPoy.hide()
      geoList.push(iMultiPoy)

      var point = new Marker(item.properties.center, {
        zIndex: 5,
        visible: true,
        editable: false,
        cursor: 'pointer',
        draggable: false,
        dragShadow: false,
        interactive: this._cfg.enableMakerOffsetEdit,
        properties: {
          ZOOM_ID: `SMTC-2-${item.properties.adcode}`,
          ZOOM_TITLE: item.properties.name,
          adcode: item.properties.adcode,
          ZOOM_PARENT_CODE: code,
          ZOOM_VISIBLE: false,
          ZOOM_ISCITY: true,
        },
        symbol: {          
          textFaceName: 'AlibabaPuHuiTi-3-55-Regular',
          textName: jUtilsBase.trim(item.properties.name),
          textFill: this._cfg.provinceConfig.fontColor,
          textHaloFill: this._cfg.provinceConfig.fontColor,
          textHaloRadius: 0,
          textHorizontalAlignment: 'middle',
          textVerticalAlignment: 'middle',
          textAlign: 'center' as any,
          textSize: 12,
        },
      })
      point.hide()
      markerList.push(point)
    })
    this.addGeometry(geoList)
    this.addGeometry(markerList)
  }

  
}