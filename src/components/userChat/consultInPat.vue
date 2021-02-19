 
<template>

  <div class="leftP userInfo">
    <label><b>患者：</b>{{info?info.patientName:''}}
      <el-button size="mini"
                 type="success"
                 v-show="info.isAgree=='1'"
                 v-cloak
                 @click="toHealthyFile(info.realPatientId)">健康档案</el-button>

    </label>
    <label><b>性别：</b><span v-show='info.patientSex=="1"'>男</span><span v-show='info.patientSex=="2"'>女</span></label>
    <label><b>年龄：</b>{{info?info.patientAge:''}}</label>
    <label><b>患病时间：</b>{{info?info.illnessTime:""}}</label>
    <label><b>是否去过医院：</b><span v-if="info.isGoHos=='1'">是</span><span v-else>是</span></label>
    <label><b>是否确诊：</b><span v-if="info.isSureDiag=='1'">是</span><span v-else>是</span></label>
    <label class="infoLimit"><b>确诊信息：</b>{{info?info.diagnoseStr:""}}</label>
    <label class="infoLimit"><b>咨询的问题：</b> {{info?info.question:""}}</label>
    <label class="infoLimit"><b>病情描述：</b>{{info?info.illnessDesc:""}} </label>

    <label>
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
    <label><b>咨询价格：</b><span class="red">{{initFee(info.price)}}</span></label>
    <label class="infoLimit"
           v-if="info.isConvertClinic=='1'"><b>业务变更：</b>咨询转门诊</label>
    <div class="editDiv">
      <el-button size="mini"
                 type="success"
                 @click="toBack()">返回</el-button>
    </div>
  </div>

</template>
    
    
    <script>
import { wyyUrl, baseUrl } from "@/utils/baseUrl.js"
var URL_APIS = {
  BACK: wyyUrl + "/Wylm_wyy/wy/patient/to_MyConsultWithDoc",//返回我问三师页
  TO_HEALTHY: function () {//医生跳转健康档案
    return baseUrl + '/Platform_N/webHis/users/toHealth'
  },
  INFO: wyyUrl + "/Wylm_wyy/wy/patient/patViewConsultInfo",//查询患者基本资料

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
      info: {}
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
      if (this.info.wnimgdtlList) {
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
      if (this.info.wnimgdtlList) {
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
    initFee (fee) {
      let Fees = parseFloat(fee);
      if (isNaN(Fees) || Fees <= 0) {
        return '免费';
      }
      return Fees + "元";
    },
    toBack () {
      window.location.href = URL_APIS.BACK
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

      window.open(URL_APIS.TO_HEALTHY(), '_blank');

    },
    getUserInfo () {
      var t = this;
      this.$axios({
        url: URL_APIS.INFO,
        method: 'get',
        params: {
          id: t.GroupID
        },
        timeout: 30000,
      }).then(res => {
        if (res.data.resultCode == '200') {
          t.info = res.data.data;
          //设置聊天是否结束状态
          if (t.info.status == '4') {
            /*状态判断 // 咨询 : -1：已取消，0：未支付，1：已支付，2：未回复，3,：已回复，4：已完成*/

            t.$store.commit('SET_CHAT_STATUS', true)
          }

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
          console.log(t.info)
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
        t.$message.error('系统错误，初始化咨询数据失败');
        t.$store.commit('SET_ROOT', false)
      });
    }
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
  display: inline-block;
  width: 300px;
  background: white;
  padding-right: 10px;
  position: relative;
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
.infoLimit {
  max-height: 75px;
  overflow-y: auto;
  margin-bottom: 11px;
  word-break: break-all;
}
</style>