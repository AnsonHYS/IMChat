<template>
  <div class='errorDiv'>
    <div class="imgDiv">
      <img :src="I404"
           class="404" />
    </div>
    <Footer />
  </div>
</template>

<script>
import Img404 from '@/assets/404.png'
import Footer from "@/components/footer.vue"

export default {
  name: '404',
  data () {
    return {
      I404: Img404,
    }
  },
  methods: {

  },
  components: {
    'Footer': Footer,

  },

}
</script>

<style scoped>
.errorDiv {
  width: 100%;
  height: 100%;
  background: white;
  padding-top: 10%;
  box-sizing: border-box;
}
.imgDiv {
  height: calc(100% - 115px);
}
.footer {
  background: black;
}
</style>