<template>
  <div class="custom"
       v-loading="loading"
       v-cloak>
    <div v-if="Custom_Info.description == 'consultToClinc'">
      <div class="toPay">
        <!-- 医生端展示 -->
        <div v-show="role == 'doc'">
          <p class="title_d">{{ Custom_Info.data.docTitle }}</p>
          <p>{{ Custom_Info.data.docMessage }}</p>
          <label class="fee">网诊差价：￥{{ orderInfo.fee }}</label>
        </div>
        <!-- 患者端展示 -->
        <div v-show="role == 'user'">
          <p class="title_d"
             v-if="Custom_Info.data.isPay === '1'">
            {{ Custom_Info.data.msg }}
          </p>
          <p>{{ Custom_Info.data.userTitle }}</p>
          <p>{{ Custom_Info.data.userMessage }}</p>
          <!-- 咨询未结束 -->
          <div v-if="!isFinish">
            <p class="time">{{ LEFT_TIME }}</p>
            <label v-if="Custom_Info.data.isPay === '1'"
                   class="orderState hasPay">已支付</label>
            <label v-if="Custom_Info.data.isPay === '0'"
                   :class="['orderState', { 'btn disabled': isDisabeld }, { btn: !isDisabeld }]"
                   @click="!isDisabeld && toPayPage()">{{ isDisabeld ? "已失效" : "去支付" }} </label>

            <!-- <label v-if="(Custom_Info.data.isPay==='1'&&!isDisabeld) || (Custom_Info.data.isPay==='1'&&isDisabeld)"
                   class="orderState hasPay">已支付</label>
            <label v-else-if="Custom_Info.data.isPay==='0'&&isDisabeld"
                   :class="['orderState',{'noPay':role=='doc'} ,{'btn disabled':role=='user'}]">{{role=='doc'?'未支付':'已失效'}}</label>
            <label v-else
                   :class="['orderState',{'wait':role=='doc'},{'btn':role=='user'}]"
                   @click="role=='user' && toPayPage()"> {{role=='doc'?'等待支付':'去支付'}}</label> -->
          </div>
          <!-- 咨询已结束 -->
          <div v-else>
            <label v-if="Custom_Info.data.isPay === '1'"
                   class="orderState hasPay">已支付</label>
            <label v-else-if="Custom_Info.data.isPay === '0'"
                   class="orderState btn disabled">已失效</label>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="Custom_Info.description == 'create'">
      <p style="padding: 5px">可以聊天了</p>
    </div>
    <div v-else>
      <p style="padding: 5px">
        {{ Custom_Info.data ? Custom_Info.data : "自定义消息" }}
      </p>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import { baseUrl, wyyUrl, IMbase } from "@/utils/baseUrl";

var URLS = {
  INIT_CLINIC: wyyUrl + "/Wylm_wyy/wy/patient/initDocConsultConvertClinicOrder", //【患者端】咨询转门诊：初始化订单
};
export default {
  name: "Custom",
  props: {
    payload: {
      required: true,
    },
    role: {
      //user/doc
      required: true,
    },
    action: {
      //consult/notice
      required: true,
    },
    groupID: {
      //咨询id（群id）
      required: true,
    },
  },
  data () {
    return {
      isDisabeld: false,
      LEFT_TIME: "", //剩余时间
      timer: "", //倒计时对象
      orderInfo: {
        fee: "",
        time: "", //消息创建时间
      },

      loading: false,
    };
  },
  created () { },
  mounted () {
    this.$nextTick(function () {
      this.initMsg();
    });
  },
  computed: {
    isFinish () {
      //是否已经结束
      let str = this.$store.state.isFinishChat;
      return str;
    },
    isPay () {
      //咨询转门诊 支付状态
      let str = this.$store.state.c2c_isPay;
      return str;
    },
    //自定义消息内容
    Custom_Info: function () {
      console.log("payload", this.payload);

      //【data】咨询转门诊
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
      //【data】其他
      //字符串

      var data = this.payload.data;
      var type = "";
      if (data) {
        //转换成json
        switch (typeof data) {
          case "string":
            if (data.indexOf("{") > -1 && data.indexOf("}") > -1) {
              data = JSON.parse(data);
            }
            break;
          case "object":
            break;
        }

        var DataType = typeof data;
        switch (DataType) {
          case "string":
            if (data == "group_create") {
              type = "create"; //创建群
            }
            break;
          case "object":
            if (data.messageType && data.messageType == "101") {
              type = "consultToClinc"; //咨询转门诊类型
            }
            break;
        }
      }

      // if (typeof (this.payload) == 'string') {
      //   str = this.payload
      //   type = "";

      // } else {
      //   if (this.payload.businessType) {//系统返回的自定义消息
      //     str = JSON.stringify(this.payload);
      //     type = this.payload.businessType
      //   } else {//个人发送的自定义消息
      //     str = this.payload ? this.payload.data : "";
      //     type = this.payload ? this.payload.description : ""
      //   }
      // }

      return {
        data: data,
        description: type,
      };
    },
  },
  methods: {
    noNull: function (fee) {
      if (fee === 0 || fee) {
        return true;
      } else {
        return false;
      }
    },
    initMsg () {
      var t = this;

      //初始化自定义消息---咨询转门诊
      if (t.Custom_Info.data && t.Custom_Info.description == "consultToClinc") {
        var obj = t.Custom_Info.data;

        t.orderInfo.fee = parseFloat(obj.fee);

        switch (obj.isPay) {
          case "1": //已支付
            t.$store.commit("SET_CONSULT2CLINIC_ISPAY_STATUS", true); //设置支付已完成
            t.disable = true;
            break;
          case "0": //未支付
            if (obj.fee && obj.time) {
              t.orderInfo.fee = parseFloat(obj.fee);
              let DATE = obj.time;
              t.orderInfo.time = Date.parse(DATE.replace(/-/g, "/"));
              let detes = new Date(t.orderInfo.time).getTime();
              if (!t.isFinish) {
                //未结束
                t.TimeStar(detes);
              } else {
                //咨询已结束
                t.TimeStop();
              }
            } else {
              //已失效 /无效消息
              t.disable = true;
            }
            break;
        }
      }
    },
    //检查订单是否有效-附上倒计时
    TimeStar (time) {
      var t = this;
      var str = "";

      //当前时间
      var today = new Date();
      var now = today.getTime();
      if (now - time <= 30 * 60 * 1000) {
        //30min内---订单有效
        t.isDisabeld = false;
        var leftTime = (time + 30 * 60 * 1000 - now) / 1000; //剩余时间-秒
        t.timer = setInterval(function () {
          leftTime = leftTime - 1;
          var minute = parseInt(leftTime / 60);
          var second = parseInt(leftTime % 60);
          str = "有效时间：" + minute + "分" + second + "秒";
          if (minute === 0 && second === 0) {
            str = "";
            t.isDisabeld = true;
            clearInterval(t.timer);
          }
          t.LEFT_TIME = str;
        }, 1000);
      } else {
        //30min外---订单失效
        str = "";
        t.isDisabeld = true;
        t.LEFT_TIME = str;
      }
    },
    //倒计时停止
    TimeStop () {
      var t = this;
      clearInterval(t.timer);
      t.LEFT_TIME = "";
      t.isDisabeld = true;
    },
    // 更新渲染聊天记录
    updateMsg () {
      var t = this;
      this.messageRecond = this.$store.getters.getMsg;

      setTimeout(function () {
        var div = t.$refs.msgDiv;
        div.scrollTop = div.scrollHeight;
      }, 50);
    },
    //患者跳转支付页面
    toPayPage () {
      var t = this;
      console.log(this.groupID);

      t.loading = true;
      t.$axios({
        method: "post",
        dataType: "json",
        url: URLS.INIT_CLINIC,
        params: {
          consultId: t.groupID,
        },
      })
        .then((response) => {
          t.loading = false;

          var data = response.data;
          var rid = "";
          switch (data.resultCode) {
            case "400":
              if (data.data) {
                if (t.orderInfo.fee == 0) {
                  //差价0元
                  t.TimeStop();
                } else {
                  rid = data.data;
                  var url =
                    location.protocol +
                    "//" +
                    location.host +
                    "/Wylm_wyy/wy/patient/toPayPage?businessId=" +
                    rid +
                    "&businessType=25";
                  window.open(url, "_blank");
                }
              } else {
                t.$message.error(data.resultDesc);
                if (data.resultDesc == "咨询订单已完成！") {
                  window.reload();
                }
              }
              break;
            case "200":
              if (t.orderInfo.fee == 0) {
                //差价0元
                t.TimeStop();
              } else {
                rid = data.data;
                var url =
                  location.protocol +
                  "//" +
                  location.host +
                  "/Wylm_wyy/wy/patient/toPayPage?businessId=" +
                  rid +
                  "&businessType=25";
                window.open(url, "_blank");
              }
              break;
            default:
              t.$message.error("error:系统错误,操作失败！");
          }
        })
        .catch((e) => {
          debugger;
          t.loading = false;
          t.$message.error("ERROR:系统错误！");
        });
    },
  },
};
</script>
<style scoped>
.custom {
  padding: 0px;
}
.toPay p {
  margin-bottom: 10px;
  padding: 5px;
}
.toPay {
  width: 300px;

  /* background: #baeaff; */
  color: #545454;
}
.title_d {
  color: black;
  font-weight: bold;
  border-bottom: 1px solid #96c8de;
}
label.fee {
  display: block;
  padding: 5px;
  text-align: left;
  border-top: 1px solid white;
  color: #000e1d;
}
.orderState {
  border-top: 1px solid #ffffff;
  display: block;
  padding: 5px;
  text-align: center;
  font-size: 17px;

  color: #ffffff;
  font-family: "Arial", "Microsoft YaHei", "黑体", "宋体", sans-serif;
}
.btn {
  background: #3a8ee6;
  color: #ffffff;
  cursor: pointer;
  border: 1px solid #409eff;
  box-sizing: border-box;
  user-select: none;
}
.disabled {
  background: #b1b1b1 !important;
  color: #515151 !important;
  border: 1px solid #b1b1b1 !important;
}
.hasPay {
  color: #3cb100;
}
.noPay {
  color: #d80000;
}
.wait {
  color: #cc8500;
}
.time {
  font-size: 14px;
  color: #c70000;
  margin: 0;
  padding: 0 5px !important;
}
</style>