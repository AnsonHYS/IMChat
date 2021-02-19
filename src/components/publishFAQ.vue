<template>
  <el-dialog title="发布问答集锦"
             :close-on-click-modal="false"
             :show-close="false"
             :visible.sync="dialogVisible"
             width="1000px">
    <div class="cons">

      <div class="ceil">
        <label><b class='red'>*</b>标题：</label>
        <input type="text"
               class="titleInput"
               v-model="form.faqTitle"
               maxlength="255" />
        <b class='red'
           v-if='form.faqTitle'>{{form.faqTitle.length}}/255</b>
      </div>
      <div class="ceil"><label>需要内容：</label>
        <span v-if="action=='consult'"
              class="ceil-con">{{faqInfo.illnessDesc}}</span>
        <span v-if="action=='notice'"
              class="ceil-con">{{faqInfo.contentString}}</span>
      </div>
      <div class="ceil">
        <label></label>
        <div class="imglist">
          <img v-for="(L,i) in IMGList"
               :key="i"
               class="img"
               :src="getPath(L.imgpath)"
               @click="view(L.imgpath)" />
        </div>
        <div class="filelist">
          <a v-for="(L,i) in FILEList"
             :key="i"
             :href="L.imgpath">{{getFileName(L.imgpath)}}
          </a>
        </div>
      </div>
      <div class="ceil">
        <label>聊天记录：</label>
        <div class="chatInfo">
          <div v-for="(L,i) in messages"
               :key='i'
               :class="[{'docP': L.usertype=='D' },'permsg']">

            <img :src="getPath(L.photo)"
                 v-if="L.usertype!='admin'"
                 class="icon" />

            <p v-if="L.type == TIM.TYPES.MSG_CUSTOM"
               v-html="L.msg"></p>
            <p v-if="L.type==TIM.TYPES.MSG_TEXT"
               v-html="L.msg"></p>
            <p v-if="L.type==TIM.TYPES.MSG_IMAGE">
              <img :src="L.msg"
                   class="imgs" />
            </p>
            <p v-if="L.type==TIM.TYPES.MSG_FILE">{{L.textname}}</p>
            <p v-if="L.type==TIM.TYPES.MSG_AUDIO">
              <video :src="L.msg"
                     controls="controls">
                您的浏览器不支持 video 标签。
              </video>
            </p>
            <p v-if="L.type==TIM.TYPES.MSG_VIDEO">
              <audio controls
                     class="sound">
                <source :src="L.msg"
                        type="audio/mpeg" />
                您的浏览器不支持 audio 元素。
              </audio>
            </p>
          </div>

        </div>
      </div>
      <div class="ceil">
        <label>关键词：</label>
        <button id="F_Addkey"
                @click="addKey">添加关键词</button>
        <div class="keyList">
          <input type="text"
                 class="keyVal"
                 v-for="(L,i) in form.keyWordList"
                 :key="i"
                 v-model="L.dictName">
        </div>
      </div>

      <div class="ceil">
        <label><b class='red'>*</b>问答集锦金额：</label>
        <input type="number"
               v-model="form.price"
               placeholder="输入金额" />元
      </div>
      <div class="ceil">
        <label>回答问题专家：</label>

        <span v-if="action=='consult'">{{faqInfo.doctorName}}----{{faqInfo.profession}}</span>
        <span v-if="action=='notice'">
          {{faqInfo.doctorName}}----{{role=="doc"?faqInfo.doctorTitle:faqInfo.levelName}}
        </span>

      </div>
    </div>
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="close()">取 消</el-button>
      <el-button type="primary"
                 @click="publish()">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { baseUrl, wyyUrl, IMbase } from '@/utils/baseUrl'
import { emojiMap, emojiName, emojiUrl } from '@/utils/emojiMap'
import { decodeText } from '@/utils/decodeText'
import icons from '@/assets/icon_user.png'
var FAQ_URL = {
  PUT_FAQ: function (role) {//发布问答集锦-获取咨询信息
    var str;
    switch (role) {
      case 'doc':
        str = wyyUrl + "/Wylm_wyy/wy/doc/addOneFaq";//医生-发布问答集锦
        break;
      case 'user':
        str = wyyUrl + "/Wylm_wyy/wy/patient/addOneFaq";//获取咨询信息-患者
        break;

    }
    return str
  },

}
export default {
  name: "FAQ",
  props: {
    'flag': {
      required: true
    },
    'role': {// doc /user
      required: true
    },
    'action': { // consult/notice
      required: true
    },
    'faqInfo': {//初始化数据
      required: true
    },
    'ID': {//榜单id
      required: true
    }
  },

  data () {
    return {
      dialogVisible: false,//弹窗标记

      form: {
        price: "",
        businessId: "",
        faqTitle: "",
        businessType: "",// 业务类型：1张榜咨询，2三师咨询
        keyWordList: []
      },
      messageList: [],//对话列表

    }
  },
  watch: {
    'flag': {
      handler: function (newVal, oldVal) {
        if (newVal) {
          this.dialogVisible = true;
          this.initInfo();
          this.getRcond();//获取对话列表
        }
      },
      deep: true,
    },




  },
  created () {

  },
  computed: {
    IMGList: function () {
      var arr = []
      if (this.faqInfo.wnimgdtlList) {
        var list = this.faqInfo.wnimgdtlList
        if (list && list.length > 0) {
          for (var i = 0; i < list.length; i++) {
            if (this.isImg(list[i].imgpath)) {
              arr.push(list[i]);
            }
          }
        }

      }
      return arr
    },
    FILEList: function () {
      var arr = []
      if (this.faqInfo.wnimgdtlList) {
        var list = this.faqInfo.wnimgdtlList
        if (list && list.length > 0) {
          for (var i = 0; i < list.length; i++) {
            if (!this.isImg(list[i].imgpath)) {
              arr.push(list[i]);
            }
          }
        }
      }
      return arr
    },
    memberList () {
      var list = this.$store.getters.getMemberList
      return list
    },
    messages: function () {
      var t = this
      var arr = [];
      // console.log("聊天信息", this.messageList);
      arr = this.init_DBChatRec(this.messageList)


      return arr
    }
  },
  methods: {
    getRcond () {
      var t = this

      this.messageList = this.faqInfo.chatRecords//this.$store.getters.getMsg;

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

                    // t.sendFaq(true);//单纯查询聊天是否结束
                  }
                  break
                case 'img':
                  str += `<img src='${olist[k].src}'/>`
                  break
              }
            }
            obj['msg'] = str

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
            var data = e.payload

            if (data.extension === '' && data.data) {
              console.log('自定义消息', data.data)

            } else {
              switch (data.data) {
                case 'group_create':
                  obj['msg'] = '可以聊天了'
                  break
                default:
                  obj['msg'] = e.payload.extension
              }
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
          } else {
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
          obj['name'] = e.from
          obj['photo'] = ''
        }

        arr.push(obj)
      }
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
        obj['usertype'] = e.usertype ? e.usertype : "admin"
        // 发送的消息
        switch (e.msgtype) {
          case 'imag': // "TIMImageElem":
            obj['type'] = TIM.TYPES.MSG_IMAGE
            obj['msg'] = t.getPath(e.msg)

            obj['msgBig'] = t.getPath(e.msg)
            break
          case 'text': // "TIMTextElem":
            //判断是否是系统消息
            if (!e.usertype) {//接收到系统消息 
              obj['type'] = TIM.TYPES.MSG_TEXT
              var str = e.msg;
              // businessid: "fFZe2Qfl9c1DWFbC4yT"
              // doctorId: "87fd6cbcf2684fa8b21ea4440da893ec"
              // msg: "此订单已转为门诊订单，请前往【我的门诊 - 我的挂号】查看。"
              // orgId: "h1"
              debugger;
              obj['msg'] = str.msg;
            } else {//对话消息
              obj['type'] = TIM.TYPES.MSG_TEXT
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

                      t.$parent.sendFaq(true);//单纯查询聊天是否结束
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
            var fileUrl = e.msg;
            if (fileUrl.indexOf('http:') == -1 || fileUrl.indexOf('https:') == -1) {
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
            var data = e.msg
            if (typeof (data) == 'string') {
              obj['msg'] = data == "group_create" ? '可以聊天了' : data
            } else {
              obj['msg'] = '[自定义消息]'
            }

            // if (data.extension === '' && data.data) {
            //   console.log('自定义消息', data.data)

            // } else {
            //   switch (data.data) {
            //     case 'group_create':
            //       obj['msg'] = '可以聊天了'
            //       break
            //     default:
            //       obj['msg'] = e.payload.extension
            //   }
            // }

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
          obj['photo'] = DOC.avatar ? t.getPath(DOC.avatar) : icons

        } else if (e.usertype === 'P') {//患者id

          obj['name'] = PAT.nick
          obj['isMySelf'] = PAT.ID == myID ? true : false;
          obj['photo'] = PAT.avatar ? t.getPath(PAT.avatar) : icons
        } else {

          obj['photo'] = ''
          obj['name'] = ''
          obj['isMySelf'] = ''
        }


        arr.push(obj)
      }
      return arr;


    },
    //关闭弹窗
    close () {
      this.dialogVisible = false;
      this.$parent.closeFAQ();
    },
    //发布问答集锦
    publish () {
      var t = this;

      if (!t.form.faqTitle) {
        t.$message.error('标题不能为空！')
        return false;
      }
      if (t.form.faqTitle && t.form.faqTitle.length > 255) {
        t.$message.error('标题内容不超255个字！')
        return false;
      }
      if (t.form.price != "" && t.form.price != undefined) {
        var exp = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/;
        if (!exp.test(t.form.price)) {
          t.$message.error("赏金金额格式不正确，最多小数后两位");
          return;
        }
      }

      //json字符串传参
      this.$axios({
        method: 'post',
        url: FAQ_URL.PUT_FAQ(t.role),
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [function (data) {
          data = JSON.stringify(data)
          return data
        }],
        data: t.form

      })
        .then(response => {
          let data = response.data;
          if (data.resultCode == 200) {
            t.$message.success('发布成功！')
            t.$parent.setFAQ(true);
            t.close();
          } else {

            t.$message.error(data.resultDesc)
          }
        })
        .catch(e => {
          t.$message.error('A&Q:系统错误！')

        })
    },
    //判断文件是否为图片文件
    isImg (url) {
      if (typeof (url) != "undefined") {
        var suffix = url.substr(url.lastIndexOf('.') + 1, url.length);
        if (suffix.lastIndexOf('png') == 0 || suffix.lastIndexOf('jpg') == 0 || suffix.lastIndexOf('jpeg') == 0 || suffix.lastIndexOf('gif') == 0) {
          return true;
        }
      }
      return false;
    },
    getPath (str) {
      var result = '';
      //判断是否含义http：有则不补全端口
      if (!str) { //空
        return result;
      } else if (str.indexOf('http:') > -1 || str.indexOf('https:') > -1) {
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
    getFileName (url) {
      var arr = url.split("/");
      var name = arr[arr.length - 1];
      return name;
    },
    initInfo () {//初始化弹窗页面
      var t = this;

      t.form.businessId = t.ID;
      switch (t.action) {// 业务类型：1张榜咨询，2三师咨询
        case "consult":
          t.form.businessType = '2'
          t.form.faqTitle = t.faqInfo.question ? t.faqInfo.question : "";
          break;
        case "notice":
          t.form.businessType = '1'
          t.form.faqTitle = t.faqInfo.title ? t.faqInfo.title : "";
          break;
      }
    },
    addKey () {
      var t = this;
      let list = t.form.keyWordList || [];
      if (list.length <= 4) {
        list.push({ "dictName": "" });
        t.form.keyWordList = list;
      }

    },
  }

}
</script>

<style scoped>
.ceil {
  text-align: left;
  font-size: 15px;
  padding: 5px 0;
  display: table;
  width: 100%;
  box-sizing: border-box;
}
.ceil > label {
  font-size: 15px;
  font-weight: bold;
  font-family: 微软雅黑;
  width: 127px;
  display: table-cell;
}
.ceil input {
  padding: 5px;
  display: inline-block;
  border: 1px solid #c7c7c7;
  border-radius: 3px;
  margin-right: 10px;
  min-width: 100px;
  font-size: 14px;
}
#F_Addkey {
  background: #409eff;
  border: 0;
  color: white;
  padding: 8px;
  border-radius: 2px;
  cursor: pointer;
}
input.titleInput {
  width: 80%;
}
.keyList {
  display: inline-block;
}
.keyVal {
  width: 50px;
}

img.icon {
  width: 25px;
  height: 25px;
}
.chatInfo {
  background: #f7f7f7;
  padding: 10px;
  border: 1px solid #d6d6d6;
  max-height: 300px;
  overflow: auto;
}
p {
  display: inline-block;
  vertical-align: top;
}
.permsg p {
  background: #a8d2fd;
  padding: 5px;
  border-radius: 3px;
  color: white;
  max-width: 90%;
  word-break: break-all;
}
.permsg {
  margin-bottom: 10px;
}
.img {
  width: 50px;
  height: 50px;
}
.ceil-con {
  max-height: 100px;
  overflow: auto;
  display: inline-block;
  vertical-align: top;
  width: 100%;
  box-sizing: border-box;
}
.docP p {
  background: #ffc671 !important;
}
.red {
  color: red;
}
</style>