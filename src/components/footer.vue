 
<template>
  <div class="footer">

    <ul class="f-ul">
      <li><a :href="initUrl('/Platform_N/by/gotopage/gotoabout?tap=intro')">关于我们</a></li>
      <li><a :href="initUrl('/Platform_N/by/gotopage/gotoabout?tap=cooperation')">商务合作</a></li>
      <li><a :href="initUrl('/Platform_N/by/gotopage/gotoabout?tap=recruit')">人才招聘</a></li>
      <li><a :href="initUrl('/Platform_N/by/gotopage/gotoabout?tap=proposal')">建议提交</a></li>
      <li><a :href="initUrl('/Platform_N/by/gotopage/gotoabout?tap=complain')">就诊投诉</a></li>
      <li><a :href="initUrl('/Platform_N/by/gotopage/gotoabout?tap=contact')">联系方式</a></li>
      <li><a href="https://www.cnzz.com/stat/website.php?web_id=1274698998"
           target="_blank"
           title="站长统计">站长统计</a></li>
    </ul>
    <p>北京网医联盟科技有限公司&nbsp;增值电信业务经营许可证证书编号:京B2-20170552&nbsp;
      <a href="https://beian.miit.gov.cn"
         target="_blank"
         style="text-decoration: none;color: white;"
         v-cloak>{{ICP}}</a>&nbsp;
      <a href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=11010702001794'
         target="_blank"
         style="text-decoration: none;color: white;">京公网安备11010702001794号</a>&nbsp; 联系电话:010-68860421
    </p>
    <p>本站信息仅供参考，不能作为诊断及医疗的依据，本站如文章、图片涉及版权问题，请速与我们联系处理！</p>

  </div>
</template>

<script>
import { wyyUrl, baseUrl } from "@/utils/baseUrl.js"
export default {
  name: 'Footer',
  data () {
    return {
      ICP: "京ICP备16049443号-1"
    }
  },
  created () {
    this.ICPAction();
  },
  methods: {
    initUrl (url) {
      return baseUrl + url
    },
    //ICP备案号控制
    ICPAction: function () {
      var t = this;
      var list = [{ //网医【正式】
        key: 'www.bjwylm.com',
        val: '京ICP备16049443号-1'
      },
      { //网医语【预生产】
        key: 'www.bjwylm.cn',
        val: '京ICP备16049443号-1'
      },
      { //韩语版【预生产】
        key: 'www.internetdoctoralliance.com',
        val: '京ICP备16049443号-1'
      },
      { //韩语版【正式】
        key: 'www.koreadoctor.cn',
        val: '京ICP备16049443号-3'
      },
      { //网医语【正式】
        key: 'www.wangyiyu.com',
        val: '京ICP备16049443号-2'
      },
      { //网医【预生产】
        key: 'www.koreandoctor.cn',
        val: '京ICP备16049443号-4'
      }
      ];
      var host = window.location.host //域名
      for (var i = 0; i < list.length; i++) {
        if (host == list[i].key) {
          t.ICP = list[i].val
        }
      }

    },
  }
}
</script>

<style scoped>
.footer {
  box-sizing: border-box;
  text-align: center;
  font-size: 14px;
  bottom: 0;
  color: white;
  margin: auto;
  border-top: 1px solid #777777;
  padding: 10px;
  margin-top: 10px;
  position: relative;
  width: 100%;
  background: black;
}
.footer p {
  margin: 5px 0 !important;
}
.f-ul {
  list-style: none;
  margin: 10px auto;
}
ul.f-ul li {
  display: inline-block;
  cursor: pointer;
  vertical-align: bottom;
  border-right: 1px solid #cecece;
}
ul.f-ul li:last-child {
  border: none;
}
ul.f-ul li a {
  text-decoration: none;
  display: inline-block;
  color: #ffffff;
  margin: 0px 10px;
}
</style>