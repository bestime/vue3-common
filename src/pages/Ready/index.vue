<style lang="scss" scoped>
.Ready {
  box-sizing: border-box;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  ul {
    align-items: stretch;
    overflow: auto;
    overflow-x: hidden;
    width: 200px;
    background-color: #444;
    margin: 0;
    list-style: none;
    padding: 0;
  }

  li {
    padding: 5px 10px;
    color: white;
    margin: 4px;
    border-radius: 4px;
    user-select: none;
    cursor: pointer;
    &.is-active{
      background-color: #17a47f;
    }
  }

}
.ReadyRoute {
  flex: 1;
  align-self: stretch;
  overflow: auto;
  width: 0;
  flex-shrink: 0;
  box-sizing: border-box;
}
</style>

<template>
  <div class="Ready">
    <ul>
      <li v-for="item in navList" :key="item.routeName" :class="{'is-active': isActive(item.routeName)}">{{ item.label }}</li>
    </ul>
    <RouterView class="ReadyRoute"></RouterView>
  </div>  
</template>

<script lang="ts" setup>

import { reactive, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const router = useRouter()
const route = useRoute()

const navList = [
  { routeName: 'ROUTE_HOME_MAPSCALEPOINTLINECONFIG', label: '地图缩放-点线配置' },
  { routeName: '222222', label: '测试002' },
]

function isActive (name: string) {
  return route.matched.some(c=>c.name === name)
}

onMounted(function () {
  
})
</script>