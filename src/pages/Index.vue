<template>
  <q-page id="mainView" class="flex flex-center">
    <div class="column items-center">
      <img
        class="center"
        src="../assets/icon.png"
        style="width: 50px; height: 50px"
      />
      <div class="col q-mb-md">
        Drop the sqlite db file to here for migration.
      </div>
      <div v-if="show" class="col q-mb-md">
        Removed duplicated papers: {{ dupCount }}
      </div>
      <div v-if="show" class="col">
        {{ noFile.length }} papers has no files:
      </div>
      <div v-if="show" class="col">
        <q-scroll-area style="height: 150px; width: 700px">
          <q-list dense>
            <q-item v-for="title in noFile" :key="title">
              <span style="font-size: 0.9em"> - {{ title }} </span>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import dragDrop from "drag-drop";

export default defineComponent({
  name: "PageIndex",

  setup() {
    const dupCount = ref(0);
    const noFile = ref([]);
    const show = ref(false);

    const dropEvent = () => {
      dragDrop("#mainView", {
        onDrop: async (files, pos, fileList, directories) => {
          let [dc, nf] = await window.api.migrate(files[0].path);
          dupCount.value = dc;
          noFile.value = nf;

          show.value = true;
        },
      });
    };

    onMounted(() => {
      dropEvent();
    });

    return {
      dupCount,
      noFile,
      show,
    };
  },
});
</script>
