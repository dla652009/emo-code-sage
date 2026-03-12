<template>
  <div class="login-wrapper h-screen flex justify-center items-center">
    <div class="inline-block">
      <div class="flex justify-center">
        <h1 class="text-2xl text-white">DanceFitMe后台</h1>
      </div>
      <div class="flex">
        <section class="w-full bg-white p-4 rounded-md">
          <a-input prefix="用户名" v-model:value="user.user_name" @keyup.enter="handleLogin"></a-input>
          <a-input
            class="mt-2"
            type="password"
            prefix="密码"
            v-model:value="user.password"
            @keyup.enter="handleLogin"
          ></a-input>
          <a-button class="mt-2" block type="primary" @click="handleLogin">登录</a-button>
        </section>
      </div>
    </div>
  </div>
</template>
<script>
import { login } from '@/api';
export default {
  data() {
    return {
      user: {
        user_name: '',
        password: ''
      }
    };
  },
  methods: {
    handleLogin() {
      if (!this.user.user_name) return this.$message.error('请填写用户名');
      if (!this.user.password) return this.$message.error('请填写密码');
      let me = this;
      login(this.user).then(({ data }) => {
        if (data.error_code) return me.$message.error(data.error_desc);
        localStorage.setItem('D_userInfo', JSON.stringify(data.result));
        me.$store.commit('setMenu', null);
        me.$router.push('/');
      });
    }
  }
};
</script>
<style lang="scss">
.login-wrapper {
  background: url('https://dancefitappimage.dancefit.me/ef/a1/efa17d820583408b53aa2b77e36d6bb3.jpg');
  background-size: 100% 100%;
}
</style>
