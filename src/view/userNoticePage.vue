 
<template>
  <div class="index">
    <div class="ChatPage">
      <!-- 患者端 -张榜-->
      <user-Notice :role='role'></user-Notice>
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
import userNotice from "@/components/userChat/noticeInPat.vue"
import Message from "@/components/message.vue"
import Footer from "@/components/footer.vue"
export default {
  name: 'userNotice',
  data () {
    return {
      role: "user",
      action: "notice"
    }
  },
  components: {
    'Footer': Footer,
    "user-Notice": userNotice,
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
.red {
  color: red;
}
.index {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
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