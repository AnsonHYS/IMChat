<template>
  <div class="chat">
    <div class="c-title">
      <h4 v-if="otherInfo.Name">{{action=='consult'?'在线咨询':"张榜"}}：正在和 {{role=="doc"?"【患者】":"【医生】"}}<b>{{otherInfo.Name}}</b> 聊天中 </h4>
      <h4 v-else>已离线....</h4>
    </div>
    <!-- 聊天内容 -->
    <div class="c-contant"
         v-loading="loading">
      <!-- 消息列表 -->
      <div class="message-list"
           ref="message-list">
        <div class="Morebtn">
          <!-- 解散群 -->
          <!-- <span v-for="(G,j) in Group"
                :key="j">
            {{G.groupID}}<b @click="disMisGroup(G.groupID)">解散</b>&nbsp;
          </span> -->

          <label v-show="!isCompleted && lineStatus"
                 @click="getRcond">更多历史</label>
        </div>

        <div class="MsgDiv"
             ref="msgDiv">

          <div class="message-item"
               :class="{ reverse: item.isMySelf }"
               v-for="(item, index) in messages"
               :key="index">
            <!---------------------------- 会画消息 ---------------------------->
            <span v-if="item.type == '@TIM#SYSTEM'||item.type == TIM.TYPES.MSG_GRP_TIP"
                  class="tipsMessage"
                  style="color: #565656;font-weight: bold;">
              {{ item.msg }}
              <!-- 群消息内容 -->
            </span>

            <!------------------------ 聊天消息（不含群消息） ----------------------------->
            <div class="col"
                 v-if="item.type != TIM.TYPES.MSG_GRP_TIP && item.isMySelf !== ''">
              <img class="avatar"
                   slot="icon"
                   fit="contain"
                   width="0.8rem"
                   height="0.8rem"
                   :src="IMG(item.photo)" />

              <div class="msgGroup">
                <!-- 群名片 -->
                <span :class="
                   [{
                   my:
                   item.isMySelf
                   }, 'nickName'
                   ]">{{
                item.name
              }}</span>
                <div :class="[
                  { right: item.isMySelf },
                  { left: !item.isMySelf },
                  'title'
                ]">
                  <!-- 自定义消息 -->

                  <custom-msg v-if="item.type == TIM.TYPES.MSG_CUSTOM"
                              :payload="item.msg"
                              :role="role"
                              :action="action"
                              :groupID='groupID'></custom-msg>

                  <!-- 文本消息 -->
                  <p v-if="item.type == TIM.TYPES.MSG_TEXT"
                     v-html="item.msg">{{item.msg}}</p>

                  <!-- 音频消息 -->
                  <p v-if="item.type == TIM.TYPES.MSG_AUDIO">
                    音频
                    <audio controls
                           class="sound">
                      <source :src="item.msg"
                              type="audio/mpeg" />
                      您的浏览器不支持 audio 元素。
                    </audio>
                  </p>
                  <!-- 视频消息 -->
                  <video v-if="item.type == TIM.TYPES.MSG_VIDEO"
                         :src="item.msg"
                         controls="controls">
                    您的浏览器不支持 video 标签。
                  </video>
                  <!-- 图片消息 -->
                  <p v-if="item.type == TIM.TYPES.MSG_IMAGE"
                     class="IMG-P">
                    <img :src="item.msg"
                         class="imgs"
                         @click="scanImg(item.msgBig)" />
                    <el-progress v-if="showProgressBar(item)"
                                 :percentage="percentage(item.progress)" />
                  </p>
                  <!-- 文件消息 -->
                  <label v-if="item.type == TIM.TYPES.MSG_FILE"
                         class="file"
                         title="点击下载"
                         @click="downLoadFile(item)">
                    <span>{{ item.textname }}</span>
                    <p class="size">{{item.size}}</p>
                    <el-progress v-if="showProgressBar(item)"
                                 :percentage="percentage(item.progress)" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <!-- 发送消息栏 -->

    <div class="c-sendBox">
      <div class="c-sendBox-top">

        <span v-show="isFinish">
          <el-button size="mini"
                     type="success"
                     :disabled="faqDisabled"
                     @click="sendFaq()">发布到问答集锦</el-button>
          <el-popover placement="top"
                      width="100"
                      trigger="click">
            <!-- 分享 -->
            <share :config="config"
                   v-if='isShare'></share>

            <el-button size="mini"
                       type="primary"
                       slot="reference"
                       @click="share()">分享</el-button>

          </el-popover>

        </span>
        <span v-show="!isFinish">
          <el-popover placement="top"
                      width="400"
                      trigger="click">
            <div class="emojis">
              <div v-for="item in emojiName"
                   class="emoji"
                   :key="item"
                   @click="chooseEmoji(item)">
                <img :src="emojiUrl + emojiMap[item]"
                     style="width:30px;height:30px" />
              </div>
            </div>
            <i class="iconfont icon-smile"
               slot="reference"
               title="发表情"></i>
          </el-popover>
          <i class="iconfont icon-tupian"
             title="发图片"
             @click="handleSendImageClick"></i>
          <i class="iconfont icon-file"
             title="发文件"
             @click="handleSendFileClick"></i>
          <i class="iconfont icon-finish"
             title="结束"
             @click="preFinish"></i>
          <i class="iconfont icon-clinic"
             v-if="role=='doc'&&action=='consult'"
             title="咨询转门诊"
             @click="toClnic()"></i>
          <div class="btn-send"
               v-if="!isFinish&&isRoot"
               title="发送"
               @click="sendTextMessage()">
            <div class="icon-send"></div>
          </div>

        </span>

      </div>
      <div class="c-sendBox-bottom">
        <!-- 未结束-->
        <textarea ref="text-input"
                  v-show="!isFinish"
                  placeholder="请输入..."
                  rows="4"
                  resize="false"
                  v-model="messageContent"
                  class="text-input"
                  @focus="focus = true"
                  @blur="focus = false">
      </textarea>
        <!-- 已结束，未评价 -->
        <div v-if="isFinish&&!hasEvaluation&&role=='user'">
          <textarea ref="evaluation"
                    v-show="isFinish&&role=='user'&&action=='notice'"
                    placeholder="请输入评价..."
                    rows="4"
                    resize="false"
                    v-model="evaluationVal"
                    class="text-input">
           </textarea>
          <div class="btn-send-eval"
               v-show="isFinish&&role=='user'&&action=='notice'"
               title="提交评价"
               @click="evaluation()">
            提交评价
          </div>
        </div>
        <!-- 已结束，已经评价 -->
        <div v-if="isFinish&&hasEvaluation">
          评价：{{evaluationVal}}
        </div>
      </div>

      <FAQ :role="role"
           :action="action"
           :flag="toFaqFlag"
           :faqInfo="faqInfo"
           :ID="groupID" />

      <input type="file"
             id="imagePicker"
             ref="imagePicker"
             accept=".jpg, .jpeg, .png, .gif"
             @change="sendImage"
             style="display:none" />
      <input type="file"
             id="filePicker"
             ref="filePicker"
             @change="sendFile"
             style="display:none" />

    </div>
  </div>
</template>

<script>
import icons from '@/assets/icon_user.png'

import { baseUrl, drugStore, testUrl, testUrl2, wyyUrl, IMbase } from '@/utils/baseUrl'
import { mapGetters, mapState } from 'vuex'
import { emojiMap, emojiName, emojiUrl } from '@/utils/emojiMap'
import { decodeText } from '@/utils/decodeText'
import { XSSvalidate } from '@/utils/XssValidate.js'


import BUS from "@/utils/eventBus.js"
import FAQ from '@/components/publishFAQ.vue'
import CUSTOM_MSG from "@/components/message_custom.vue"
import consultInDocVue from './docChat/consultInDoc.vue'

var URLS = {
  INFO: function (role, action) {//获取基本信息
    let url = '';
    switch (action) {
      case "notice":
        if (role == 'doc') {
          url = wyyUrl + '/Wylm_wyy/wy/doc/getOneNotice';
        } else {
          url = wyyUrl + '/Wylm_wyy/wy/patient/getNoticeDetails';
        }
        break
      case "consult":
        if (role == 'doc') {
          url = wyyUrl + "/Wylm_wyy/wy/doc/docViewConsultInfo";
        } else {
          url = wyyUrl + "/Wylm_wyy/wy/patient/patViewConsultInfo";
        } break;
    }
    return url

  },//获取聊天信息
  GET_USERSIG: testUrl2 + "techat/getUserSig",//开始获取userSig
  CHECK_ACC: testUrl2 + 'techat/importAccount',//进行账号监测
  FINISH_CONSULT: function (role) {//咨询---聊天结束
    var str;
    switch (role) {
      case 'doc':
        str = wyyUrl + "/Wylm_wyy/wy/doc/docFinishConsultInfo";
        break;
      case 'user':
        str = wyyUrl + "/Wylm_wyy/wy/patient/patFinishConsult";

        break;

    }
    return str

  },
  FINISH_NOTICE: function (role) {//揭榜---聊天结束
    var str;
    switch (role) {
      case 'doc':
        str = wyyUrl + "/Wylm_wyy/wy/doc/completeNotice";
        break;
      case 'user':
        str = wyyUrl + "/Wylm_wyy/wy/patient/completeNotice";

        break;

    }
    return str
  },
  EVALUATION: wyyUrl + "/Wylm_wyy/wy/patient/evaluationNotice",//患者评价
  DOC_FIRST_MSG (action) {
    var str;
    switch (action) {
      case 'notice':
        str = wyyUrl + "/Wylm_wyy/wy/doc/sendMsgWhenDocFirstResNotice";//此如果是医生第一次回复该揭榜，则发送一条提示消息
        break;
      case 'consult':
        str = wyyUrl + "/Wylm_wyy/wy/doc/sendMsgWhenDocFirstResponse";//此如果是医生第一次回复该咨询，则发送一条提示消息
        break;

    }
    return str
  },
  CLINIC: wyyUrl + "/Wylm_wyy/wy/doc/getDocConsultConvertClinicInfo",//【医生端】咨询转门诊：点击按钮，获取网诊金

}
var N = 0;

export default {
  props: {
    'role': {// doc /user
      required: true
    },
    'action': { // consult/notice
      required: true
    }
  },
  data () {
    return {
      isFirst: true,//标记第一次进入
      loading: true,//加载内容
      groupID: "", // "2020042721667", //"bc320f55c967455c92381f6ae9b8c0bd",//当前群id
      groupName: "",//群名字
      //登录参数信息
      form: {
        userID: "",
        userSig: '',
        Name: '',
        avatar: "",

      },


      myInfo: {},//自己信息
      otherInfo: {},//别人信息
      Group: [], // 群组列表
      messageContent: "",//消息内容

      /**
       * 订单状态
       * 咨询 : -1：已取消，0：未支付，1：已支付，2：未回复，3,：已回复，4：已完成
       * 张榜 ：-1：已取消，1：未支付，2：未揭榜，3：已揭榜，4：完成
       */
      CHAT_STATUS: "",

      /*聊天内容*/
      recond: [], // 聊天记录(腾讯云数据库)
      recondDB: [],//聊天记录（后台数据库）
      isCompleted: false, // 是否已经拉完所有消息。
      nextReqMessageID: '', // 分页id
      messageRecond: '',//（历史）腾讯云聊天记录

      isDocFirstMsg: false,//标记医生第一次回复

      //评价-患者
      evaluationVal: "",//评价内容
      hasEvaluation: false,//是否已经评价了

      //表情图片
      emojiMap: emojiMap,
      emojiName: emojiName,
      emojiUrl: emojiUrl,

      //发布问答集锦
      toFaqFlag: false,
      faqInfo: {},


      //分享
      isShare: false,
      config: {
        // url: '', // 网址，默认使用 window.location.href
        // source: '', // 来源（QQ空间会用到）, 默认读取head标签：<meta name="site" content="http://overtrue" />
        // title: '', // 标题，默认读取 document.title 或者 <meta name="title" content="share.js" />
        // description: '我在【网医语】回答了患者的问题，感觉该网站超级好用耶。咨询的内容还可以发表，别人付费浏览，赚点小外快哦。快来体验吧。', // 描述, 默认读取head标签：<meta name="description" content="PHP弱类型的实现原理分析" />
        // image: '', // 图片, 默认取网页中第一个img标签
        // sites: ['qzone', 'weibo', 'wechat'], // 启用的站点
        // disabled: [], // 禁用的站点
        // wechatQrcodeTitle: '微信扫一扫：分享', // 微信二维码提示文字
        // wechatQrcodeHelper: '<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>'
      },
      isSendClinic: false,//医生是否已经点击了‘咨询转门诊’操作标记
    }
  },

  created () {
    var t = this;
    // 初始化监听器
    this.initListener()
    this.$store.dispatch('clearMsg')// 清除本地的聊天信息
    this.groupID = this.GetQueryString('id') ? this.GetQueryString('id') : this.GetQueryString('businessId');
    if (this.groupID) {
      //初始化，获得登录双方的数据
      this.initInfo().then(function (promise) {
        if (promise) {
          t.Login()
        }
      });


    } else {
      this.$message.error('系统错误，无法进入聊天诊室');
    }


    BUS.$on("two-to-one", data => {

      console.log("XX监听评价", data);
      this.hasEvaluation = data.hasEvaluation;//评价内容
      this.evaluationVal = data.val;//是否已经评价了
    });

  },
  mounted () {


  },
  components: {
    'FAQ': FAQ,
    "custom-msg": CUSTOM_MSG

  },
  watch: {
    OKStatus (obj) {
      var t = this
      console.log('SDK ready 和 登陆状态：', obj)
      if (obj.online === true && obj.SDK === true) {
        // sdk已经初始化了并且登陆了

        setTimeout(function () {
          t.loading = false

          t.getGroup()
        }, 500)
      }
    },


  },
  computed: {
    ...mapGetters(['toAccount', 'currentConversationType']),
    isFinish () {
      let str = this.$store.state.isFinishChat;
      return str
    },
    isRoot () {
      return this.$store.state.isRoot
    },
    faqDisabled () {

      let str = this.$store.state.hasFaq;
      return str
    },
    OKStatus () {
      var obj = {
        online: this.lineStatus,
        SDK: this.SDK_READY
      }
      return obj
    },
    // sdk状态
    SDK_READY () {
      return this.$store.getters.getSDK
    },
    // 在线状态
    lineStatus () {
      return this.$store.getters.getLineStatus
    },
    //成员列表
    memberList () {
      var list = this.$store.getters.getMemberList

      return list
    },
    messages: function () {
      var t = this
      var arr = [];
      if (this.CHAT_STATUS != '4') {//聊天-未结束
        console.log("IM聊天信息", this.messageRecond);
        arr = this.init_IMChatRec(this.messageRecond)
      } else {//聊天-已结束
        t.$store.commit('SET_CHAT_STATUS', true);//设置聊天完成
        console.log("聊天信息", this.recondDB);
        arr = this.init_DBChatRec(this.recondDB)
      }


      return arr
    }
  },
  methods: {
    toFixed (number, precision = 2) {
      return number.toFixed(precision)
    },
    IMG (url) {
      if (!url) {
        return icons;
      } else {
        return url;
      }
    },
    /**
     * 初始化 腾讯云聊天数据
     * 
     * @list 腾讯云聊天数据
     */
    init_IMChatRec (list) {
      var t = this;
      // TIM.TYPES.MSG_TEXT 文本消息
      // TIM.TYPES.MSG_IMAGE 图片消息
      // TIM.TYPES.MSG_AUDIO 音频消息
      // TIM.TYPES.MSG_VIDEO 视频消息
      // TIM.TYPES.MSG_FILE 文件消息
      // TIM.TYPES.MSG_CUSTOM 自定义消息
      // TIM.TYPES.MSG_GEO  位置消息
      // TIM.TYPES.MSG_GRP_TIP 群提示消息
      // TIM.TYPES.MSG_GRP_SYS_NOTICE 群系统通知消息
      var myID = this.form.userID;
      var otherID;

      var res = this.memberList.filter(item => item.userID !== myID)
      if (res.length > 0) {
        otherID = res[0].userID
      }
      var arr = [];
      for (var i = 0; i < list.length; i++) {
        var e = list[i]
        var obj = {}

        // 发送的消息
        switch (e.type) {
          case TIM.TYPES.MSG_IMAGE: // "TIMImageElem":

            obj['status'] = e.status;
            obj['progress'] = e.progress;

            var str = e.payload.imageInfoArray[1].url;//上传时，图片为base64缓存，上传完成后，图片为数据库文件
            obj['msg'] = str  // 图片base64缓存
            obj['msgBig'] = e.payload.imageInfoArray[2].imageUrl ? e.payload.imageInfoArray[2].imageUrl : str // 大图
            break
          case TIM.TYPES.MSG_TEXT: // "TIMTextElem":

            //判断是否是系统消息
            if (e.from == 'administrator') {//接收到系统消息 
              var str = e.payload.text;
              if (str == '@~聊天结束' && !t.isFinish) { //未结束时
                console.log('@@@ IM消息');
                t.$store.commit('SET_CHAT_STATUS', true);//设置聊天完成
                t.sendFaq(true);//单纯查询聊天是否结束
              }
              obj['msg'] = str;

            } else {//对话消息

              var olist = decodeText(e.payload)
              // @~聊天结束
              var str = ''
              for (var k = 0; k < olist.length; k++) {
                switch (olist[k].name) {
                  case 'text':
                    var string = olist[k].text;
                    str += string;
                    //监听聊天是否已经结束了，重新调一下查询接口
                    if (string == '@~聊天结束' && !t.isFinish) { //未结束时

                      t.sendFaq(true);//单纯查询聊天是否结束
                    }
                    break
                  case 'img':
                    str += `<img src='${olist[k].src}'/>`
                    break
                }
              }
              obj['msg'] = str
            }



            break
          case TIM.TYPES.MSG_FILE: // "TIMFileElem":
            obj['msg'] = e.payload.fileUrl
            obj['textname'] = e.payload.fileName
            obj['status'] = e.status;
            obj['progress'] = e.progress;

            obj['size'] = t.size(e.payload.fileSize);

            break
          case TIM.TYPES.MSG_AUDIO: // "TIMSoundElem":
            obj['msg'] = e.payload.url
            break
          case TIM.TYPES.MSG_VIDEO: // "TIMVideoFileElem":
            obj['msg'] = e.payload.videoUrl
            break
          case TIM.TYPES.MSG_CUSTOM: // "TIMCustomElem": //自定义消息
            //判断是否是系统消息
            if (e.from == 'administrator') {//接收到系统消息 
              var str = e.payload.data;
              if (str.indexOf("{") > -1 && str.indexOf("}") > -1) {
                var JSONobj = JSON.parse(str);

                // {
                // 	"businessid": "NzQ2XamKRO4vhTRfKQa",
                // 	"docMessage": "用户补齐网诊差价后即可开始门诊业务",
                // 	"docTitle": "已向用户发起【咨询转门诊】申请",
                // 	"doctorId": "Upw4SojGyxLG0ZP9bGd",
                // 	"fee": "0.01",
                // 	"isPay": "0",
                // 	"messageType": 101,// 101:咨询转门诊
                // 	"msg": "已向用户发起【咨询转门诊】申请，用户补齐网诊差价后即可开始门诊业务。",
                // 	"orgId": "h1",
                // 	"time": "2020-12-23 11:59:53",
                // 	"userMessage": "请补齐网诊差价：¥ 0.01",
                // 	"userTitle": "医师向您发起[咨询转门诊]服务，可以为您开具处方，进行购药。"
                // }



                if (JSONobj.messageType == '101') {//系统返回自定义消息：咨询转门诊消息
                  console.log('【系统消息】计算回调次数：', N++);
                  if (JSONobj.isPay == '1') {
                    t.$store.commit('SET_CONSULT2CLINIC_ISPAY_STATUS', true);//设置支付已完成
                  }
                  obj['msg'] = e.payload;
                  // if (!t.isFinish && t.role == 'user') {//患者‘咨询转门诊’支付成功标记---未结束
                  //   t.sendCustomMessage(str, 'consultToClinc', '');//发送自定义消息
                  //   obj['msg'] = obj.msg;//展示的系统消息
                  // }
                }

              } else {
                obj['msg'] = e.payload;
              }


            } else {
              obj['msg'] = e.payload
            }


            break
          case TIM.TYPES.MSG_GRP_TIP: // "TIMGroupTipElem": //群消息
            obj['msg'] = e.payload.extension
            break
          case TIM.TYPES.MSG_GEO: // 'TIMLocationElem'位置消息
            break
          case TIM.TYPES.MSG_GRP_SYS_NOTICE: // "TIMGroupSystemNoticeElem": 群系统通知消息
            obj['msg'] = e.payload.extension
            break
          default:
            // @TIM#SYSTEM
            if (e.type === '@TIM#SYSTEM') {
              obj['msg'] = e.payload.extension
              obj['isMySelf'] = ''
              obj['photo'] = ''
            }
        }

        obj['type'] = e.type

        if (e.type !== '@TIM#SYSTEM') {

          if (e.from === myID) {//自己
            obj['isMySelf'] = true
          } else if (e.from === otherID) {//别人
            obj['isMySelf'] = false
          }
          else if (e.from === "administrator") {//系统
            obj['isMySelf'] = false
          } else {//其它
            obj['isMySelf'] = ''
          }
        }
        // console.log("新的成员list", this.memberList);
        var result = this.memberList.filter(item => item.userID === e.from)

        if (result.length > 0) {
          // 成员消息
          obj['name'] = result[0].nick ? result[0].nick : e.from // 修改的群名片
          if (obj['isMySelf'] === false) {
            // 别人头像
            obj['photo'] = result[0].avatar
              ? t.getPath(result[0].avatar)
              : icons
          } else {
            // 自己头像
            obj['photo'] =
              result[0].avatar && result[0].avatar !== 'null'
                ? t.getPath(result[0].avatar)
                : icons
          }
        } else {
          // 系统消息
          obj['name'] = '系统'
          obj['photo'] = ''
        }

        arr.push(obj)
      }
      //console.log('聊天封装', arr)
      return arr;
    },
    /**
    * 初始化后台聊天数据
    * 
    * @list 数据库聊天数据
    */
    init_DBChatRec (list) {
      var t = this
      // TIM.TYPES.MSG_TEXT 文本消息
      // TIM.TYPES.MSG_IMAGE 图片消息
      // TIM.TYPES.MSG_AUDIO 音频消息
      // TIM.TYPES.MSG_VIDEO 视频消息
      // TIM.TYPES.MSG_FILE 文件消息
      // TIM.TYPES.MSG_CUSTOM 自定义消息
      // TIM.TYPES.MSG_GEO  位置消息
      // TIM.TYPES.MSG_GRP_TIP 群提示消息
      // TIM.TYPES.MSG_GRP_SYS_NOTICE 群系统通知消息
      var arr = [];
      var myID = this.form.userID;//单前聊天-自己id

      var DOC = {
        ID: this.$store.state.doctorId,
      }
      var PAT = {};
      for (var m = 0; m < this.memberList.length; m++) {
        if (this.memberList[m].userID == DOC.ID) {
          DOC.avatar = this.getPath(this.memberList[m].avatar);
          DOC.nick = this.memberList[m].nick
        } else {
          PAT.ID = this.memberList[m].userID
          PAT.avatar = this.getPath(this.memberList[m].avatar);
          PAT.nick = this.memberList[m].nick
        }
      }

      for (var i = 0; i < list.length; i++) {
        var e = list[i]
        var obj = {}
        obj['usertype'] = e.usertype
        // 发送的消息
        switch (e.msgtype) {
          case 'imag': // "TIMImageElem":
            obj['type'] = TIM.TYPES.MSG_IMAGE
            console.log('图片路径', e.msg)
            obj['msg'] = t.getPath(e.msg)
            obj['msgBig'] = t.getPath(e.msg)
            break
          case 'text': // "TIMTextElem":
            obj['type'] = TIM.TYPES.MSG_TEXT
            //判断是否是系统消息
            if (!e.usertype) {//接收到系统消息 
              var str = e.msg;
              // msg: "@~聊天结束"
              // msgtype: "text"
              // rid: "ISPfvhqT1XurhbZL6sL"
              // time: "2020-12-25 10:40:20"
              //监听聊天是否已经结束了，重新调一下查询接口
              if (str == '@~聊天结束' && !t.isFinish) { //未结束时
                console.log('@@@ DB消息');
                t.$store.commit('SET_CHAT_STATUS', true);//设置聊天完成
                t.sendFaq(true);//单纯查询聊天是否结束
              }

              obj['msg'] = str;
            } else {//对话消息

              let payload = { 'text': e.msg }
              var olist = decodeText(payload)
              // @~聊天结束
              var str = ''
              for (var k = 0; k < olist.length; k++) {
                switch (olist[k].name) {
                  case 'text':
                    var string = olist[k].text;
                    str += string;
                    //监听聊天是否已经结束了，重新调一下查询接口
                    if (string == '@~聊天结束' && !t.isFinish) { //未结束时

                      t.sendFaq(true);//单纯查询聊天是否结束
                    }
                    break
                  case 'img':
                    str += `<img src='${olist[k].src}'/>`
                    break
                }
              }
              obj['msg'] = str
            }




            break
          case 'file': // "TIMFileElem":
            obj['type'] = TIM.TYPES.MSG_FILE
            console.log('文件路径', e.msg)
            var fileUrl = e.msg;
            if (fileUrl.indexOf('http:') == -1 && fileUrl.indexOf('https:') == -1) {
              fileUrl = decodeURIComponent(IMbase + e.msg)
            }
            obj['msg'] = fileUrl
            obj['textname'] = t.getFileName(fileUrl)
            obj['size'] = '';

            break
          case "sound": // "TIMSoundElem":
            obj['type'] = TIM.TYPES.MSG_AUDIO
            obj['msg'] = decodeURIComponent(IMbase + e.msg)
            break
          case TIM.TYPES.MSG_VIDEO: // "TIMVideoFileElem":
            obj['type'] = TIM.TYPES.MSG_VIDEO
            obj['msg'] = e.payload.videoUrl
            break
          case TIM.TYPES.MSG_CUSTOM: // "TIMCustomElem": //自定义消息
            obj['type'] = TIM.TYPES.MSG_CUSTOM
            // msg: "group_create"
            // msgtype: "TIMCustomElem"
            // rid: "ISPfvhqT1XurhbZL6sL"
            // time: "2020-12-23 11:51:22"
            // usertype: "P"

            //判断是否是系统消息
            if (!e.usertype) {//接收到系统消息 
              var str = e.msg;
              var JSONobj;
              switch (typeof (e.msg)) {
                case "string":
                  if (str.indexOf("{") > -1 && str.indexOf("}") > -1) {
                    JSONobj = JSON.parse(str);
                  } else {
                    JSONobj = str;
                  }
                  break;
                case 'object':
                  JSONobj = str;
                  break;
              }

              // businessid: "ISPfvhqT1XurhbZL6sL"
              // docMessage: "用户补齐网诊差价后即可开始门诊业务"
              // docTitle: "已向用户发起【咨询转门诊】申请"
              // doctorId: "87fd6cbcf2684fa8b21ea4440da893ec"
              // fee: "0.01"
              // isPay: "0"
              // messageType: 101
              // msg: "已向用户发起【咨询转门诊】申请，用户补齐网诊差价后即可开始门诊业务。"
              // orgId: "83912AAA60C15A68E053BEF0A8C09545"
              // time: "2020-12-23 14:34:38"
              // userMessage: "请补齐网诊差价：¥ 0.01"
              // userTitle: "医师向您发起[咨询转门诊]服务，可以为您开具处方，进行购药。"
              if (JSONobj.messageType == '101') {//系统返回自定义消息：咨询转门诊消息
                console.log('【系统消息】计算回调次数：', N++);
                if (JSONobj.isPay == '1') {
                  t.$store.commit('SET_CONSULT2CLINIC_ISPAY_STATUS', true);//设置支付已完成
                }


              }
              obj['msg'] = { 'data': JSONobj };



            } else {
              obj['msg'] = { 'data': e.msg };
            }


            break
          case TIM.TYPES.MSG_GRP_TIP: // "TIMGroupTipElem": //群消息
            obj['msg'] = e.payload.extension
            break
          case TIM.TYPES.MSG_GEO: // 'TIMLocationElem'位置消息
            break
          case TIM.TYPES.MSG_GRP_SYS_NOTICE: // "TIMGroupSystemNoticeElem": 群系统通知消息
            obj['msg'] = e.payload.extension
            break
          default:
            // @TIM#SYSTEM
            if (e.type === '@TIM#SYSTEM') {
              obj['msg'] = e.payload.extension
              obj['isMySelf'] = ''
              obj['photo'] = ''
            }
        }


        if (e.usertype === 'D') {//医生id

          obj['name'] = DOC.nick
          obj['isMySelf'] = DOC.ID == myID ? true : false;//判断当前自己是医生还是患者
          obj['photo'] = DOC.avatar ? DOC.avatar : icons

        } else if (e.usertype === 'P') {//患者id

          obj['name'] = PAT.nick
          obj['isMySelf'] = PAT.ID == myID ? true : false;
          obj['photo'] = PAT.avatar ? PAT.avatar : icons
        } else {//系统
          obj['isMySelf'] = false;
          obj['name'] = '系统'
          obj['photo'] = ''
        }


        arr.push(obj)
      }
      return arr;


    },
    getFileName (url) {
      var arr = url.split("/");
      var name = arr[arr.length - 1];
      return name;
    },
    size (sizes) {

      if (sizes > 1024) {
        if (sizes / 1024 > 1024) {
          return `${this.toFixed(sizes / 1024 / 1024)} Mb`
        }
        return `${this.toFixed(sizes / 1024)} Kb`
      }
      return `${this.toFixed(sizes)}B`
    },
    GetQueryString (name) {//获取路由参数
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
      var index = window.location.href.indexOf("?")
      var r = window.location.href.substr(index + 1).match(reg);
      if (r != null) {
        return decodeURIComponent(r[2]);
      }
      return null;
    },
    initInfo: function () {//初始化页面数据-获取医生、患者信息进行登录
      let t = this;
      let promise = new Promise(function (resolve, reject) {
        t.$axios({
          url: URLS.INFO(t.role, t.action),
          method: 'get',
          params: {
            id: t.groupID
          },
          timeout: 30000,
        }).then(res => {

          if (res.data.data) {
            let obj = res.data.data;
            t.recondDB = obj.chatRecords || []//后台聊天记录
            t.CHAT_STATUS = obj.status || obj.noticeState;
            if (t.action == 'consult') {
              t.form.Name = t.role == "doc" ? obj.doctorName : obj.patientName
              t.form.avatar = t.role == "doc" ? obj.docImgUrl : obj.userImgUrl
              t.form.userID = t.role == "doc" ? obj.doctorId : obj.patientId
            } else {
              t.form.Name = t.role == "doc" ? obj.doctorName : obj.userName
              t.form.avatar = t.role == "doc" ? obj.docImgUrl : obj.userImgUrl
              t.form.userID = t.role == "doc" ? obj.doctorId : obj.userId


            }


            t.groupName = t.action == "consult" ? "咨询" : "张榜" //群名字
            t.$store.dispatch('set_loginInfo', t.form)
            t.$store.commit("SET_ID", t.groupID)

            //自己信息
            t.myInfo = {
              'Name': t.form.Name,
              'avatar': t.form.avatar,
              'userID': t.form.userID,
            };

            //别人信息
            if (t.role == "doc") {//自己是医生，别人是患者
              //咨询字段:张榜字段，
              t.otherInfo = {
                'Name': obj.patientName ? obj.patientName : obj.userName,
                'avatar': obj.userImgUrl,
                'userID': obj.patientId ? obj.patientId : obj.userId,
              };
            } else {//自己是患者，别人是医生
              t.otherInfo = {
                'Name': obj.doctorName,
                'avatar': obj.docImgUrl,
                'userID': obj.doctorId,
              };
              if (obj.isConvertClinic === '1' && t.isFirst) {//咨询转门诊，患者已支付成功
                t.isFirst = false;
                t.$confirm('此订单已转成门诊订单，咨询业务已结束。是否跳转至门诊业务?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                  window.location.href = baseUrl + '/Platform_N/webHis/userTreatrecord/user/patient/toUserRegistration'
                }).catch(() => {

                });
              }
            }
            console.log('自己info', t.myInfo);
            console.log('其他人info', t.otherInfo);
            resolve(true);

          } else {

            switch (res.data.resultCode) {
              case "400":
                t.$store.commit('SET_ROOT', false)
                let msg = res.data.resultDesc ? res.data.resultDesc : "初始化数据失败！"
                t.$message.error(msg);
                break;
              case "501":
                t.$store.commit('SET_ROOT', false)
                t.$message.error("网医语登录已失效！");
                break;
              default:
                t.$message.error(res.data.resultDesc);
            }
            resolve(false);
          }
        }).catch(e => {

          t.$message.error('系统错误，初始化咨询数据失败');
          t.$store.commit('SET_ROOT', false)
          resolve(false);
        });


      });
      return promise;
    },
    getPath (str) {
      var result = '';
      //判断是否含义http：有则不补全端口
      if (!str) { //空
        return result;
      }
      if (str.indexOf('http:') > -1 || str.indexOf('https:') > -1) {
        return str;
      } else if (str.indexOf('base64') > -1) {//base64图片
        return str;
      } else {
        var p = str.slice(0, str.indexOf('/', 1))
        switch (p) {
          case "image"://腾讯IM图片
            result = IMbase + str;
            break;
          case 'Platform_N':
            result = baseUrl + '/' + str
            break;
          case '/Platform_N':
            result = baseUrl + str
            break;
          case 'wy':
            result = wyyUrl + '/Wylm_wyy/' + str
            break;
          case 'Wylm_wyy':
            result = wyyUrl + '/' + str
            break;
          case '/Wylm_wyy':
            result = wyyUrl + str
            break;
          default:
            result = baseUrl + '/Platform_N/' + str
        }

        return result;
      }

    },
    docFirstMsgMark () {//医生回复第一条信息时调用
      var t = this;

      t.$axios({
        url: URLS.DOC_FIRST_MSG(t.action),
        method: 'post',
        dataType: 'json',
        params: {
          id: t.groupID,//榜单id
        }
      })
        .then(res => {

          //console.log(res.data);
          if (res.data.resultCode == '200') {
            t.isDocFirstMsg = true
          }

        })
        .catch(e => {
          console.log("医生第一次回复接口err", e)
        })
    },
    initListener () {
      var t = this

      // 监听事件，例如：
      // 监听sdk已经初始化了
      this.tim.on(TIM.EVENT.SDK_READY, this.onReadyStateUpdate)

      this.tim.on(TIM.EVENT.SDK_NOT_READY, this.onReadyStateUpdate)
      this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, this.onMessageReceived) // 接收消息

      this.tim.on(TIM.EVENT.MESSAGE_REVOKED, function (event) {
        // 收到消息被撤回的通知
        // event.name - TIM.EVENT.MESSAGE_REVOKED
        // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
      })

      this.tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
        // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
        // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
        // event.data - 存储 Conversation 对象的数组 - [Conversation]
        // t.MessaggeList = event.data;
      })

      this.tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function (event) {
        // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
        // event.name - TIM.EVENT.GROUP_LIST_UPDATED
        // event.data - 存储 Group 对象的数组 - [Group]
        //t.Group = event.data
      })

      // 收到新的群系统通知
      // event.name - TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED
      // event.data.type - 群系统通知的类型，详情请参见 GroupSystemNoticePayload 的 operationType 枚举值说明
      // event.data.message - Message 对象，可将 event.data.message.content 渲染到到页面
      this.tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, this.onGroupSystemNoticeReceived)
      // 收到自己或好友的资料变更通知
      this.tim.on(TIM.EVENT.PROFILE_UPDATED, this.onProfileUpdate)

      this.tim.on(TIM.EVENT.BLACKLIST_UPDATED, function (event) {
        // 收到黑名单列表更新通知
        // event.name - TIM.EVENT.BLACKLIST_UPDATED
        // event.data - 存储 userID 的数组 - [userID]
      })

      this.tim.on(TIM.EVENT.ERROR, function (event) {
        // 收到 SDK 发生错误通知，可以获取错误码和错误信息
        // event.name - TIM.EVENT.ERROR
        // event.data.code - 错误码
        // event.data.message - 错误信息
      })


      // 下线监听
      this.tim.on(TIM.EVENT.KICKED_OUT, this.onCheckOut)

      this.tim.on(TIM.EVENT.NET_STATE_CHANGE, function (event) {
        //  网络状态发生改变（v2.5.0 起支持）。
        // event.name - TIM.EVENT.NET_STATE_CHANGE
        // event.data.state 当前网络状态，枚举值及说明如下：
        //     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
        //     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
        //    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
      })

      console.log('监听已启用！')

    },
    //群消息监听
    onGroupSystemNoticeReceived (event) {
      debugger;
      const type = event.data.type; // 群系统通知的类型，详情请参见 Message.GroupSystemNoticePayload 
      const message = event.data.message; // 群系统通知的消息实例，详情请参见 Message
      console.log(message.payload); // 消息内容. 群系统通知 payload 结构描述
    },
    onReadyStateUpdate (event) {
      // SDK ready
      const isSDKReady = event.name === this.TIM.EVENT.SDK_READY ? true : false
      this.$store.dispatch('setSDK', isSDKReady)


    },
    // 监听接收消息
    onMessageReceived ({ data: messageList }) {
      var t = this

      console.log('检测到消息', messageList);
      // var obj = {
      //   ID: "C2Cadministrator-815206821-19901224-0",
      //   conversationID: "C2Cadministrator",
      //   conversationType: "C2C",
      //   payload: {
      //     text: '{"msg":"已向用户发起【咨询转门诊】申请，用户补齐网诊差价后即可开始门诊业务。","doctorId":"87fd6cbcf2684fa8b21ea4440da893ec","orgId":"83912AAA60C15A68E053BEF0A8C09545"}',
      //   },
      //   type: "TIMTextElem",
      // }
      // messageList.push(obj);
      this.$store.commit('pushCurrentMessageList', messageList)
      this.updateMsg()
    },
    // 监听好友资料更新
    onProfileUpdate ({ data: Profile }) {
      var memberlist = this.$store.getters.getMemberList

      for (var i = 0; i < Profile.length; i++) {
        for (var j = 0; i < memberlist.length; j++) {
          if (Profile[i].userID === memberlist[j].userID) {
            memberlist[j]['nick'] = Profile[i]['nick']
            memberlist[j]['avatar'] = Profile[i]['avatar']
          }
        }
      }
      this.$store.dispatch('set_memberList', memberlist) // 更新群用户列表
      this.updateMsg()
    },
    onCheckOut (event) {
      console.log('被踢下线了', event)
      var t = this
      if (event.name === TIM.EVENT.KICKED_OUT) {
        let str = ''
        switch (event.data.type) {
          case TIM.TYPES.KICKED_OUT_MULT_ACCOUNT:
            str = '下线了,当前账号在其他地方登陆了'
            break
          case TIM.TYPES.KICKED_OUT_MULT_DEVICE:
            str = '多终端登录被踢'
            break
          case TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED:
            str = '签名过期被踢'
            break
          default:
            str = '当前账号被踢下线了'
        }

        var msgObj = {
          conversationID: t.$store.getters.getConversationID,
          type: 'TIMGroupTipElem',
          payload: {
            extension: str
          }
        }

        t.$store.commit('UPDATE_MSG', msgObj)
        t.$message.error(str)
        t.updateMsg()

        t.$store.commit('SET_LINETATUS', false)
      }
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如:
      //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。
    },
    // 登陆
    Login () {
      // 开始登录

      var t = this
      console.log('登陆前：', t.OKStatus)
      if (t.OKStatus.online === true) {
        // 在线
        if (t.OKStatus.SDK === true) {
          t.loading = false
          t.getGroup()
        }
      } else {
        // 离线

        if (!t.form.userID) {
          t.loading = false
          t.$message.error('登录id缺失，聊天服务启动失败!')

          return false
        }
        console.log('开始获取userSig')

        this.$axios({
          method: 'get',
          dataType: 'json',
          url: URLS.GET_USERSIG,
          params: {
            identifier: t.form.userID
          },
          headers: {
            userSigToken: 'TMWAZ4J2hHt9YF2AjGB2do6EdGDHGLESWNFOSWFOAE'
          }
        })
          .then(res => {
            console.log('获取userSig请求结果：', res)
            if (res.data.resultCode === '200' && res.data.data) {
              t.tim
                .login({
                  userID: t.form.userID,
                  userSig: res.data.data
                })
                .then(function (imResponse) {
                  console.log('登录成功：', imResponse.data) // 登录成功
                  t.$store.commit('SET_LINETATUS', true)// 设置在线


                })
                .catch(function (imError) {
                  t.loading = false
                  console.warn('login error:', imError) // 登录失败的相关信息

                  var str = imError + ''
                  if (str.indexOf('帐号数超限。如需创建多于100个帐号，请将应用升级为专业版，具体操作指引请参见购买指引') > -1) {
                    t.$message.error('系统错误：系统账号超出100个了，进入诊室失败！')
                  } else {
                    t.$message.error(imError)
                  }
                })
            } else {
              t.$message.error('系统错误，登录请求失败！')
            }
          })
          .catch(e => {
            t.$message.error('系统错误，账号令牌获取失败！')
            console.log('令牌获取失败，userSig', e)
          })
      }

    },
    //展示进度栏
    showProgressBar (data) {
      return data.status === 'unSend'
    },
    //计算比例
    percentage (data) {
      return Math.floor((data || 0) * 100)
    },
    disMisGroup (groupID) {
      var t = this

      let promise = this.tim.dismissGroup(groupID)
      promise
        .then(function (imResponse) {
          // 解散成功
          console.log('解散成功', imResponse.data.groupID) // 被解散的群组 ID

        })
        .catch(function (imError) {
          console.warn('dismissGroup error:', imError) // 解散群组失败的相关信息
        })
    },
    checkAcc () {

      var t = this
      var promise = new Promise(function (resolve, reject) {
        console.log('进行账号监测.....')
        let icon = t.otherInfo.avatar ? t.otherInfo.avatar : icons
        console.log("对方账号：", t.otherInfo);
        t.$axios({
          url: URLS.CHECK_ACC,
          method: 'post',
          dataType: 'json',
          params: {
            account: t.otherInfo.userID,
            nickName: t.otherInfo.Name,
            faceUrl: icon
          }
        })
          .then(res => {
            if (res.data.data == 1) {
              var flag = res.data.resultCode
              resolve(flag)
            } else {
              if (res.data.data == -1) {
                t.$message.error("系统err:账号已经满,无法创建新账号进行聊天！");
              }
              resolve(false)
            }

          })
          .catch(e => {
            console.log('账号监测失败：', e)
            resolve('400')
          })
      })
      return promise
    },
    // 查询群组
    getGroup () {
      var t = this
      // 该接口默认只会拉取这些资料：群类型、群名称、群头像、最后一条消息的时间。
      console.log('开始查询群list')
      var promise = t.tim.getGroupList()

      promise
        .then(function (imResponse) {
          console.log('群组list：', imResponse.data.groupList) // 群组列表
          t.Group = imResponse.data.groupList
          if (imResponse.data.groupList.length === 0) {
            t.createGroup()
          } else {

            var list = imResponse.data.groupList
            let result = list.filter(e => e.groupID === t.groupID)
            if (result.length > 0) {
              // 存在该群
              console.log('找到群，t.groupID：', t.groupID) // 群组列表
              let conversationID = 'GROUP' + t.groupID
              t.$store.dispatch('set_stationId', conversationID) // 设置会话id


              var pro3 = t.UpdateInfo() // 更新患者的-头像，昵称等信息

              Promise.all([pro3]).then(values => {
                console.log('有群-重新信息更改完毕：', values) //
                t.getMemberlistInfo() // 获取群成员信息
                t.SearchGroup(t.groupID) // 查询当前进入的群
                t.getRcond() // 第一次加载15条历史记录
              })
            } else {
              // 不存在该群
              console.log('群组list不存在，新建群=>')
              t.createGroup()
            }
          }
        })
        .catch(function (imError) {
          console.warn('getGroupList error:', imError) // 获取群组列表失败的相关信息
        })
    },
    // 创建群
    createGroup () {
      var t = this
      t.checkAcc().then(function (res) {
        console.log('后台创建未注册的账号-返回：', res)
        if (res === '200') {
          var memberLists = [
            { userID: t.otherInfo.userID },
            { userID: t.myInfo.userID }
          ]
          var promise = t.tim.createGroup({
            type: TIM.TYPES.GRP_PUBLIC,
            name: t.groupName,
            groupID: t.groupID,
            memberList: memberLists, // 如果填写了 memberList，则必须填写 userID
            joinOption: TIM.TYPES.JOIN_OPTIONS_FREE_ACCESS
          })

          promise
            .then(imResponse => {
              // 创建成功
              console.log('创建群ok：', imResponse.data.group) // 创建的群的资料
              let conversationID = 'GROUP' + t.groupID // 会话id
              t.$store.dispatch('set_stationId', conversationID)


              var pro3 = t.UpdateInfo() // 更新患者的-头像，昵称等信息

              Promise.all([pro3]).then(values => {
                console.log('信息更改完毕：', values) //
                t.getMemberlistInfo() // 获取群成员信息
                t.getRcond() // 第一次加载15条历史记录
              })
            })
            .catch(error => {
              console.warn('createGroup error:', error) // 创建群组失败的相关信息
            })
        } else {
          t.$message.error('参数错误，聊天连接失败!')
        }
      })
    },
    // 获取成员列表信息
    getMemberlistInfo () {
      var t = this

      let promise = this.tim.getGroupMemberProfile({
        groupID: t.groupID,
        userIDList: [t.myInfo.userID, t.otherInfo.userID]
      })
      promise
        .then(function (imResponse) {
          t.$store.dispatch('set_memberList', imResponse.data.memberList) // vuex记录群成员列表资料
          console.log('群成员列表：', imResponse.data.memberList) // 群成员列表
        })
        .catch(function (imError) {
          console.warn('getGroupMemberList error:', imError)
        })
    },
    // 修改个人标配资料
    UpdateInfo () {

      var t = this
      var hasIcon = false
      if (this.form.avatar && this.form.avatar !== 'null') {
        // 有头像  //患者无头像，使用默认头像
        hasIcon = true
      }
      var icons = t.getPath(this.form.avatar);
      console.log('患者信息修改：', t.form.Name, icons)
      var promise = this.tim.updateMyProfile({
        nick: t.form.Name,
        avatar: hasIcon ? icons : '' // 不能是base64图片,超过500个字符会报40601	【资料字段的 Value 长度超过500字节。】
        // gender: TIM.TYPES.GENDER_MALE,
        // selfSignature: "我的个性签名",
        // allowType: TIM.TYPES.ALLOW_TYPE_ALLOW_ANY
      })

      promise
        .then(function (imResponse) {
          console.log('更新（自己）头像成功:', imResponse.data) // 更新资料成功
        })
        .catch(function (imError) {
          console.warn('updateMyProfile error:', imError) // 更新资料失败的相关信息
        })
      return promise
    },
    // 修改群名片
    setMemberInfo (groupIDs, userIDs, nameCards) {
      let promise = this.tim.setGroupMemberNameCard({
        groupID: groupIDs,
        userID: userIDs,
        nameCard: nameCards
      })
      // console.log(groupIDs, userIDs, nameCards);
      promise
        .then(function (imResponse) {
          console.log('群成员资料修改完成==>', userIDs, nameCards)
          //  console.log(imResponse.data.group); // 设置后的群资料
          // console.log("修改后的群成员资料", imResponse.data.member); // 修改后的群成员资料
        })
        .catch(function (imError) {
          console.warn('setGroupMemberNameCard error:', imError) // 设置群成员名片失败的相关信息
        })
      return promise
    },
    // 查询群信息
    SearchGroup (groupID) {
      let promise = this.tim.searchGroupByID(groupID)
      promise
        .then(function (imResponse) {
          const group = imResponse.data.group // 群组信息
          console.log('当前进入的群：', group)
        })
        .catch(function (imError) {
          console.warn('searchGroupByID error:', imError) // 搜素群组失败的相关信息
        })
    },

    chooseEmoji (item) {
      this.messageContent += item
    },
    preFinish () {
      this.$confirm('是否确认结束此对话?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.finish();
      }).catch(() => {

      });
    },
    //咨询结束(后台结束，前端控制显示)
    consultFinish () {
      var t = this;
      if (!t.isFinish) {
        //发送总结结束标记
        console.log('@@@@@')
        if (t.role == 'user') {
          t.messageContent = "@~聊天结束"
          setTimeout(function () {
            t.sendTextMessage();
            t.$store.commit('SET_CHAT_STATUS', true);//设置聊天完成
            t.initInfo();
          }, 50)

        }



      }


    },
    //结束（前端调接口结束）
    finish () {


      var t = this;
      let url;

      if (t.action == "notice") {
        url = URLS.FINISH_NOTICE(t.role)

      } else if (t.action == "consult") {
        url = URLS.FINISH_CONSULT(t.role)

      } else {
        t.$message.error("6系统错误！");
        return false;
      }


      this.$axios({
        method: 'post',
        dataType: 'json',
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [function (data) {
          data = JSON.stringify(data)
          return data
        }],
        data: { id: t.groupID },//榜单id
      })
        .then(response => {

          response = response.data;
          if (t.action == "notice") {//揭榜
            switch (response.resultCode) {
              case "200":

                t.$store.commit('SET_CHAT_STATUS', true);//设置聊天完成
                t.$message.success('结束成功');
                //发送总结结束标记
                t.messageContent = "@~聊天结束"
                t.sendTextMessage();

                break;
              case "201":
                t.$store.commit('SET_CHAT_STATUS', true)
                t.$message.success(response.resultDesc);
                //发送总结结束标记
                t.messageContent = "@~聊天结束"
                t.sendTextMessage();

                break;
              case "501":
                //未登录
                window.location.reload();
                break;
              default:
                t.$message.warning(response.resultDesc);
            }

          } else if (t.action == "consult") {//咨询

            var tips = `您可以将咨询的结果发表，并为这次咨询定价，定价可以是零即免费，
            也可以是任意价格，一旦有人付费浏览，则收入的45 % 将自动打入${t.role == "doc" ? "患者" : "您"}的账户，
            其余35 % 归咨询的医生，20 % 归平台，所得税各自承担。`

            switch (response.resultCode) {
              case "200": case "201":
                //发送总结结束标记
                t.messageContent = "@~聊天结束"
                t.sendTextMessage();

                t.$store.commit('SET_CHAT_STATUS', true);//设置聊天完成

                t.$alert('<div class="tips">' + tips + '</div>', '温馨提示', {
                  dangerouslyUseHTMLString: true,
                  confirmButtonText: '确定',
                  callback: action => {

                    t.$message.success(response.resultDesc)
                  }
                });



                break;
              case "501"://未登录
                t.$store.commit('SET_ROOT', false)
                break;
              default:
                t.$message.warning(response.resultDesc);
            }
          }




        })
        .catch(e => {

          t.$message.error('系统错误！')

        })
    },
    //发送自定义消息
    sendCustomMessage (str, description, extension) {
      var t = this;
      if (!t.lineStatus) {
        t.$message.error('已经掉线,请重新进入！')
        return false
      }
      // 创建消息实例，接口返回的实例可以上屏
      let message = tim.createCustomMessage({
        to: t.groupID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          data: str, // 自定义消息的数据字段
          description: description, // 自定义消息的说明字段
          extension: extension//自定义消息的扩展字段
        }
      });
      // 3. 发送消息
      let promise = this.tim.sendMessage(message);
      t.$store.commit("UPDATE_MSG", message)
      t.updateMsg() // 更新渲染界面

      //标记医生第一陈回复（可重复调）
      if (!t.isDocFirstMsg && t.role == 'doc') {
        t.docFirstMsgMark();
      }

      promise.then(function (imResponse) {
        // 发送成功
        console.log(imResponse);
      }).catch(function (imError) {
        // 发送失败
        console.warn('sendMessage error:', imError);
      });


    },
    //发送消息
    sendTextMessage () {
      var t = this
      if (!t.lineStatus) {
        t.$message.error('已经掉线,请重新进入！')
        return false
      }

      var err = XSSvalidate(t.messageContent);//特殊字符校验 &非空
      if (err) {
        t.$message.error(err)
        return
      }
      console.log("发送的内容：", t.messageContent)
      // 发送文本消息，Web 端与小程序端相同
      // 1. 创建消息实例，接口返回的实例可以上屏
      var message = this.tim.createTextMessage({
        to: t.groupID,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          text: t.messageContent.trim()
        }
      })

      // 2. 发送消息
      let promise = this.tim.sendMessage(message,
        {
          // 如果接收方不在线，则消息将存入漫游，且进行离线推送（在接收方 App 退后台或者进程被 kill 的情况下）。接入侧可自定义离线推送的标题及内容
          offlinePushInfo: {
            extension: t.groupID, // 离线推送内容
          }
        }
      )

      t.$store.commit("UPDATE_MSG", message)
      t.updateMsg() // 更新渲染界面

      //标记医生第一陈回复（可重复调）
      if (!t.isDocFirstMsg && t.role == 'doc') {
        t.docFirstMsgMark();
      }


      promise
        .then(function (imResponse) {
          // 发送成功
          t.messageContent = ''
          console.log('消息发送成功~')

        })
        .catch(function (imError) {
          // 发送失败
          console.warn('sendMessage error:', imError)
          t.$message.error('系统错误，发送消息不成功')
        })
    },
    //发送图片
    handleSendImageClick () {
      this.$refs.imagePicker.click()
    },
    //发送文件
    handleSendFileClick () {
      this.$refs.filePicker.click()
    },
    sendImage () {
      var t = this;
      //标记医生第一陈回复（可重复调）
      if (!t.isDocFirstMsg && t.role == 'doc') {
        t.docFirstMsgMark();
      }
      const message = this.tim.createImageMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          file: document.getElementById('imagePicker') // 或者用event.target
        },
        onProgress: percent => {

          this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress
        }
      })

      t.$store.commit("UPDATE_MSG", message)
      setTimeout(function () {
        var div = t.$refs.msgDiv
        div.scrollTop = div.scrollHeight
      }, 50)
      this.tim
        .sendMessage(message)
        .then(() => {
        })
        .catch(imError => {
          t.$message.error(imError.message);

        })
      this.$refs.imagePicker.value = null
    },
    sendFile () {
      var t = this;

      const message = this.tim.createFileMessage({
        to: this.toAccount,
        conversationType: this.currentConversationType,
        payload: {
          file: document.getElementById('filePicker') // 或者用event.target
        },
        onProgress: percent => {
          this.$set(message, 'progress', percent) // 手动给message 实例加个响应式属性: progress

        }
      })

      //标记医生第一陈回复（可重复调）
      if (!t.isDocFirstMsg && t.role == 'doc') {
        t.docFirstMsgMark();
      }
      t.$store.commit("UPDATE_MSG", message)
      setTimeout(function () {
        var div = t.$refs.msgDiv
        div.scrollTop = div.scrollHeight
      }, 50)
      this.tim
        .sendMessage(message)
        .then(() => {
        })
        .catch(imError => {
          t.$message.error(imError.message);
        })
      this.$refs.filePicker.value = null
    },
    //获取聊天历史记录（分页）
    getRcond () {
      var t = this
      if (!t.lineStatus) {

        return false
      }

      // 打开某个会话时，第一次拉取消息列表
      var conversationID = this.$store.getters.getConversationID
      var promise
      if (!t.nextReqMessageID && !t.isCompleted) {
        // 第一次
        promise = tim.getMessageList({
          conversationID: conversationID,
          count: 15
        })
      } else if (t.nextReqMessageID && !t.isCompleted) {
        // 下拉查看更多消息
        var nextReqMessageID = t.nextReqMessageID
        promise = tim.getMessageList({
          conversationID: conversationID,
          nextReqMessageID,
          count: 15
        })
      }

      promise.then(function (imResponse) {
        const messageList = imResponse.data.messageList // 消息列表。
        t.nextReqMessageID = imResponse.data.nextReqMessageID // 用于续拉，分页续拉时需传入该字段。
        t.isCompleted = imResponse.data.isCompleted // 表示是否已经拉完所有消息。
        t.$store.commit('RECOND', messageList) // 合并历史记录和现在的消息

        t.updateMsg()
      })
    },
    // 更新渲染聊天记录
    updateMsg () {
      var t = this
      this.messageRecond = this.$store.getters.getMsg

      setTimeout(function () {
        var div = t.$refs.msgDiv
        div.scrollTop = div.scrollHeight
      }, 50)
    },
    // 查看放大图片
    scanImg: function (path) {

      this.$alert(`<div class="IMGDiv"><img src="${path}"/></div>`, '查看', {
        dangerouslyUseHTMLString: true
      });
    },
    downLoadFile (data) {

      console.log('文件路径', data.msg)
      // 浏览器支持fetch则用blob下载，避免浏览器点击a标签，跳转到新页面预览的行为
      if (window.fetch && !this.isFinish) {
        fetch(data.msg)
          .then(res => res.blob())
          .then(blob => {
            let a = document.createElement('a')
            let url = window.URL.createObjectURL(blob)
            a.href = url
            a.download = data.textname
            a.click()
          })
      } else {
        let a = document.createElement('a')
        a.href = data.msg
        a.target = '_blank'
        a.download = data.textname
        a.click()
      }
    },
    //患者-张榜评价
    evaluation () {
      var t = this;

      this.$axios({
        method: 'post',
        dataType: 'json',
        url: URLS.EVALUATION,
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [function (data) {
          data = JSON.stringify(data)
          return data
        }],
        data: {
          "id": t.groupID,
          "evaluation": t.evaluationVal
        }

      })
        .then(response => {

          response = response.data;
          if (response.resultCode == 200) {
            t.hasEvaluation = true;
          } else {
            t.$message.error(response.resultDesc)
          }
        })
        .catch(e => {

          t.$message.error('系统错误！')

        })
    },
    closeFAQ () {
      this.toFaqFlag = false;
    },
    setFAQ (flag) {
      this.$store.commit('SET_FAQ_STATUS', flag)
    },
    //发布到问答集锦/isCheck==true时，表示只是单纯调接口查询聊天是否结束
    sendFaq (checkChat) {
      var t = this;
      var URL = URLS.INFO(t.role, t.action);

      this.$axios({
        method: 'get',
        dataType: 'json',
        url: URL,
        params: {
          "id": t.groupID,//榜单id
        },
        timeout: 30000,

      }).then(response => {
        let data = response.data;
        if (data.resultCode == '501') {//未登录

          t.$store.commit('SET_ROOT', false)

        } else {
          if (checkChat) {

            switch (t.action) {
              case "consult":
                if (data.data.status == '4') {
                  /*状态判断 // 咨询 : -1：已取消，0：未支付，1：已支付，2：未回复，3,：已回复，4：已完成*/
                  t.$store.commit('SET_CHAT_STATUS', true);
                  t.initInfo();//初始化数据
                }
                break;
              case "notice":
                if (data.data.noticeState == '4') {
                  /*状态判断 // 张榜 ：-1：已取消，1：未支付，2：未揭榜，3：已揭榜，4：完成*/
                  t.$store.commit('SET_CHAT_STATUS', true)
                }
                break;
            }


          } else {
            if (data.data) {
              if (data.data.faqState == '1') {
                let other = t.role == "doc" ? "患者" : "医生"
                t.$message.success(other + '已经发布过问答集锦，无需再发布！')
                t.setFAQ(true);


              } else {
                t.faqInfo = data.data;
                t.toFaqFlag = true;//FAQ弹窗
                return false;

              }
            } else {
              t.$message.error("无法查询到榜单信息！")
            }
          }
        }

      }).catch(e => {

        t.$message.error('XXXXX系统错误！')

      })


    },
    //分享
    share () {
      var t = this;
      let url = t.$store.state.docHomePageUrl
      let imgs = t.myInfo.avatar
      this.config = {
        url: url, // 网址，默认使用 window.location.href
        source: '网医联盟', // 来源（QQ空间会用到）, 默认读取head标签：<meta name="site" content="http://overtrue" />
        title: '我在【网医语】回答了患者的问题，感觉该网站超级好用耶。咨询的内容还可以发表，别人付费浏览，赚点小外快哦。快来体验吧。', // 标题，默认读取 document.title 或者 <meta name="title" content="share.js" />
        description: '我在【网医语】回答了患者的问题，感觉该网站超级好用耶。咨询的内容还可以发表，别人付费浏览，赚点小外快哦。快来体验吧。', // 描述, 默认读取head标签：<meta name="description" content="PHP弱类型的实现原理分析" />
        image: imgs, // 图片, 默认取网页中第一个img标签
        sites: ['qzone', 'weibo', 'wechat'], // 启用的站点
        disabled: [], // 禁用的站点
        wechatQrcodeTitle: '微信扫一扫：分享', // 微信二维码提示文字
        wechatQrcodeHelper: '<p>微信里点“发现”，扫一下</p><p>二维码便可将本文分享至朋友圈。</p>'
      }
      this.$set(this, 'config', t.config)

      this.isShare = true;



    },
    //咨询转门诊
    toClnic () {
      var t = this;
      //咨询转门诊，信息查询
      t.$confirm('转门诊业务可以开具处方,患者需要补齐网诊差价，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        t.loading = true;
        t.$axios({
          method: 'post',
          dataType: 'json',
          url: URLS.CLINIC,
          params: {
            consultId: t.groupID
          },

        }).then(response => {
          t.loading = false;
          let data = response.data;
          switch (data.resultCode) {
            case "501"://未登录、登录过期
              t.$message.error(data.resultDesc)
              t.$store.commit('SET_ROOT', false)
              break;
            case "400"://错误提示
              t.$message.success(data.resultDesc)
              break;
            case "200":
              if (data.data) {//申请通过
                console.log('咨询转门诊操作成功！')
              }
              break;
            default:
              t.$message.error("系统错误，操作失败！")

          }


        }).catch(e => {
          t.loading = false;
          t.$message.error('系统错误！')

        })



      }).catch(() => {//取消

      });



    },
    timeCount (time) {
      var t = this;
      //当前时间
      var today = new Date();
      var now = today.getTime()
      if (now - time <= 30 * 60 * 1000) {//30min内---订单有效
        t.isSendClinic = true;
        var leftTime = (time + 30 * 60 * 1000 - now) / 1000;//剩余时间-秒
        var timer = setInterval(function () {
          leftTime = leftTime - 1;
          if (leftTime === 0) {
            t.isSendClinic = false;
            clearInterval(timer);
          }

        }, 1000);


      } else {//30min外---订单失效
        t.isSendClinic = false;

      }






    },



  }
}

</script>

<style >
.chat {
  height: 100%;
  border: 0.1px solid #eaeaea;
  box-sizing: border-box;
}
.el-dialog__footer {
  text-align: center;
}
p {
  padding: 0;
  margin: 0;
}
h4 {
  padding: 0;
  margin: 0;
  text-align: left;
  font-weight: 400;
}
.tips {
  width: 500px;
}
.c-title {
  height: 40px;
  border-bottom: 1px solid gainsboro;
  background: white;
  padding: 10px;
  font-size: 15px;
  height: 40px;
  box-sizing: border-box;
}
.c-contant {
  height: calc(100% - 165px);
  background: white;
  overflow-y: auto;
}
.icon-smile {
  background: url("~@/assets/icon-smile.png") no-repeat;
  display: inline-block;
  background-size: 26px 26px;
  width: 28px;
  height: 28px;
  vertical-align: top;
}
.c-sendBox {
  height: 125px;
}
.c-sendBox-top {
  text-align: left;
  padding: 5px;
  background: #eaeaea;
  position: relative;
}

.c-sendBox-bottom {
  position: relative;
  background: white;
  min-height: 87px;
  text-align: left;
  font-size: 14px;
  box-sizing: border-box;
}
.emoji {
  display: inline-block;
}
.icon-tupian {
  background: url("~@/assets/icon-img.png") no-repeat;
  display: inline-block;
  background-size: 28px 28px;
  width: 28px;
  height: 28px;
  vertical-align: top;
  margin-left: 6px;
}
textarea.text-input {
  font-size: 16px;
  width: 100%;
  -webkit-box-sizing: box-sizing;
  box-sizing: box-sizing;
  border: none;
  outline: none;
  box-sizing: border-box;
  resize: none;
}
.btn-send {
  cursor: pointer;
  position: absolute;
  color: #2d8cf0;
  font-size: 30px;
  right: 15px;
  bottom: 0;
  padding: 2px 5px;
  border-radius: 50%;
}
.icon-send {
  background: url("~@/assets/icon-send.png") no-repeat;

  display: inline-block;
  background-size: 33px 35px;
  width: 35px;
  height: 35px;
  vertical-align: top;
  margin-left: 6px;
}
.icon-file {
  background: url("~@/assets/icon-file.png") no-repeat;
  display: inline-block;
  background-size: 28px 28px;
  width: 28px;
  height: 28px;
  vertical-align: top;
  margin-left: 6px;
}
.icon-finish {
  background: url("~@/assets/icon-finish.png") no-repeat;
  display: inline-block;
  background-size: 28px 28px;
  width: 28px;
  height: 28px;
  vertical-align: top;
  margin-left: 6px;
}
.icon-clinic {
  background: url("~@/assets/icon-clinic.png") no-repeat;
  display: inline-block;
  background-size: 30px 30px;
  width: 30px;
  height: 28px;
  vertical-align: top;
  margin-left: 6px;
}
/*聊天栏 */
.message-list {
  position: relative;
  height: 100%;
  box-sizing: border-box;
}
.Morebtn {
  height: 20px;
}
.Morebtn label {
  color: #277de4;
  font-size: 14px;
  cursor: pointer;
}
.MsgDiv {
  height: calc(100% - 20px);
  overflow: auto;
}
.message-item {
  padding: 2px 3px;
}
.avatar {
  display: inline-block;
  background: #eaebec;
  width: 30px;
  height: 30px;
  border: none;
  float: left;
}
.reverse .avatar {
  float: right;
}
.col {
  display: block;
  overflow: hidden;
  margin-bottom: 10px;
}
.msgGroup {
  float: left;
  text-align: left;
  max-width: 85%;
}
.reverse .msgGroup {
  float: right;
}
span.my.nickName {
  float: right;
  text-align: right;
}

.nickName {
  font-size: 14px;
  color: #adadad;
  float: left;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 5px;
}
.title {
  clear: both;
  min-width: 20px;
  min-height: 26px;
  position: relative;
  margin: 0 10px;
  text-align: left;
  float: left;

  display: inline-block;
  color: #040404;
  background: #bbeaff;
  font-size: 15px;
  border-radius: 0.066667rem;
  word-break: break-all;
  margin-top: 5px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.title > p {
  padding: 6px;
}
.reverse .title {
  float: right;
  background: #ddf5c2;
}
.right:after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  right: -7px;
  top: 0rem;
  display: inline-block;
  border-top: 0 solid transparent;
  border-left: 7px solid #ddf5c2;
  border-bottom: 7px solid transparent;
  border-right: 0;
}
.left:after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  top: 0rem;
  left: -9px;
  display: inline-block;
  border-top: 0px solid transparent;
  border-right: 9px solid #bbeaff;
  border-bottom: 9px solid transparent;
  border-left: 0;
}
span.tipsMessage {
  font-size: 12px;
  color: #a0a0a0;
  display: inline-block;
  padding: 5px 10px;
  border-radius: 7px;
}
.imgs {
  min-width: 50px;
  height: auto;
  max-width: 300px;
}
.file span {
  color: #409eff;
  text-decoration: underline;
  cursor: pointer;
}
p.size {
  font-size: 14px;
  text-decoration: none;
  display: block;
  text-align: right;
  color: #5f5c5d;
  padding: 2px;
}
.el-message-box {
  width: auto !important;
  min-width: 200px !important;
  max-height: 90% !important;
  max-width: 62% !important;
}
.el-message-box__header {
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}
.IMGDiv {
  text-align: center;
}
.IMGDiv img {
  min-height: 100%;
  width: auto;
  max-width: 100%;
  max-height: 650px;
}
.el-message-box__btns {
  text-align: center !important;
}
.text-input {
  font-size: 14px;
  font-family: 微软雅黑;
}
.IMG-P {
  text-align: center;
  min-width: 120px;
}
.btn-send-eval {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 14px;
  padding: 6px;
  z-index: 999;
  background: #418bee;
  color: white;
  cursor: pointer;
  border-radius: 2px;
}
/*聊天栏 end*/
</style>