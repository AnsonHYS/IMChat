 
<template>
  <div class="index">
    <div class="ChatPage">
      <!-- 医生端 -张榜-->
      <Doc-Notice :role='role'></Doc-Notice>
      <div class="rigthP">
        <!-- 聊天栏 -->
        <Message :role='role'
                 :action="action" />
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>

<script>
import { wyyUrl, baseUrl } from "@/utils/baseUrl.js"
import docNotice from "@/components/docChat/noticeInDoc.vue"
import Message from "@/components/message.vue"
import Footer from "@/components/footer.vue"
export default {
  name: 'docNotice',
  data () {
    return {
      role: "doc",
      action: "notice"
    }
  },
  created () {

  },
  components: {
    'Footer': Footer,
    "Doc-Notice": docNotice,
    "Message": Message,
  },
}
</script>

<style scoped>
body,
html {
  margin: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
}

[v-cloak] {
  display: none;
}
.index {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}
.red {
  color: red;
}
.ChatPage {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 1200px;
  height: calc(100% - 108px);
  padding: 40px 10px;
  margin: auto;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.rigthP {
  display: inline;
  width: 900px;

  padding-left: 10px;
}
</style>