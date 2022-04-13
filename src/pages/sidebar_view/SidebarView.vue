<template>
    <div class="sidebar absolute-full" :style="{'background-color': backgroundColor}">
        <WindowControl />

        <q-list dense class="sidebar-list q-pl-md q-pr-md">
            <q-item dense class="sidebar-list-title">
                <span>Library</span>
            </q-item>

            <CategorizerItem
              label="All Papers"
              icon="bi-collection"
              :count="entitiesCount"
              :showCount="showSidebarCount"
              :withSpinner="true"
              :active="selectedSideItem === 'lib-all'"
              @click="onSelectedSideItem('lib-all')"
            />
            <CategorizerItem
              label="Flags"
              icon="bi-flag"
              :withSpinner="false"
              :active="selectedSideItem === 'lib-flaged'"
              @click="onSelectedSideItem('lib-flaged')"
            />

            <FeedCollopseGroup
              label="Subscriptions"
              icon="bi-disc"
              :showCount="showSidebarCount"
              :feeds="feeds"
              :selectedSideItem="selectedSideItem"
              @select-side-item="onSelectedSideItem"
            />

            <CategorizerCollopseGroup
              label="Tags"
              icon="bi-tag"
              :showCount="showSidebarCount"
              :categorizers="tags"
              categorizerType="tag"
              :selectedSideItem="selectedSideItem"
              @select-side-item="onSelectedSideItem"
            />

            <CategorizerCollopseGroup
              label="Folders"
              icon="bi-folder"
              :showCount="showSidebarCount"
              :categorizers="folders"
              categorizerType="folder"
              :selectedSideItem="selectedSideItem"
              @select-side-item="onSelectedSideItem"
            />

        </q-list>
    </div>

</template>

<style lang="sass">
@import '../../css/sidebar.scss'
</style>

<script lang="ts">
import {defineComponent, toRefs, ref} from 'vue';
import WindowControl from './components/WindowControl.vue';
import CategorizerItem from './components/CategorizerItem.vue';
import CategorizerCollopseGroup from './components/CategorizerCollopseGroup.vue';
import FeedCollopseGroup from './components/FeedCollopseGroup.vue';

export default defineComponent({
  name: 'SidebarView',

  components: {
    WindowControl,
    CategorizerItem,
    CategorizerCollopseGroup,
    FeedCollopseGroup,
  },

  props: {
    tags: Array,
    folders: Array,
    feeds: Array,
    selectedSideItem: String,
    showSidebarCount: Boolean,
  },

  setup(props, {emit}) {
    const entitiesCount = ref(0);
    const backgroundColor = ref('none')

    if (window.systemInteractor.platform() !== 'darwin') {
      backgroundColor.value = 'var(--q-bg-secondary)'
    }

    const onSelectedSideItem = (sideItem: string) => {
      window.systemInteractor.setState('selectionState.selectedSideItem', JSON.stringify(sideItem));
    };

    window.systemInteractor.registerState('viewState.entitiesCount', (event, message) => {
      entitiesCount.value = JSON.parse(message as string) as number;
    });

    return {
      entitiesCount,
      backgroundColor,
      onSelectedSideItem,
      ...toRefs(props),
    };
  },

});
</script>
