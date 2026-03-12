<template>
  <div class="app-loading">
    <div class="app-loading-panel">
      <div class="app-loading-header">
        <div class="app-loading-badge">ADS BOOM</div>
        <div class="app-loading-subtext">Control Console</div>
      </div>
      <div class="app-loading-body">
        <div class="app-loading-main">
          <img class="app-loading-icon" src="/favicon.png" alt="ADS BOOM" />
          <div>
            <div class="app-loading-title">系统加载中</div>
            <div class="app-loading-desc">正在校验账号、同步配置与广告数据</div>
          </div>
        </div>
        <div class="app-loading-progress">
          <a-progress
            class="app-loading-progress-bar"
            :percent="percent"
            :show-info="false"
            status="active"
            stroke-linecap="round"
          />
        </div>
        <div class="app-loading-text">应用初始化中，请稍候</div>
      </div>
      <div class="app-loading-footer">
        <span class="app-loading-status-dot"></span>
        <span class="app-loading-status-text">ADS BOOM 自动化爆量系统正在安全启动</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const percent = ref(12);

let timer;

onMounted(() => {
  timer = window.setInterval(() => {
    const target = 94;
    const diff = target - percent.value;
    const step = Math.max(0.6, Math.abs(diff) * 0.08);
    if (diff <= 0) {
      percent.value = target;
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
      return;
    }
    percent.value = Math.min(percent.value + step, target);
  }, 260);
});

onBeforeUnmount(() => {
  if (timer !== undefined) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.app-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #0b1120;
  color: #e5f3ff;
}

.app-loading-panel {
  padding: 24px 28px 22px;
  border-radius: 18px;
  background: radial-gradient(circle at top left, #020617, #020617 55%, #020617);
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.7),
    0 0 0 1px rgba(15, 23, 42, 0.9);
  max-width: 520px;
  width: calc(100% - 72px);
  animation: panelEnter 0.5s ease-out;
}

.app-loading-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

.app-loading-badge {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #e5e7eb;
}

.app-loading-subtext {
  font-size: 11px;
  color: #64748b;
}

.app-loading-body {
  padding-top: 2px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(30, 64, 175, 0.45);
}

.app-loading-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.app-loading-icon {
  width: 32px;
  height: 32px;
  background: #020617;
  animation: floatY 3s ease-in-out infinite;
}

.app-loading-title {
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 0.02em;
  margin-bottom: 6px;
}

.app-loading-desc {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 18px;
}

.app-loading-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.app-loading-progress-bar .ant-progress-outer {
  padding: 0;
}

.app-loading-progress-bar .ant-progress-inner {
  background: #020617;
  border-radius: 999px;
}

.app-loading-progress-bar .ant-progress-bg {
  background: linear-gradient(90deg, #38bdf8, #4f46e5);
  height: 6px !important;
  border-radius: 999px !important;
}

.app-loading-text {
  font-size: 14px;
  color: #cbd5f5;
}

.app-loading-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
}

.app-loading-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
  animation: statusPulse 1.6s ease-out infinite;
}

.app-loading-status-text {
  font-size: 12px;
  color: #9ca3af;
}

@keyframes panelEnter {
  0% {
    transform: translateY(8px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes floatY {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes statusPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.45);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
}
</style>
