 
<template>

  <div class="leftP userInfo">
    <label class="infoLimit"><b>标题：</b> {{info?info.title:""}}</label>
    <label><b>张榜人：</b>{{info?info.userName:''}}
      <br />
      <el-button size="mini"
                 type="success"
                 v-cloak
                 @click="toHealthyFile(info.secondPatId)">健康档案</el-button>

    </label>
    <label class="infoLimit"><b>内容请求：</b> {{info?info.contentString:""}}</label>
    <label><b>附件：</b>
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
           class="files"
           :for-file="L.imgpath"
           @click="download(L.imgpath)">{{getFileName(L.imgpath)}}
        </a>
      </div>

    </label>
    <label><b>指定三师：</b> <span>{{info?info.roleName:""}}</span></label>
    <label><b>指定区域：</b> <span>{{info?info.areaName:""}}</span></label>
    <label><b>指定科室：</b> <span>{{initDept(info)}}</span></label>
    <label><b>指定职称：</b> <span>{{info.levelName}}</span></label>
    <label><b>赏金：</b><span class="red">{{info?info.reward:""}}元</span></label>

    <div class="editDiv">
      <el-button size="mini"
                 type="primary"
                 v-cloak
                 @click="toBack()">返回</el-button>

    </div>
  </div>

</template>
    
    
    <script>
import { wyyUrl, baseUrl } from "@/utils/baseUrl.js"
import BUS from "@/utils/eventBus.js"

var URL_API = {
  TO_HEALTHY: function () {//医生跳转健康档案
    return baseUrl + '/Platform_N/webHis/users/toHealth'
  },
  GET_INFO: wyyUrl + '/Wylm_wyy/wy/patient/getNoticeDetails',//获取患者基本信息,
  TO_BACK: wyyUrl + '/Wylm_wyy/wy/patient/to_NoticeRecordHome',//返回张榜记录


}

export default {
  name: 'LeftInfo',
  props: {
    'role': {// doc /user
      required: true
    },

  },
  data () {
    return {
      info: {},
      Flag: "",// 榜单状态：-1已取消，1未支付，2未揭榜，3已揭榜，4完成
    }
  },
  mounted () {

  },
  components: {

  },
  watch: {
    GroupID (val) {
      if (val) {

        this.getUserInfo();
      }
    }
  },
  computed: {
    GroupID () {
      return this.$store.state.id
    },
    IMGList: function () {
      var arr = []
      if (this.info && this.info.wnimgdtlList) {
        var list = this.info.wnimgdtlList
        for (var i = 0; i < list.length; i++) {
          if (this.isImg(list[i].imgpath)) {
            arr.push(list[i]);
          }
        }
      }
      return arr
    },
    FILEList: function () {
      var arr = []
      if (this.info && this.info.wnimgdtlList) {
        var list = this.info.wnimgdtlList
        for (var i = 0; i < list.length; i++) {
          if (!this.isImg(list[i].imgpath)) {
            arr.push(list[i]);
          }
        }
      }
      return arr
    }
  },
  methods: {

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
    view (url) {
      this.$alert('<img src="' + this.getPath(url) + '"/>', '图片', {
        dangerouslyUseHTMLString: true
      });

    },
    download (url) {

      url = this.getPath(url)
      var title = this.getFileName(url)
      let link = document.createElement('a')
      link.href = url
      link.download = title
      link.click()
    },
    getPath (str) {
      var result = '';
      //判断是否含义http：有则不补全端口
      if (str.indexOf('http:') > -1 || str.indexOf('https:') > -1) {
        return str;
      } else if (str.indexOf('base64') > -1) {//base64图片
        return str;
      } else {
        var p = str.slice(0, str.indexOf('/', 1))
        switch (p) {
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
    toHealthyFile (userId) {

      window.open(URL_API.TO_HEALTHY(), '_blank');

    },
    getUserInfo () {

      var t = this;
      this.$axios({
        url: URL_API.GET_INFO,
        method: 'get',
        params: {
          id: t.GroupID
        },
      }).then(res => {

        if (!res.data.resultCode && res.data) {
          t.info = res.data.data;
          //设置聊天是否结束状态
          if (t.info.noticeState == '4') {
            /*状态判断 // 咨询 : -1：已取消，0：未支付，1：已支付，2：未回复，3,：已回复，4：已完成*/
            /*状态判断 // 张榜 ：-1：已取消，1：未支付，2：未揭榜，3：已揭榜，4：完成*/
            t.$store.commit('SET_CHAT_STATUS', true)
          }
          t.Flag = t.info.noticeState;// 榜单状态：-1已取消，1未支付，2未揭榜，3已揭榜，4完成*/
          t.$store.commit('SET_DoctorID', t.info.doctorId)//设置医生id

          //生成医生首页地址url
          var obj = {
            'doctorId': t.info.doctorId, 'role': t.role
          }
          t.$store.dispatch("getDocHomePage", obj);

          //设置问答集锦状态
          if (t.info.faqState == '1') {
            t.$store.commit('SET_FAQ_STATUS', true)
          }



          if (t.info.hasEvaluation == '1') {
            let obj = {
              hasEvaluation: true,
              val: t.info.evaluation
            }
            BUS.$emit("two-to-one", obj);//约定通信的数据
          } else if (t.info.hasEvaluation == '4') {
            let obj = {
              hasEvaluation: false,
              val: ""
            }
            BUS.$emit("two-to-one", obj);//约定通信的数据
          }

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

        }

      }).catch(e => {
        t.$message.error('系统错误，初始数据失败');
        t.$store.commit('SET_ROOT', false)

      });
    },
    initDept (obj) {
      var dept = [];
      if (obj && obj.deptList) {
        obj.deptList.forEach(function (e, i) {
          dept.push(e.departName);
        });
      }

      return dept.join(',')

    },
    initPostion (obj) {
      var profession = [];
      if (obj.professionList) {
        obj.professionList.forEach(function (e, i) {
          profession.push(e.professionName);
        });
      }

      return profession.join(',')
    },


    toBack () {
      window.location.href = URL_API.TO_BACK
    },

  }
}
    </script>
    
<style scoped>
[v-cloak] {
  display: none;
}
.red {
  color: red;
}

.leftP {
  position: relative;
  display: inline-block;
  width: 300px;
  background: white;
  padding-right: 10px;
  overflow-y: auto;
}
.userInfo > label {
  display: block;
  text-align: left;
  padding: 5px;
  font-size: 15px;
  color: #717171;
}
.img {
  width: 55px;
  height: 55px;
  border: 1px solid #f3f2f2;
  padding: 0;
  margin: 0;
}
.editDiv {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.files {
  color: #2169cf;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-all;
}
label.infoLimit {
  max-height: 75px;
  overflow-y: auto;
  margin-bottom: 11px;
  word-break: break-all;
}
</style>