<template>
  <div>
    <q-item clickable class="sidebar-list-title" @click="onCollopse">
        <q-icon
            v-if="!isCollopsed"
            class="q-mr-sm"
            name="bi-chevron-down"
        />
        <q-icon
            v-if="isCollopsed"
            class="q-mr-sm"
            name="bi-chevron-right"
        />
        <span> {{ label }} </span>
        <q-menu touch-position context-menu>
            <q-list dense style="min-width: 50px">
                <q-item clickable v-close-popup @click="onFeedAddClicked">
                    <q-item-section style="font-size: 0.9em; color: var(--q-text)">
                        Add
                    </q-item-section>
                </q-item>
            </q-list>
        </q-menu>
    </q-item>

    <q-item
        clickable
        dense
        class="sidebar-list-item"
        active-class="sidebar-list-item-active"
        v-show="!isCollopsed"
        v-for="feed in feeds"
        :key="'feed-' + feed.name"
        :active="selectedSideItem === 'feed-' + feed.name"
        @click="onSelectSideItemInGroup('feed-' + feed.name)"
    >
        <q-icon
            class="q-ml-sm q-mr-sm sidebar-list-icon"
            :name=icon
        />
        <span class="sidebar-list-text"> {{ feed.name }} </span>
        <q-badge
          rounded class="absolute-right q-mr-sm sidebar-list-badge"
          :label="feed.count"
          v-if="showCount"
        />
        <q-menu touch-position context-menu>
            <q-list dense style="min-width: 50px">
                <q-item clickable v-close-popup @click="refreshFeed(feed)">
                    <q-item-section style="font-size: 0.9em; color: var(--q-text)">
                        Refresh
                    </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteFeed(feed)">
                    <q-item-section style="font-size: 0.9em; color: var(--q-text)">
                        Delete
                    </q-item-section>
                </q-item>
            </q-list>
        </q-menu>
    </q-item>
  </div>
</template>

<style lang="sass">
@import 'src/css/sidebar.scss'
</style>

<script lang="ts">
import { FeedSubscription, FeedSubscriptionDraft } from 'src/models/FeedSubscription';
import {defineComponent, ref, toRefs} from 'vue';

export default defineComponent({
  name: 'FeedCollopseGroup',
  props: {
    label: String,
    icon: String,
    feeds: Array,
    selectedSideItem: String,
    showCount: Boolean,
  },
  emits: ['select-side-item'],
  setup(props, {emit}) {
    const isCollopsed = ref(false);

    const onCollopse = () => {
      isCollopsed.value = !isCollopsed.value;
    };

    const onSelectSideItemInGroup = (feed: string) => {
      emit('select-side-item', feed);
    };

    const refreshFeed = (feed: FeedSubscription) => {
        // 123
    };

    const deleteFeed = (feed: FeedSubscription) => {
    //   if (props.categorizerType === 'tag') {
    //     window.entityInteractor.deleteCategorizer(categorizer.name, 'PaperTag');
    //   } else {
    //     window.entityInteractor.deleteCategorizer(categorizer.name, 'PaperFolder');
    //   }
    };

    const onFeedAddClicked = () => {
      window.systemInteractor.setState('sharedData.editFeedDraft', JSON.stringify(new FeedSubscriptionDraft()));
      window.systemInteractor.setState('viewState.isFeedEditViewShown', JSON.stringify(true));
    };

    return {
      isCollopsed,
      onCollopse,
      onSelectSideItemInGroup,
      refreshFeed,
      deleteFeed,
      onFeedAddClicked,
      ...toRefs(props),
    };
  },
});
</script>
