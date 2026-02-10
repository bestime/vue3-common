/**
 * 获取上一个配置，用于计算推荐属性
 */
export function getPrevCfg (list: any[], zoom: number) {
  list.sort(function (a, b) {
    return b.zoom - a.zoom
  })

  let prev
  for(let a = 0;a<list.length;a++) {
    console.log("比较", zoom, list[a]!.zoom, list[a]!.zoom === zoom)
    if(zoom === list[a]!.zoom) {
      prev = list[a+1]
      break;
    } else if(zoom > list[a]!.zoom) {
      prev = list[a]
      break
    }
  }
  console.log("prev", prev,zoom,list)
  return {
    zoom: prev?.zoom,
    iconSize: jUtilsBase._Number(prev?.data?.iconSize),
    iconHorizontalOffset: jUtilsBase._Number(prev?.data?.iconHorizontalOffset),
    iconVerticalOffset: jUtilsBase._Number(prev?.data?.iconVerticalOffset),
    fontSize: jUtilsBase._Number(prev?.data?.fontSize),
    fontHorizontalOffset: jUtilsBase._Number(prev?.data?.fontHorizontalOffset),
    fontVerticalOffset: jUtilsBase._Number(prev?.data?.fontVerticalOffset),
  }
}