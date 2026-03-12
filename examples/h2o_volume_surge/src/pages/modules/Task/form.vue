<template>
  <div class="bg-white rounded-lg">
    <a-page-header
      :title="$route.name"
      @back="goBack"
      class="!sticky top-0 !bg-white w-full z-10 pb-0 pt-3 rounded-lg"
    />
    <TaskHeaderInfo
      :config="config"
      :pre-count="preCount"
      :task-type="taskType"
      :disabled="disabled"
      :pre-check-loading="$isLoading('pre-check--1')"
      @pre-check="handlePreCheck(-1)"
    />
    <a-form :model="config" ref="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
      <a-divider><span class="text-lg font-bold">拼接逻辑</span></a-divider>
      <div v-if="taskType === 1" class="p-5">
        <!-- 广告任务 -->
        <a-form-item label="投放人群性别" name="gender" required>
          <a-select
            :disabled="disabled"
            :options="genderOption"
            placeholder="自动带入素材库组"
            v-model:value="config.gender"
            @change="handleGenderChange"
          />
        </a-form-item>
        <a-form-item label="素材语言" name="lang" required>
          <a-select
            :disabled="disabled"
            :options="langOption"
            placeholder="自动带入素材库组"
            v-model:value="config.lang"
            @change="handleLangChange"
          />
        </a-form-item>
        <a-collapse v-model:activeKey="activeKeys" style="width: 80%; margin: 0 auto">
          <a-collapse-panel v-for="(item, index) in config.condition" :key="index">
            <template #header>
              <span class="mr-5"> 素材库组 {{ index + 1 }} </span>
              <span>
                预计筛选素材条数：
                <span class="blue font-bold mr-1">
                  <a-spin size="small" :spinning="true" v-if="$isLoading(`pre-check-${index}`)" />
                  <template v-else> {{ item.total || 0 }} </template>
                </span>
                条
                <a-button
                  type="primary"
                  @click.stop="handlePreCheck(index)"
                  v-if="taskType === 1 && !disabled"
                  class="ml-5"
                >
                  计算条数
                </a-button>
              </span>
            </template>
            <template #extra v-if="!disabled">
              <a-button
                type="text"
                size="small"
                @click.stop="copyCondition(index)"
                v-if="config.condition.length < 5"
                class="blue"
              >
                复制
              </a-button>
              <a-button
                type="text"
                danger
                size="small"
                @click.stop="removeCondition(index)"
                v-if="config.condition.length > 1 && !item.filter_type !== 1"
              >
                删除
              </a-button>
            </template>
            <a-form-item
              label="标签体系"
              :name="['condition', index, 'content_type']"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 16 }"
              required
            >
              <a-select
                :disabled="disabled"
                :options="contentTypeOption"
                placeholder="请选择标签体系"
                v-model:value="item.content_type"
                @change="handleContentTypeChange(item)"
              />
            </a-form-item>
            <a-form-item
              label="素材库"
              :name="['condition', index, 'creative_type']"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 16 }"
              required
            >
              <a-select
                :disabled="disabled"
                :options="creativeTypeOption.filter(item => item.value !== 5)"
                placeholder="请选择素材库"
                v-model:value="item.creative_type"
                @change="handleCreativeTypeChange(item, index)"
              />
            </a-form-item>
            <a-form-item
              label="筛选方式"
              v-if="item.creative_type < 3 && item.content_type"
              :name="['condition', index, 'filter_type']"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 16 }"
              required
            >
              <a-select
                :disabled="disabled"
                :options="filterTypeOption"
                placeholder="请选择筛选方式"
                v-model:value="item.filter_type"
                @change="handleFilterTypeChange(item)"
              />
            </a-form-item>
            <template v-if="item.creative_type < 3 && item.filter_type === 1 && item.content_type">
              <a-form-item
                label="素材权重"
                :name="['condition', index, 'weight']"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
                required
              >
                <a-select
                  :disabled="disabled"
                  :options="weightOption"
                  mode="multiple"
                  placeholder="请选择素材权重"
                  v-model:value="item.weight"
                />
              </a-form-item>
              <a-form-item
                label="素材师"
                :name="['condition', index, 'author']"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
                required
              >
                <a-select :disabled="disabled" mode="multiple" placeholder="请选择素材师" v-model:value="item.author">
                  <a-select-option :value="item.label" v-for="(item, index) in authorOption" :key="index">{{
                    item.label
                  }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="素材标签"
                :name="['condition', index, 'tags']"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
                required
              >
                <a-cascader
                  multiple
                  v-model:value="item.tags"
                  :options="tagLevelListByContentType(item)"
                  :field-names="fieldNames"
                  expand-trigger="hover"
                  allowClear
                  :disabled="disabled"
                  :show-search="showSearch"
                  :show-checked-strategy="'SHOW_CHILD'"
                  placeholder="请选择素材标签"
                />
              </a-form-item>
              <a-form-item
                label="投放人群性别"
                :name="['condition', index, 'gender']"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
                required
              >
                <a-select disabled :options="genderOption" placeholder="自动带出" v-model:value="item.gender" />
              </a-form-item>
              <a-form-item
                label="素材语言"
                :name="['condition', index, 'lang']"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
                required
              >
                <a-select disabled :options="langOption" placeholder="自动带出" v-model:value="item.lang" />
              </a-form-item>
              <a-form-item
                label="素材创建日期"
                :name="['condition', index, 'creative_time']"
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-range-picker
                  class="w-full"
                  format="YYYY-MM-DD"
                  :disabled="disabled"
                  v-model:value="item.creative_time"
                  value-format="YYYY-MM-DD"
                  :placeholder="['开始日期', '结束日期']"
                  @change="handleCreativeTimeChange(item)"
                />
              </a-form-item>
            </template>
            <a-form-item
              label="已选切片素材"
              v-if="item.creative_type < 3 && item.filter_type === 2 && item.content_type"
              :name="['condition', index, 'creative_id']"
              :label-col="{ span: 4 }"
              :wrapper-col="{ span: 16 }"
              required
            >
              <a-spin size="small" :spinning="true" v-if="$isLoading(`condition-init-${index}`)" />
              <LoadSelect
                v-else
                v-model="item.creative_id"
                :api="Api.getCreativeList"
                :field-names="{
                  label: 'creative_name',
                  value: 'id',
                  resultName: 'creative_list'
                }"
                :params="item.loadSelectParams || {}"
                :loading-scope="`current-creative-${index}`"
                :default-options="item.creativeOption || []"
                :disabled="disabled"
              />
            </a-form-item>
            <template v-if="[3, 4].includes(item.creative_type) && item.content_type">
              <a-form-item
                label="素材"
                :name="['condition', index, 'creative_id']"
                required
                :label-col="{ span: 4 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-select
                  mode="multiple"
                  allowClear
                  :disabled="disabled"
                  placeholder="请选择素材"
                  v-model:value="item.creative_id"
                  option-filter-prop="label"
                >
                  <a-select-option
                    :value="item.id.toString()"
                    :label="item.name"
                    v-for="(item, index) in creativeListByContentType(item)"
                    :key="index"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
              </a-form-item>
              <template v-if="item.creative_type === 4">
                <a-form-item label=" " :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="skip-hook-bgm">
                  <a-checkbox v-model:checked="item.is_skip_hook_bgm" class="ant-col ant-col-16" :disabled="disabled"
                    >跳过hook库素材播放BGM</a-checkbox
                  >
                </a-form-item>
              </template>
            </template>
          </a-collapse-panel>
        </a-collapse>
        <div class="text-center my-4" v-if="config.condition.length < 5 && !disabled">
          <a-button type="dashed" @click="addCondition" block style="width: 80%; margin: 0 auto">
            <plus-outlined />
            添加素材库组
          </a-button>
        </div>
      </div>
      <template v-else-if="taskType === 2">
        <!-- 成片素材 -->
        <a-collapse v-model:activeKey="activeKeys" style="width: 80%; margin: 0 auto">
          <a-collapse-panel header="素材库组">
            <a-form-item label="标签体系" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
              <a-select
                disabled
                :options="contentTypeOption"
                placeholder="请选择标签体系"
                v-model:value="selfData.content_type"
              />
            </a-form-item>
            <a-form-item label="素材库" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
              <a-select
                disabled
                :options="creativeTypeOption"
                placeholder="请选择素材库"
                v-model:value="selfData.creative_type"
              />
            </a-form-item>

            <a-form-item label="已选成片素材" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" required>
              <template v-if="selfData.content_type && selfData.creative_type">
                <a-spin :spinning="$isLoading('current-creative')" size="small">
                  <LoadSelect
                    v-model="selfData.current_list"
                    loading-scope="current-creative"
                    :api="Api.getCreativeList"
                    :field-names="{
                      label: 'creative_name',
                      value: 'id',
                      resultName: 'creative_list'
                    }"
                    :params="loadSelectParams"
                    :default-options="creativeOption || []"
                    :disabled="disabled"
                    @update:selected-options="val => (selfData.current_list_options = val)"
                  />
                </a-spin>
              </template>
              <a-spin v-else :spinning="true" size="small" />
            </a-form-item>
          </a-collapse-panel>
        </a-collapse>
      </template>
      <template v-else>
        <!-- 成片视频 -->
        <a-form-item label="已选成片视频" required>
          <LoadSelect
            v-model="selfData.current_list"
            loading-scope="current-video"
            :is-modal="false"
            :api="Api.getVideoList"
            :field-names="{
              label: 'task_log_name',
              value: 'id',
              resultName: 'task_log_list'
            }"
            :default-options="videoOption || []"
            :disabled="disabled"
            @update:selected-options="val => (selfData.current_list_options = val)"
          />
        </a-form-item>
      </template>
      <a-divider><span class="text-lg font-bold">批量上传逻辑</span></a-divider>
      <a-form-item label="bm-id" name="ad_bm_id" required>
        <a-input v-model:value="config.ad_bm_id" disabled placeholder="自动带出" />
      </a-form-item>
      <a-form-item label="广告账户" name="ad_account" required>
        <a-select
          v-model:value="config.ad_account"
          :disabled="disabled"
          placeholder="请选择广告账户"
          :options="adAccountOption"
          @change="handleAdAccountChange"
        >
          <template #notFoundContent>
            <a-empty description="请先选择所属项目" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="广告创建方式" name="campaign_create_type" required>
        <a-select
          :disabled="disabled || isCreativeTypeDisabled"
          :options="createTypeOption"
          placeholder="请选择广告创建方式"
          v-model:value="config.campaign_create_type"
          @change="handleCampaignCreateTypeChange"
        />
      </a-form-item>
      <template v-if="config.campaign_create_type === 3">
        <a-form-item label="源campaign名称" name="campaign_list" required>
          <a-select
            :disabled="disabled"
            :options="campaignOption"
            :fieldNames="{ label: 'campaign_name', value: 'campaign_id' }"
            placeholder="请选择源campaign名称"
            v-model:value="config.campaign_list"
            @change="handleSourceCampaignChange"
            show-search
            option-filter-prop="campaign_name"
          >
            <template #notFoundContent>
              <a-spin size="small" :spinning="true" v-if="$isLoading('account-campaign')" />
              <a-empty
                description="请先选择广告账户信息"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                v-else-if="!config.ad_account"
              />
              <a-empty description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" v-else />
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="源ad-sets" name="copy_adset_id" required>
          <a-select
            :disabled="disabled"
            :options="sourceAdsetOption"
            placeholder="请选择源ad-sets"
            v-model:value="config.copy_adset_id"
            :fieldNames="{ label: 'adset_name', value: 'adset_id' }"
            show-search
            option-filter-prop="adset_name"
            @change="handleSourceAdsetChange"
          >
            <template #notFoundContent>
              <a-spin size="small" :spinning="true" v-if="$isLoading('account-adset')" />
              <a-empty
                description="请先选择源campaign名称"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                v-else-if="!config.campaign_list"
              />
              <a-empty description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" v-else />
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="目标campaign名称" name="copy_campaign_id" required>
          <a-select
            :disabled="disabled"
            :options="targetCampaignOption"
            :fieldNames="{ label: 'campaign_name', value: 'campaign_id' }"
            placeholder="请选择目标campaign名称"
            v-model:value="config.copy_campaign_id"
            show-search
            option-filter-prop="campaign_name"
            @change="handleTargetCampaignChange"
          >
            <template #notFoundContent>
              <a-spin size="small" :spinning="true" v-if="$isLoading('account-campaign')" />
              <a-empty
                description="请先选择广告账户信息"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
                v-else-if="!config.ad_account"
              />
              <a-empty description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" v-else />
            </template>
            <template #option="item">
              <span v-if="item.isSource" class="text-red-500 font-bold mr-1">(源)</span>
              <span>{{ item.campaign_name }}</span>
            </template>
          </a-select>
        </a-form-item>
      </template>
      <a-form-item label="campaign数量" v-if="config.campaign_create_type === 1">
        <a-input v-model:value="config.campaign_num" disabled />
      </a-form-item>
      <a-form-item label="campaign名称" name="campaign_list" required v-if="config.campaign_create_type === 2">
        <a-select
          :disabled="disabled"
          :options="campaignOption"
          :fieldNames="{ label: 'campaign_name', value: 'campaign_id' }"
          placeholder="请选择campaign名称"
          v-model:value="config.campaign_list"
          @change="handleCampaignChange"
        >
          <template #notFoundContent>
            <a-spin size="small" :spinning="true" v-if="$isLoading('account-campaign')" />
            <a-empty
              description="请先选择广告账户信息"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
              v-else-if="!config.ad_account"
            />
            <a-empty description="暂无数据" :image="Empty.PRESENTED_IMAGE_SIMPLE" v-else />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="ad-sets数量/每个campaign" name="per_campaign_adset_num" required>
        <a-input-number
          :disabled="disabled"
          placeholder="请输入1-200的正整数"
          v-model:value.number="config.per_campaign_adset_num"
          class="!w-full"
          :controls="false"
          :min="1"
          :max="200"
          :precision="0"
        />
      </a-form-item>
      <a-form-item label="ads数量/每个ad-sets" name="per_adset_ad_num" v-if="config.ad_assign_type !== 2" required>
        <a-input-number
          v-model:value="config.per_adset_ad_num"
          :disabled="disabled"
          placeholder="请输入1-200的正整数"
          class="!w-full"
          :controls="false"
          :min="1"
          :max="200"
          :precision="0"
        />
      </a-form-item>
      <template v-if="taskType > 1">
        <a-form-item label="分配模式" name="ad_assign_type" required>
          <a-select
            :disabled="disabled"
            :options="allocateModeOption"
            placeholder="请选择分配模式"
            v-model:value="config.ad_assign_type"
            @change="handleAllocateModeChange"
          />
        </a-form-item>
        <a-form-item
          label="素材分配表"
          v-if="config.ad_assign_type === 2"
          required
          :validateStatus="materialAssignError ? 'error' : ''"
        >
          <TaskTable
            v-model:formState="config"
            :disabled="disabled"
            :numbers="config.per_campaign_adset_num"
            type="material"
            :options="selectedMaterialOptions"
            :task-type="taskType"
            :field-names="
              taskType === 2 ? { label: 'creative_name', value: 'id' } : { label: 'task_log_name', value: 'id' }
            "
          />
        </a-form-item>
      </template>
      <a-divider><span class="text-lg font-bold">广告设置</span></a-divider>
      <a-form-item label="广告系列" class="font-bold"></a-form-item>
      <a-form-item label="广告系列名称" name="campaign_name" required>
        <a-input
          v-model:value.trim="config.campaign_name"
          :disabled="disabled || isExpand || isHasTargetCampaign"
          placeholder="请输入广告系列名称"
        />
      </a-form-item>
      <a-form-item label="广告目标" name="campaign_goal" required>
        <a-select
          :disabled="disabled || isCampaignGoalDisabled || isExpand || isHasTargetCampaign"
          :options="campaignGoalOption"
          placeholder="请选择广告目标"
          v-model:value="config.campaign_goal"
          @change="handleCampaignGoalChange"
        />
      </a-form-item>
      <a-form-item label="预算配置" name="budget_type" required>
        <a-select
          :disabled="disabled || isExpand || isHasTargetCampaign"
          :options="budgetTypeOption"
          placeholder="请选择预算配置"
          v-model:value="config.budget_type"
        />
      </a-form-item>
      <a-form-item label="广告系列预算（美金）" name="campaign_budget">
        <a-input-number
          :disabled="disabled || isAdsBudgetDisabled || isExpand || isHasTargetCampaign"
          v-model:value="config.campaign_budget"
          :formatter="value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="value => value.replace(/\$\s?|(,*)/g, '')"
          class="blue !w-full"
          placeholder="请输入广告系列预算（美金）"
          :controls="false"
          :min="1"
        />
      </a-form-item>
      <a-form-item label="投放语言方式" required name="adset_locale_type">
        <a-select
          :disabled="disabled"
          :options="languageMethodOption"
          placeholder="请选择投放语言方式"
          v-model:value="config.adset_locale_type"
          @change="handleLanguageMethodChange"
        />
      </a-form-item>
      <a-form-item label="指定统一语言" required v-if="config.adset_locale_type === 2" name="adset_locale_info">
        <a-select
          v-model:value="config.adset_locale_info"
          :disabled="disabled"
          mode="multiple"
          :options="languageOption"
          placeholder="请选择统一语言"
          allowClear
          show-search
          option-filter-prop="label"
        >
          <template #dropdownRender="{ menuNode: menu }">
            <div class="px-2 py-1 border-b flex justify-between items-center">
              <span class="text-gray-600">
                {{ isUnifiedLangAllSelected ? '已全选' : '全选当前页数据' }}
              </span>
              <a-button size="small" type="link" @click="toggleUnifiedLangSelectAll" class="flex items-center">
                {{ isUnifiedLangAllSelected ? '取消全选' : '全选' }}
              </a-button>
            </div>
            <v-nodes :vnodes="menu" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item
        label="指定不同语言"
        required
        v-if="config.adset_locale_type === 3"
        :validateStatus="langAssignError ? 'error' : ''"
      >
        <TaskTable
          v-model:formState="config"
          :disabled="disabled"
          :numbers="config.per_campaign_adset_num"
          type="language"
          :task-type="taskType"
          :options="languageOption"
          :field-names="{ label: 'label', value: 'value' }"
        />
      </a-form-item>
      <a-form-item label="广告组" class="font-bold"></a-form-item>
      <a-form-item label="移动应用商店" name="adset_app_store">
        <a-select
          :disabled="disabled || isAppStoreDisabled"
          :options="appStoreOption"
          placeholder="请选择移动应用商店"
          v-model:value="config.adset_app_store"
        />
      </a-form-item>
      <a-form-item label="像素id" name="adset_pixel_id" required>
        <a-select
          v-model:value="config.adset_pixel_id"
          :disabled="disabled"
          :options="pixelIdOption"
          placeholder="请选择像素id"
        >
          <template #notFoundContent>
            <a-empty description="请先选择所属项目" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="转化事件" name="adset_conversion_event" required>
        <a-select
          :disabled="disabled || isConversionEventDisabled"
          :options="conversionEventOption"
          placeholder="请选择转化事件"
          v-model:value="config.adset_conversion_event"
        />
      </a-form-item>
      <a-form-item label="国家" name="adset_country" required>
        <a-tree-select
          v-model:value="config.adset_country"
          style="width: 100%"
          tree-checkable
          :disabled="disabled"
          :treeDefaultExpandedKeys="['ALL']"
          :show-checked-strategy="TreeSelect.SHOW_PARENT"
          :tree-data="countryOption"
          tree-node-filter-prop="label"
          placeholder="请选择国家"
        >
        </a-tree-select>
      </a-form-item>
      <template v-if="hasEuCountry">
        <a-form-item label="欧盟受益方">
          <a-input :value="euBeneficiary" disabled />
        </a-form-item>
        <a-form-item label="欧盟付费方">
          <a-input :value="euBeneficiary" disabled />
        </a-form-item>
      </template>
      <template v-if="hasTwCountry">
        <a-form-item label="台湾受益方">
          <a-input :value="twSgBeneficiary" disabled />
        </a-form-item>
        <a-form-item label="台湾付费方">
          <a-input :value="twSgBeneficiary" disabled />
        </a-form-item>
      </template>
      <a-form-item label="新加坡受益方" v-if="hasSgCountry">
        <a-input :value="twSgBeneficiary" disabled />
      </a-form-item>
      <a-form-item label="年龄范围" required class="!mb-0">
        <div class="flex flex-1 gap-2">
          <a-form-item required class="flex-1" name="adset_age_min">
            <a-select
              :disabled="disabled"
              :options="ageRangeOptionMin"
              placeholder="请选择年龄"
              v-model:value="config.adset_age_min"
            />
          </a-form-item>

          <div class="text-center">-</div>
          <a-form-item required class="flex-1" name="adset_age_max">
            <a-select
              :disabled="disabled"
              :options="ageRangeOptionMax"
              placeholder="请选择年龄"
              v-model:value="config.adset_age_max"
            />
          </a-form-item>
        </div>
      </a-form-item>
      <a-form-item label="性别" name="adset_gender" required>
        <a-select
          :disabled="disabled"
          :options="genderOption"
          placeholder="请选择性别"
          v-model:value="config.adset_gender"
        />
      </a-form-item>
      <a-form-item label="设备" name="adset_device" required>
        <a-select
          :disabled="disabled"
          :options="platformOption"
          placeholder="请选择设备"
          v-model:value="config.adset_device"
        />
      </a-form-item>
      <a-form-item label="广告组预算（美金）" name="adset_budget">
        <a-input-number
          :disabled="disabled || isAdsetBudgetDisabled"
          v-model:value="config.adset_budget"
          :formatter="value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="value => value.replace(/\$\s?|(,*)/g, '')"
          class="blue !w-full"
          placeholder="请输入广告组预算（美金）"
          :controls="false"
          :min="1"
        />
      </a-form-item>
      <a-form-item label="广告" class="font-bold"></a-form-item>
      <a-form-item label="主页" name="ad_page_id" required>
        <a-select
          :disabled="disabled"
          placeholder="请选择主页"
          v-model:value="config.ad_page_id"
          :options="adPageIdOption"
        >
          <template #notFoundContent>
            <a-empty description="请先选择所属项目" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="文案" name="ad_message" required>
        <a-input v-model:value.trim="config.ad_message" :disabled="disabled" placeholder="请输入文案" />
      </a-form-item>

      <a-form-item label="标题" name="ad_title" required>
        <a-input v-model:value.trim="config.ad_title" :disabled="disabled" placeholder="请输入标题" />
      </a-form-item>
      <a-form-item label="链接" name="ad_link_url" required v-if="isAdLinkUrlVisible">
        <a-input v-model:value.trim="config.ad_link_url" :disabled="disabled" placeholder="请输入链接" />
      </a-form-item>
      <a-form-item label="行动号召" name="ad_call_to_action" required>
        <a-select
          :disabled="disabled"
          :options="actionOption"
          placeholder="请选择行动号召"
          v-model:value="config.ad_call_to_action"
        />
      </a-form-item>
      <a-form-item label="广告创建后自动投放" name="ad_status">
        <a-switch v-model:checked="config.ad_status" :disabled="disabled" :checkedValue="1" :unCheckedValue="0" />
      </a-form-item>
    </a-form>
    <div class="flex justify-center py-5 gap-2 sticky bottom-0 w-full bg-white">
      <a-button @click="goBack" v-if="disabled">返回</a-button>
      <template v-else>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSave">保存</a-button>
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </template>
    </div>
  </div>
</template>
<script>
import { scopedLoadingMixin } from '@/mixins/scopedLoadingMixin';
import { mapGetters } from 'vuex';
import * as Api from './api';
import {
  countryOption,
  weightOption,
  ageRangeOption,
  platformOption,
  campaignGoalOption,
  budgetTypeOption,
  appStoreOption,
  conversionEventOption,
  createTypeOption,
  allocateModeOption,
  businessModeOption,
  mergeTypeOption,
  materialTypeOption,
  filterTypeOption,
  actionOption,
  languageMethodOption,
  euCountry,
  euBeneficiary,
  twSgBeneficiary,
  languageOption
} from '@/utils/const';
import { PlusOutlined } from '@ant-design/icons-vue';
import { Empty, TreeSelect } from 'ant-design-vue';
import TaskTable from './components/task-table.vue';
import TaskHeaderInfo from './components/task-header-info.vue';
import * as conditionItemService from './services/conditionItemService';
import { tagLevelListByContentType, clearTagLevelListCache } from './services/tagService';
import { createTaskStrategy } from './services/taskStrategy';
import { expandCountryValues } from './services/countyService.js';
import { scrollToFirstErrorField, getMaterialAssignError, getLangAssignError } from './services/errorService.js';

export default {
  name: 'TaskForm',
  mixins: [scopedLoadingMixin],
  components: {
    PlusOutlined,
    TaskTable,
    TaskHeaderInfo,
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    }
  },
  data() {
    return {
      Api,
      Empty,
      TreeSelect,
      euBeneficiary,
      twSgBeneficiary,
      isCopyPage: false,
      isCreativeTypeDisabled: false,
      config: {
        business_mode: 1, // 默认展示 webob
        campaign_goal: 1, // 默认展示 销量
        adset_conversion_event: 1, // 默认展示 购物
        campaign_num: 1,
        campaign_name: '',
        condition: [{}],
        adset_country: [],
        adset_locale_info: [], // 指定统一语言
        is_skip_hook_bgm: 0,
        showValidation: false
      },
      disabled: this.$route.name == '查看任务',
      taskId: this.$route.params.id,
      pixelIdOption: [],
      adPageIdOption: [],
      adAccountOption: [],
      campaignOption: [],
      sourceAdsetOption: [],
      targetCampaignOption: [],
      countryOption,
      ageRangeOption,
      platformOption,
      campaignGoalOption,
      createTypeOption,
      budgetTypeOption,
      appStoreOption,
      actionOption,
      conversionEventOption,
      languageMethodOption,
      businessModeOption,
      mergeTypeOption,
      materialTypeOption,
      filterTypeOption,
      weightOption,
      allocateModeOption,
      fieldNames: {
        label: 'name',
        value: 'name',
        children: 'children'
      },
      hookTagOption: [],
      commonTagOption: [],
      activeKeys: [0, 1, 2, 3], // 默认全部展开
      taskType: 1, // 1 广告任务 2 成片素材任务 3 成片视频任务
      filmList: [], // 成片列表
      creativeOption: [], // 素材列表 for 成片素材
      videoOption: [], // 成片视频列表
      selfData: {
        current_list_options: []
      }, //自选拼接数据
      preCheckCount: 0, // 广告任务 预计拼接条数
      // 缓存每个素材库组的旧creative_type值
      oldCreativeTypes: {},
      taskStrategy: null,
      languageOption
    };
  },
  watch: {
    /** 像素ID 自动带入逻辑 */
    'config.adset_pixel_id': {
      handler(val) {
        if (this.pixelIdOption.length === 1 && !val) this.config.adset_pixel_id = this.pixelIdOption[0].value; // 自动带入
      }
    },
    /** 预算配置 */
    'config.budget_type': {
      handler(type) {
        if (type === 1) {
          this.config.adset_budget = null;
        } else {
          this.config.campaign_budget = null;
        }
      }
    },
    /** 广告创建方式 */
    'config.campaign_create_type': {
      handler(newVal, oldVal) {
        const vals = [newVal, oldVal];
        // 只要新旧值中包含3，且同时也包含1或2，即满足切换条件
        if (vals.includes(3) && vals.some(v => [1, 2].includes(v))) {
          this.resetAdset();
          this.resetAds();
        }
      }
    },
    'selfData.current_list': {
      handler(newVal, oldVal) {
        if (!oldVal || !newVal) return;
        const removedIds = oldVal.filter(id => !newVal.includes(id));
        if (removedIds.length > 0 && this.config.ad_assign_info) {
          this.config.ad_assign_info = this.config.ad_assign_info.map(group => {
            if (Array.isArray(group)) {
              return group.filter(id => !removedIds.includes(id));
            }
            return group;
          });
        }
      }
    },
    'tagLevelList'() {
      clearTagLevelListCache();
    }
  },
  computed: {
    isExpand() {
      return this.config.campaign_create_type === 2;
    },
    isUnifiedLangAllSelected() {
      const allValues = this.languageOption.map(o => o.value);
      const selected = this.config.adset_locale_info || [];
      return allValues.length > 0 && allValues.every(v => selected.includes(v));
    },
    loadSelectParams() {
      // 已选成片素材的 params
      return {
        status: 1,
        creative_type: 5,
        content_type: this.selfData.content_type
      };
    },
    showSearch() {
      return {
        limit: 999999,
        filter: (inputValue, path) => {
          return path.some(option => option.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
        }
      };
    },
    preCount() {
      if (this.taskType === 1) return this.preCheckCount || 0;
      return this.selfData?.current_list?.length || 0;
    },
    isAdLinkUrlVisible() {
      return !(this.config.business_mode === 2 && this.config.campaign_goal === 2);
    },
    isCampaignGoalDisabled() {
      // 广告目标禁用
      return this.config.business_mode !== 2;
    },
    isAdsBudgetDisabled() {
      // 广告预算禁用
      return this.config.budget_type !== 1;
    },
    isAdsetBudgetDisabled() {
      // 广告组预算禁用
      return this.config.budget_type !== 2;
    },
    isAppStoreDisabled() {
      // 移动应用商店禁用
      return this.config.business_mode !== 2 || this.config.campaign_goal !== 2;
    },
    isConversionEventDisabled() {
      // 转化事件禁用
      return this.config.business_mode !== 2;
    },
    isHasTargetCampaign() {
      // 是否有目标广告系列
      return !!this.config.copy_campaign_id;
    },
    ageRangeOptionMin() {
      const max = this.config.adset_age_max;
      if (!max) return this.ageRangeOption;
      return this.ageRangeOption.filter(item => item.value <= max);
    },
    ageRangeOptionMax() {
      const min = this.config.adset_age_min;
      if (!min) return this.ageRangeOption;
      return this.ageRangeOption.filter(item => item.value >= min);
    },
    projectOption() {
      return this.$store.getters.getProjectOption.filter(item => item.value != 0);
    },
    expandedAdsetCountry() {
      if (!this.config.adset_country || !this.config.adset_country.length) return [];
      return expandCountryValues(this.config.adset_country);
    },
    hasEuCountry() {
      return this.expandedAdsetCountry.some(code => euCountry.includes(code));
    },
    hasTwCountry() {
      return this.expandedAdsetCountry.includes('TW');
    },
    hasSgCountry() {
      return this.expandedAdsetCountry.includes('SG');
    },
    rules() {
      return {
        campaign_budget: { required: !this.isAdsBudgetDisabled, message: '请输入广告系列预算（美金）' },
        adset_budget: { required: !this.isAdsetBudgetDisabled, message: '请输入广告组预算（美金）' },
        adset_app_store: { required: !this.isAppStoreDisabled, message: '请选择移动应用商店' },
        ad_assign_type: { required: true, message: '请分配素材' }
      };
    },
    selectedMaterialOptions() {
      const ids = this.selfData.current_list || [];
      if (!ids.length) return [];

      const sources = [
        ...(this.videoOption || []),
        ...(this.creativeOption || []),
        ...(this.filmList || []),
        ...(this.selfData.current_list_options || []) // Assuming we might store options here later
      ];

      const map = new Map();
      sources.forEach(item => {
        if (item && item.id) {
          map.set(String(item.id), item);
        }
      });

      return ids.map(id => map.get(String(id))).filter(item => !!item);
    },
    materialAssignError() {
      if (!this.config.showValidation) return false;
      const { hasError } = getMaterialAssignError(this.config, this.selectedMaterialOptions);
      return hasError;
    },
    langAssignError() {
      if (!this.config.showValidation) return false;
      const { hasError } = getLangAssignError(this.config);
      return hasError;
    },
    ...mapGetters({
      authorOption: 'getAuthorOption',
      contentTypeOption: 'getContentTypeOption',
      creativeTypeOption: 'getCreativeTypeOption',
      genderOption: 'getGenderOption',
      langOption: 'getLangOption',
      tagLevelList: 'getTagLevelList',
      tailCreativeList: 'getTailCreativeList',
      musicCreativeList: 'getMusicCreativeList'
    })
  },
  created() {
    const { key } = this.$route.meta;
    this.isCopyPage = key === 'taskCopy';
    this.init();
    if (this.taskId) {
      this.getConfig();
    } else {
      this.initBaseInfo();
      this.getCommonConfig();
    }
  },
  methods: {
    async init() {
      const { type } = this.$route.params;
      // type: 1 广告任务 2 成片素材任务 3 成片视频任务
      this.taskType = Number(type);
      this.config.merge_type = this.taskType; // 初始化拼接类型
      this.taskStrategy = createTaskStrategy(this.taskType, this);
      // 广告任务 不需要带入成片列表
      if (this.taskType === 1) return;
      this.config.ad_assign_type = 1;
      this.selfData.creative_type = 5;
      const list = this.$store.getters.getFilmList;
      this.filmList = list;
      if (this.taskType === 2) {
        if (!this.taskId) {
          const ids = this.filmList.map(item => item.id);
          this.selfData.current_list = ids;
          this.selfData.content_type = this.filmList?.[0]?.content_type;
        }
      } else if (this.taskType === 3) {
        if (!this.taskId) {
          const ids = this.filmList.map(item => item.id);
          this.videoOption = this.filmList;
          this.selfData.current_list = ids;
        }
      }
    },
    initBaseInfo() {
      const taskBaseInfo = this.$store.getters.getTaskBaseInfo;
      if (taskBaseInfo && Object.keys(taskBaseInfo).length) {
        Object.assign(this.config, taskBaseInfo);
      }
    },
    // 获取切片素材的 params
    getCreativeParams(item) {
      return conditionItemService.getCreativeParams(item, this.config);
    },
    // 更新item的loadSelectParams
    updateItemParams(item) {
      conditionItemService.updateItemParams(item, this.config);
    },
    // 批量更新所有素材库组的params
    updateAllItemParams() {
      conditionItemService.updateAllItemParams(this.config.condition, this.config);
    },
    handleGenderChange(val) {
      // 投放人群性别切换
      conditionItemService.handleGenderChange(this.config.condition, val, this.config);
    },
    handleLangChange(val) {
      // 素材语言切换
      conditionItemService.handleLangChange(this.config.condition, val, this.config);
    },
    async handleAdAccountChange(type) {
      // 广告账户切换
      const { project_id, ad_account: ad_account_id } = this.config;
      if (!project_id || !ad_account_id) return;
      if (type !== 'echo') {
        this.config.campaign_list = null;
        this.config.copy_adset_id = null; // 清空 源ad-sets
        this.sourceAdsetOption = [];
        this.config.copy_campaign_id = null;
        this.targetCampaignOption = [];
        if (this.config.campaign_create_type === 2) this.resetCampaign();
        this.resetAdset();
      }
      this.campaignOption = [];
      this.targetCampaignOption = [];

      const { data } = await Api.getAccountCampaignList({ project_id, ad_account_id });
      if (data.error_code) return this.$message.error(data.error_desc);
      this.campaignOption = data.result;
      this.targetCampaignOption = data.result;
      if (this.config.campaign_list) {
        this.updateTargetCampaignOption(this.config.campaign_list);
      }
    },
    handleCampaignCreateTypeChange() {
      this.config.campaign_list = null;
      this.config.copy_adset_id = null; // 清空 源ad-sets
      this.sourceAdsetOption = [];
      this.config.copy_campaign_id = null;
      this.resetCampaign();
    },
    handleCampaignChange(_value, option) {
      const { campaign_name, campaign_goal, campaign_budget, budget_type } = option;
      if (budget_type === 1) this.config.adset_budget = null;
      else this.config.campaign_budget = null;
      this.config.campaign_name = campaign_name;
      this.config.campaign_goal = campaign_goal;
      this.config.campaign_budget = campaign_budget === 0 ? null : campaign_budget;
      this.config.budget_type = budget_type;
    },
    handleAllocateModeChange() {
      // 分配模式切换
      this.config.per_adset_ad_num = null;
    },
    resetCampaign() {
      // 重置广告系列
      this.config.campaign_name = null;
      this.config.campaign_goal = 1;
      this.config.campaign_budget = null;
      this.config.budget_type = null;
    },
    resetAdset() {
      // 重置广告组
      this.config.adset_app_store = null;
      this.config.adset_pixel_id = null;
      this.config.adset_conversion_event = 1;
      this.config.adset_country = [];
      this.config.adset_age_min = null;
      this.config.adset_age_max = null;
      this.config.adset_gender = null;
      this.config.adset_device = null;
      this.config.adset_budget = null;
    },
    resetAds() {
      // 重置广告
      this.config.ad_page_id = null;
      this.config.ad_message = null;
      this.config.ad_title = null;
      this.config.ad_link_url = null;
      this.config.ad_call_to_action = null;
      this.config.ad_status = 0;
    },
    handleCampaignGoalChange() {
      // 广告目标切换
      this.config.adset_app_store = null;
      this.config.ad_link_url = null;
    },
    handleContentTypeChange(item) {
      // 标签体系切换
      conditionItemService.handleContentTypeChange(item, this.config);
    },
    handleCreativeTypeChange(item, index) {
      // 素材库切换
      conditionItemService.handleCreativeTypeChange(
        item,
        index,
        this.oldCreativeTypes,
        this.tagLevelList,
        this.creativeTypeOption,
        this.config
      );
    },
    handleFilterTypeChange(item) {
      // 筛选方式改变
      conditionItemService.handleFilterTypeChange(item, this.config);
    },
    handleCreativeTimeChange(item) {
      conditionItemService.handleCreativeTimeChange(item);
    },
    handleLanguageMethodChange(val) {
      this.config.adset_locale_info = [];
    },
    handleSourceAdsetChange(val) {
      // 源ad-sets 切换
      const currAdset = { ...this.sourceAdsetOption?.find(item => item.adset_id === val) };
      currAdset.adset_country = currAdset.adset_country ? currAdset.adset_country?.replace(/GB/g, 'UK').split(',') : []; //国家
      currAdset.adset_device = currAdset.adset_device || null; // 设备
      currAdset.adset_app_store = currAdset.adset_app_store || null; // 应用商店
      currAdset.adset_pixel_id = currAdset.adset_pixel_id || null; // 像素ID
      currAdset.adset_budget = currAdset.adset_budget || null;
      // console.log(currAdset);
      this.config = {
        ...this.config,
        ...currAdset
      };
    },
    handleTargetCampaignChange(val) {
      const currCampaign = { ...this.targetCampaignOption?.find(item => item.campaign_id === val) };
      currCampaign.ad_link_url = currCampaign.ad_link_url || null;
      currCampaign.ad_page_id = currCampaign.ad_page_id || null;
      currCampaign.ad_call_to_action = currCampaign.ad_call_to_action || null;
      currCampaign.campaign_budget = currCampaign.campaign_budget || null;
      // console.log(currCampaign);
      this.config = {
        ...this.config,
        ...currCampaign
      };
    },
    getTagsOption(creative_type) {
      if (creative_type == 1) {
        return this.hookTagOption;
      } else {
        return this.commonTagOption;
      }
    },
    async getCommonConfig() {
      const { project_id, business_mode } = this.config;
      if (!project_id || !business_mode) return;
      try {
        const { data } = await Api.getCommonConfig({ project_id, business_mode }, 'common-config');
        if (data.error_code) return this.$message.error(data.error_desc);
        const { pixel_id, bm_id, ad_account_id, page_id } = data.result;
        this.config.ad_bm_id = bm_id || null;
        this.adPageIdOption = page_id || [];
        this.adAccountOption = ad_account_id || [];
        this.pixelIdOption = pixel_id || [];
        if (ad_account_id.length === 1) {
          this.config.ad_account = ad_account_id[0].value; // 自动带入
          this.handleAdAccountChange(); // 获取 campaign 名称
        }
        if (pixel_id.length === 1) this.config.adset_pixel_id = pixel_id[0].value; // 自动带入
      } catch (error) {
        console.error('获取公共配置失败:', error);
      }
    },
    getConfig() {
      Api.getTaskDetail({ id: this.taskId }).then(({ data }) => {
        if (data.error_code) return this.$message.error(data.error_desc);
        this.config = data.result;
        if (this.taskType === 1) {
          const { project_id, merge_type, condition } = data.result;
          this.preCheck({
            project_id,
            merge_type,
            condition
          });
        }
        const excludes = ['adset_gender', 'gender', 'is_skip_hook_bgm', 'is_image_watermark'];
        for (const key in this.config) {
          if ([0, '', '[]'].includes(this.config[key]) && !excludes.includes(key)) this.config[key] = null;
        }
        this.config.adset_gender = data.result.adset_gender >= 0 ? data.result.adset_gender : null;
        this.config.gender = data.result.gender >= 0 ? data.result.gender : null;
        this.config.adset_country = data.result.adset_country?.split(',') || [];
        try {
          if (data.result.adset_locale_info) {
            if (data.result.adset_locale_type === 2) {
              this.config.adset_locale_info = data.result.adset_locale_info.split(',');
            } else {
              this.config.adset_locale_info = JSON.parse(data.result.adset_locale_info).map(item => item.lang);
            }
          } else {
            this.config.adset_locale_info = [];
          }
          if (data.result.ad_assign_info) {
            this.config.ad_assign_info = JSON.parse(data.result.ad_assign_info)?.map(item =>
              item.creative_id ? item.creative_id.split(',').map(Number) : []
            );
          }
        } catch (error) {
          console.error('解析失败:', error);
          this.config.adset_locale_info = [];
          this.config.ad_assign_info = [];
        }
        if (this.isCopyPage) {
          /** 复制任务 校验项目是否一致 */
          const { project_id } = this.$store.getters.getTaskBaseInfo;
          this.isCreativeTypeDisabled = !!this.config.campaign_create_type;
          if (this.config.project_id !== project_id) {
            this.config.ad_account = null;
            this.config.campaign_list = null;
            this.config.copy_adset_id = null;
            this.config.copy_campaign_id = null;
            /** 若为复制广告组 */
            if (this.config.campaign_create_type === 3) {
              this.resetCampaign(); // 重置广告系列
              this.resetAdset(); // 重置广告组
              this.resetAds(); // 重置广告
            } else {
              this.config.adset_pixel_id = null;
              this.config.ad_page_id = null;
            }
          }
          this.initBaseInfo();
        }
        this.getCommonConfig();
        this.handleAdAccountChange('echo');
        this.handleSourceCampaignChange('echo');
        this.taskStrategy.initCondition(data.result);
        console.log(this.config, '任务详情');
      });
    },
    initItemActive(list) {
      // 初始化激活的item 全部展示
      this.activeKeys = list.map((_, index) => index);
    },
    addCondition() {
      const newItem = {};
      this.config.condition.push(newItem);
      this.activeKeys.push(this.config.condition.length - 1);
      this.updateItemParams(newItem);
    },
    copyCondition(index) {
      const item = JSON.parse(JSON.stringify(this.config.condition[index]));
      const newItem = {
        ...item,
        total: 0, // 预计拼接条数 置空
        isCopy: true
      };
      this.config.condition.push(newItem);
      const newIndex = this.config.condition.length - 1;
      this.activeKeys.push(newIndex);
      // 初始化新索引的缓存
      this.oldCreativeTypes[newIndex] = newItem.creative_type;
      this.updateItemParams(newItem);
    },
    removeCondition(index) {
      this.$confirm({
        title: '信息确认',
        content: '确认要删除吗？',
        onOk: () => {
          this.config.condition.splice(index, 1);
          if (this.activeKeys.includes(index)) {
            this.activeKeys = this.activeKeys.filter(key => key !== index);
            if (this.activeKeys.length === 0 && this.config.condition.length > 0) {
              this.activeKeys = [Math.max(0, index - 1)];
            }
          }
        }
      });
    },
    clearStore() {
      this.$store.commit('setFilmList', []); // 置空组
      this.$store.commit('setTaskBaseInfo', {}); // 置空任务基础信息
    },
    handleCancel() {
      this.clearStore();
      this.$router.push({ name: 'TaskList' });
    },
    goBack() {
      this.clearStore();
      this.$router.go(-1);
    },
    async handlePreCheck(index) {
      // 预校验
      try {
        await this.$refs.form.validateFields(['project_id']);
        let hasError = this.taskStrategy.validateCondition(index);
        const tip = index >= 0 ? `请完善当前素材库组必填信息` : `素材库组配置不完整，请检查`;
        if (hasError) return this.$message.error(tip);
        const { project_id, merge_type } = this.config;
        const condition = this.taskStrategy.buildCondition(index);
        this.preCheck(
          {
            project_id,
            merge_type,
            condition
          },
          index
        );
      } catch (error) {
        console.error('预校验失败:', error);
        this.$message.error('请选择所属项目');
        scrollToFirstErrorField();
      }
    },
    async preCheck(params, index) {
      const { data } = await Api.taskPreCheck(params, `pre-check-${index}`);
      if (data.error_code) return this.$message.error(data.error_desc);
      const { total } = data.result;
      if (index >= 0) this.config.condition[index].total = total;
      else this.preCheckCount = total;
    },
    prepareSubmitData(is_submit) {
      let hookCondition = null;
      if (this.taskType === 1) {
        hookCondition = this.config?.condition && this.config.condition.find(item => item.creative_type === 4);
      }
      const is_skip_hook_bgm = hookCondition?.is_skip_hook_bgm ? 1 : 0;
      const params = {
        ...this.config,
        is_skip_hook_bgm,
        is_submit,
        adset_country: expandCountryValues(this.config.adset_country).join(','),
        condition: this.taskStrategy.buildCondition()
      };
      if (params.adset_locale_info) {
        // 语言分配
        if (params.adset_locale_type === 2) {
          params.adset_locale_info = params.adset_locale_info.map(item => item).join(',');
        } else {
          params.adset_locale_info = JSON.stringify(
            params.adset_locale_info.map((item, index) => ({ index, lang: item }))
          );
        }
      }
      if (params.ad_assign_info) {
        // 素材分配
        params.ad_assign_info = JSON.stringify(
          params.ad_assign_info.map((item, index) => ({ index, creative_id: item.join(',') }))
        );
      }
      delete params.condition_data_list;
      if (this.taskId) params.id = this.taskId;
      if (this.isCopyPage) delete params.id;
      return params;
    },
    async handleSave() {
      // 保存
      try {
        await this.$refs.form.validateFields(['task_name']);
        const params = this.prepareSubmitData(0);
        console.log(params, '保存参数');
        const { data } = await Api.createTask(params);
        if (data.error_code) {
          this.$message.error(data.error_desc);
          return;
        }
        this.$message.success('保存成功');
        this.clearStore();
        this.$router.replace({
          name: '编辑任务',
          params: {
            id: data.result.id,
            type: data.result.merge_type
          }
        });
      } catch (error) {
        console.error(error);
        this.$message.error('配置不完整，请检查');
        scrollToFirstErrorField();
      }
    },
    handleSubmit() {
      // 提交
      if (this.taskType !== 1) {
        const hasError = this.taskStrategy.validateCondition();
        if (hasError) {
          this.$message.error(`${['已选成片素材', '已选成片视频'][this.taskType - 2]}配置不完整，请检查`);
          return;
        }

        this.config.showValidation = false;

        // 校验分配素材
        if (this.config.ad_assign_type === 2) {
          const { hasError, errorType } = getMaterialAssignError(this.config, this.selectedMaterialOptions);
          if (hasError) {
            this.config.showValidation = true;
            if (errorType === 'empty') {
              this.$message.error('请分配素材');
            } else if (errorType === 'incomplete') {
              this.$message.error(`已选成片${['素材', '视频'][this.taskType - 2]}未被完全分配，请检查`);
            }
            scrollToFirstErrorField();
            return;
          }
        }
      }
      // 校验语言分配
      if (this.config.adset_locale_type === 3) {
        const { hasError } = getLangAssignError(this.config);
        if (hasError) {
          this.config.showValidation = true;
          this.$message.error('请指定不同语言');
          scrollToFirstErrorField();
          return;
        }
      }
      this.$refs.form
        .validate()
        .then(() => {
          this.$confirm({
            title: '信息确认',
            content: '确认要提交吗？',
            onOk: () => {
              const params = this.prepareSubmitData(1);
              Api.createTask(params)
                .then(({ data }) => {
                  if (data.error_code) return this.$message.error(data.error_desc);
                  this.$message.success('提交成功，开始执行任务');
                  this.clearStore();
                  this.$router.push({ name: 'TaskList' });
                })
                .catch(() => {
                  this.$message.error('提交失败');
                });
            }
          });
        })
        .catch(error => {
          console.error(error);
          this.$message.error('配置不完整，请检查');
          scrollToFirstErrorField();
        });
    },
    async getCreativeList(params, scopeOverride) {
      // 如果传入了自定义 scope，使用它；否则使用默认的
      const scope = scopeOverride || 'creative-list';
      const res = await Api.getCreativeList(params, scope);
      return res.data.result.creative_list;
    },
    tagLevelListByContentType(item) {
      return tagLevelListByContentType(this.tagLevelList, this.creativeTypeOption, item);
    },
    creativeListByContentType(item) {
      // 根据标签体系返回对应的素材列表
      const { content_type, creative_type } = item;
      if (!content_type) return [];
      const sourceList = creative_type == 3 ? this.tailCreativeList : this.musicCreativeList;
      return sourceList.filter(creative => creative.content_type === content_type);
    },
    updateTargetCampaignOption(sourceCampaignId) {
      if (!this.campaignOption || this.campaignOption.length === 0) return;

      const list = [...this.campaignOption];
      if (sourceCampaignId) {
        const index = list.findIndex(item => item.campaign_id === sourceCampaignId);
        if (index > -1) {
          const item = { ...list[index], isSource: true };
          list.splice(index, 1);
          list.unshift(item);
        }
      }
      this.targetCampaignOption = list;
    },
    async handleSourceCampaignChange(type) {
      if (type !== 'echo') {
        this.config.copy_adset_id = null; // 清空 源ad-sets
        this.sourceAdsetOption = []; // 清空 源ad-sets 选项
        this.resetAdset(); // 重置广告组
      }
      const project_id = this.config.project_id;
      const campaign_id = this.config.campaign_list;
      this.updateTargetCampaignOption(campaign_id);
      if (!campaign_id || !project_id) return;
      const { data } = await Api.getAdsetList({
        project_id,
        campaign_id
      });
      if (data.error_code) return this.$message.error(data.error_desc);
      this.sourceAdsetOption = data.result;
    },
    toggleUnifiedLangSelectAll() {
      const allValues = this.languageOption.map(o => o.value);
      if (this.isUnifiedLangAllSelected) {
        const removeSet = new Set(allValues);
        this.config.adset_locale_info = (this.config.adset_locale_info || []).filter(v => !removeSet.has(v));
      } else {
        const s = new Set(this.config.adset_locale_info || []);
        allValues.forEach(v => s.add(v));
        this.config.adset_locale_info = Array.from(s);
      }
    }
  }
};
</script>

<style scoped lang="scss">
:deep(.ant-collapse-header) {
  align-items: center !important;
}
:deep(.skip-hook-bgm) {
  label:after {
    content: '';
  }
}
.highlight-error-field {
  position: relative;

  &::after {
    content: '';
    display: block;
    position: absolute;
    width: calc(100% - 40px);
    height: 100%;
    left: 0;
    bottom: 4px;
    margin: 0 20px;
    animation: highlightError 1.2s ease-in-out;
    border-radius: 8px;
    box-shadow: 0 0 0 rgba(255, 0, 0, 0);
    transition: all 2s ease;
  }
}

@keyframes highlightError {
  0% {
    box-shadow: 0 0 0 rgba(255, 0, 0, 0);
  }

  30% {
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.3);
  }

  70% {
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.3);
  }

  100% {
    box-shadow: 0 0 0 rgba(255, 0, 0, 0);
  }
}
</style>
