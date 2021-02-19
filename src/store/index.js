import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import {
  getItem,
  setItem
} from '@/utils/storage'
import chat from './chat'
import {
  baseUrl,
  wyyUrl
} from '@/utils/baseUrl'

Vue.use(Vuex)

var VUEX_URL = {
  GET_DOCHOMEPAGE: function (role) { //'doc'、'patient'

    let reqRole = role == "doc" ? "doc" : 'patient'
    return wyyUrl + "/Wylm_wyy/wy/" + reqRole + "/getDocUserByDocId";
  },
  DOCHOME_PAGE: function (docId, deptId) { //拼接医生主页url
    return baseUrl + "/Platform_N/by/visitor/" + deptId + "/" + docId + "/toDoctorHome";
  },
}

// 创建Vuex实例
const store = new Vuex.Store({
  // 容器的data，类似于组件中的data
  state: {
    ...chat.state,
    id: "", //榜单id/groupId
    doctorId: "",
    docHomePageUrl: "",
    hasFaq: false, //是否发布过问答集锦
    isFinishChat: false,
    isRoot: true, //表示可以使用聊天栏
    c2c_isPay: false, //咨询转门诊是否已支付

  },
  mutations: {
    ...chat.mutations,
    // 2. 添加一个 mutation 用于修改 state
    // 3. 登录成功，调用 mutation 将 token 放到 Vuex 容器中
    SET_ROOT(state, flag) {
      state.isRoot = flag
    },
    SET_ID(state, id) {
      state.id = id
    },
    SET_DoctorID(state, id) {
      state.doctorId = id
    },
    SET_DOCHomePage(state, url) {
      state.docHomePageUrl = url
    },
    SET_FAQ_STATUS(state, flag) {
      state.hasFaq = flag
    },
    SET_CHAT_STATUS(state, flag) {
      state.isFinishChat = flag
    },
    SET_CONSULT2CLINIC_ISPAY_STATUS(state, flag) { //设置咨询转门诊支付标记
      state.c2c_isPay = flag
    },

  },
  actions: {
    getDocHomePage(context, obj) { //获取医生首页地址url
      let doctorId = obj.doctorId
      let role = obj.role

      axios({
          method: 'get',
          dataType: 'json',
          url: VUEX_URL.GET_DOCHOMEPAGE(role),
          params: {
            "id": doctorId
          },
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }

        })
        .then(response => {

          if (response.data.resultCode == '200') {
            let docId = response.data.data.docId;
            let deptId = response.data.data.deptId;
            let url = VUEX_URL.DOCHOME_PAGE(docId, deptId)
            context.commit('SET_DOCHomePage', url);
          } else {
            console.log('XXXXXX生产医生首页地址失败：', response.data)
            // Message({
            //   message: response.data.resultDesc,
            //   type: 'error',
            //   duration: 2000,
            //   offset: 40
            // })
          }

        })
        .catch(e => {
          console.log(e)

        })
    },
  },
  getters: {
    getDoctorId(state) {
      return state.doctorId;
    }
  },
  modules: {
    chat: chat

  }
})

// 导出vuex实例
export default store
