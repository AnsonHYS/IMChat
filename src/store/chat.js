import tim from '@/tim'
import TIM from 'tim-js-sdk'
import {
  getItem,
  setItem,
  removeItem
} from '@/utils/storage'
const chat = {
  state: {
    online: false, //是否在线了
    SDK_READY: false, //sdk
    conversationID: "", //当前会话id GROUP+groupID
    currentConversation: {},
    msgList: [],
    recond: [],
    memberList: [], //群成员列表
    loginInfo: getItem('loginInfo'),

  },
  getters: {
    //获取conversationID
    toAccount: state => {

      if (state.conversationID) {
        let str = state.conversationID
        if (str.indexOf('GROUP') > -1) {
          return str.replace('GROUP', '')
        } else {
          return str
        }

      }
    },
    //获取ConversationType:  C2C、GROUP
    currentConversationType: state => {

      return "GROUP"
    },
    getSDK(state) {
      return state.SDK_READY;
    },
    getMsg(state) {
      return state.msgList;
    },
    getConversationID(state) {
      return state.conversationID;
    },
    getRecond(state) {
      return state.recond;
    },
    getLineStatus(state) {

      return state.online;
    },
    getMemberList(state) {
      return state.memberList;
    },
    getLoginInfo(state) {
      var data = JSON.parse(state.loginInfo);
      return data
    },

  },
  actions: {
    setSDK(context, flag) {
      context.commit('SET_SDK', flag);
    },
    set_loginInfo(context, data) {
      context.commit('SET_LOGININFO', data);
    },
    clear_LoginInfo(context) {
      context.commit('CLEAR_LOGININFO');

    },
    updataMsg(context) {
      context.commit('UPDATE_MSG')
    },
    clearMsg(context) {
      context.commit('CLEAR_MSG')
    },
    set_stationId(context, id) {
      context.commit('SET_STATIONID', id)
    },
    set_memberList(context, list) {
      context.commit('SET_MEMBERLIST', list)
    },
    set_LineStatus(context, flag) {
      context.commit('SET_LINETATUS', flag)
    }

  },
  mutations: {
    /**
     * 更新当前会话
     * 调用时机: 切换会话时
     * @param {Object} state
     * @param {Conversation} conversation
     */
    updateCurrentConversation(state, conversation) {
      state.currentConversation = conversation

    },
    SET_SDK(state, flag) {
      state.SDK_READY = flag;
      //  setItem('SDK_READY',flag);
    },
    SET_LOGININFO(state, obj) {
      var str = JSON.stringify(obj);
      state.loginInfo = str;
      setItem('loginInfo', str);

    },
    CLEAR_LOGININFO(state) {
      removeItem('loginInfo');
    },
    SET_MEMBERLIST(state, list) {
      state.memberList = list;
    },
    SET_LINETATUS(state, flag) {
      state.online = flag;
      //  setItem('online',flag);

    },
    /**
     * 更新当前会话
     * 调用时机: 切换会话时
     * @param {Object} state
     * @param {Conversation} conversation
     */
    SET_STATIONID(state, conversationID) {
      state.conversationID = conversationID
      state.msgList = []

    },
    RECOND(state, data) {
      if (!state.conversationID) {
        return
      }
      if (Array.isArray(data)) {
        const result = data.filter(item => item.conversationID === state.conversationID)
        state.recond = result;

      } else if (data.conversationID === state.conversationID) {
        state.recond = data
      }
      state.msgList = [...state.recond, ...state.msgList];




    },
    init_REC_MSG(state, data) {
      var list = state.recond;
      var list1 = state.msgList
      state.msgList = [...list, ...list1];
    },
    UPDATE_MSG(state, data) {

      if (!state.conversationID) {
        return
      }

      if (!Array.isArray(data) && data.conversationID === state.conversationID) {

        state.msgList.push(data);
      } else if (Array.isArray(data)) {
        // 筛选出当前会话的消息

        const result = data.filter(item => item.conversationID === state.conversationID)
        state.msgList = [...state.msgList, ...result]

      }
      console.log('更新信息：', state.msgList)

    },
    CLEAR_MSG(state, data) {

      state.msgList = [];
    },
    pushCurrentMessageList(state, data) {
      // 还没当前会话，则跳过
      if (!state.conversationID) {
        return
      }
      var list = state.msgList;

      if (Array.isArray(data)) {
        // 筛选出当前会话的消息
        //数组去重
        function getList(arr) {
          const res = new Map();
          return arr.filter((arr) => !res.has(arr.ID) && res.set(arr.ID, 1))
        }
        const result = getList(data);
        // const result = data.filter(function (item) {
        //   if (item.conversationID === state.conversationID) { //当前会话
        //     console.log("新消息ID：聊天最后的ID ~~", item.ID, list[list.length - 1].ID);
        //     let flag = (item.ID === list[list.length - 1].ID) ? true : false;
        //     console.log('消息id是否一致', flag)
        //     if (!flag) { //处理重复消息
        //       console.log("after:新消息，返回数据");
        //       return item;
        //     }
        //   } else if (item.conversationID === 'C2Cadministrator') { //系统消息

        //     return item;
        //   }

        // })
        if (result.length > 0) {
          state.msgList = [...state.msgList, ...result];
          console.log('合并后的聊天信息XX：', state.msgList)
        }


      } else {
        state.msgList = [...state.msgList, data]
      }
    },
  },

}
export default chat;
