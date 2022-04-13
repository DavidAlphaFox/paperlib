<template>
    <q-dialog v-model="isFeedEditViewShown" @hide="onClose" transition-show="fade" transition-hide="fade" transition-duration="100" >
        <q-card flat style="width: 500px; height: 145px" class="q-pa-none edit-view">
            <EditTextField label="Feed Name" :value="feedDraft.name" @update:model-value="(value) => onUpdate('title', value)"/>
            <EditTextField label="Feed URL" :value="feedDraft.url" @update:model-value="(value) => onUpdate('authors', value)"/>
            <div class="row justify-end q-ml-sm q-mr-sm">
                <q-btn
                    class="col-2"
                    unelevated
                    no-caps
                    size="small"
                    text-color="primary"
                    label="Close"
                    @click="onClose()"
                />
                <q-btn
                    class="col-2"
                    unelevated
                    no-caps
                    size="small"
                    text-color="primary"
                    label="Save"
                    @click="onSave()"
                />
            </div>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';

import EditTextField from './components/TextField.vue';

import { FeedSubscriptionDraft } from '../../models/FeedSubscription';

export default defineComponent({
  name: 'FeedEditView',

  components: {
    EditTextField,
  },

  setup(props, {emit}) {
    const isFeedEditViewShown = ref(false);
    const feedDraft = ref(new FeedSubscriptionDraft());

    window.systemInteractor.registerState('viewState.isFeedEditViewShown', (event, message) => {
      isFeedEditViewShown.value = JSON.parse(message as string) as boolean;
    });

    window.systemInteractor.registerState('sharedData.editFeedDraft', (event, message) => {
      feedDraft.value = JSON.parse(message as string) as FeedSubscriptionDraft;
    });

    const onClose = () => {
      window.systemInteractor.setState('viewState.isFeedEditViewShown', false);
    };

    const onSave = () => {
      void window.entityInteractor.updateFeed(JSON.stringify([feedDraft.value]));
      window.systemInteractor.setState('viewState.isFeedEditViewShown', false);
    };

    const onUpdate = (propName: string, value: unknown) => {
      feedDraft.value[propName] = value;
    };

    return {
      isFeedEditViewShown,
      feedDraft,
      onUpdate,
      onClose,
      onSave,
      ...toRefs(props),
    };
  },
});
</script>
